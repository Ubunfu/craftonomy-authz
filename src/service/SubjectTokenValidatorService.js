const winston = require("winston");
const error = require("../error/ErrorMessage");
const {decode, verify} = require("jsonwebtoken");
const axios = require("axios");
const jwksProviderService = require('./JwksProviderService');

const LOG_ERROR_PARSING_SUBJECT_TOKEN = 'Unable to parse subject token: %s';
const LOG_ERROR_VALIDATING_SUBJECT_TOKEN = 'Unable to validate subject token: %s';
const LOG_ERROR_READING_OIDC_CONFIG = 'Error reading OIDC config from %s: %s';
const LOG_ERROR_SIG_INVALD = 'Signature invalid for subject token: %s and signing key: %s - %s';

async function getOidcConfig(issuer) {
    const oidcConfigUrl = issuer + '/.well-known/openid-configuration';
    try {
        winston.debug('Reading OIDC config from %s', oidcConfigUrl);
        const oidcConfigResp = await axios.get(oidcConfigUrl);
        winston.debug('Read OIDC data: %s', JSON.stringify(oidcConfigResp));
        return oidcConfigResp.data;
    } catch (e) {
        winston.error(JSON.stringify(e));
        winston.error(LOG_ERROR_READING_OIDC_CONFIG, oidcConfigUrl, e.message);
        throw Error(error.ERROR_READING_OIDC_CONFIG);
    }
}

async function getSubjectTokenInfo(subjectToken) {
    try {
        const token = await decode(subjectToken, { complete: true, json: true });
        return {
            email: token.payload.email,
            username: token.payload['cognito:username'],
            issuer: token.payload.iss,
            subject: token.payload.sub,
            keyId: token.header.kid,
        };
    } catch (e) {
        winston.error(LOG_ERROR_PARSING_SUBJECT_TOKEN, subjectToken);
        winston.error('Error is: %s', e.message);
        throw e;
    }
}

async function validateSignature(subjectToken, subjectTokenInfo, oidcConfig) {
    winston.debug('Reading remote signing key %s from %s', subjectTokenInfo.keyId, oidcConfig.jwks_uri);
    const signingKey = await jwksProviderService.getSigningKey(oidcConfig.jwks_uri, subjectTokenInfo.keyId);
    try {
        winston.debug('Verifying signature using key: %s and token: %s', subjectTokenInfo.keyId, signingKey);
        verify(subjectToken, signingKey, { algorithms: ['RS256'] });
    } catch (e) {
        winston.error(LOG_ERROR_SIG_INVALD, subjectToken, signingKey, e.message);
        throw Error(error.ERROR_VALIDATING_SUBJECT_TOKEN);
    }
}

async function getValidatedSubjectTokenInfo(subjectToken) {
    try {
        const subjectTokenInfo = await getSubjectTokenInfo(subjectToken);
        const oidcConfig = await getOidcConfig(subjectTokenInfo.issuer);
        await validateSignature(subjectToken, subjectTokenInfo, oidcConfig);
        return subjectTokenInfo;
    } catch (e) {
        winston.error(LOG_ERROR_VALIDATING_SUBJECT_TOKEN, subjectToken);
        throw Error(error.ERROR_VALIDATING_SUBJECT_TOKEN);
    }
}

module.exports = {
    getValidatedSubjectTokenInfo
}