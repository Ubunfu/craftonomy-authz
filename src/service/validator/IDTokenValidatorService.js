const winston = require("winston");
const error = require("../../error/ErrorMessage");
const jsonwebtoken = require("jsonwebtoken");
const axios = require("axios");
const jwksProviderService = require('../jwk/JwksProviderService');

const LOG_ERROR_PARSING_ID_TOKEN = 'Unable to parse ID token: %s';
const LOG_ERROR_VALIDATING_ID_TOKEN = 'Unable to validate ID token: %s - %s';
const LOG_ERROR_READING_OIDC_CONFIG = 'Error reading OIDC config from %s: %s';

async function getOidcConfig(issuer) {
    const oidcConfigUrl = issuer + '/.well-known/openid-configuration';
    try {
        winston.debug('Reading OIDC config from %s', oidcConfigUrl);
        const oidcConfigResp = await axios.get(oidcConfigUrl);
        winston.debug('Read OIDC data: %s', JSON.stringify(oidcConfigResp.data));
        return oidcConfigResp.data;
    } catch (e) {
        winston.error(JSON.stringify(e));
        winston.error(LOG_ERROR_READING_OIDC_CONFIG, oidcConfigUrl, e.message);
        throw Error(error.ERROR_READING_OIDC_CONFIG);
    }
}

async function getIDTokenInfo(idToken) {
    try {
        const token = await jsonwebtoken.decode(idToken, { complete: true, json: true });
        return {
            email: token.payload.email,
            username: token.payload['cognito:username'],
            issuer: token.payload.iss,
            subject: token.payload.sub,
            keyId: token.header.kid,
        };
    } catch (e) {
        winston.error(LOG_ERROR_PARSING_ID_TOKEN, idToken);
        winston.error('Error is: %s', e.message);
        throw e;
    }
}

async function validateIDToken(idToken, idTokenInfo, oidcConfig) {
    winston.debug('Reading remote signing key %s from %s', idTokenInfo.keyId, oidcConfig.jwks_uri);
    const signingKey = await jwksProviderService.getSigningKey(oidcConfig.jwks_uri, idTokenInfo.keyId);
    winston.debug('Verifying token using key: %s and token: %s', idTokenInfo.keyId, signingKey);
    await jsonwebtoken.verify(idToken, signingKey, { algorithms: ['RS256'] });
}

async function getValidatedIDTokenInfo(idToken) {
    try {
        const idTokenInfo = await getIDTokenInfo(idToken);
        const oidcConfig = await getOidcConfig(idTokenInfo.issuer);
        await validateIDToken(idToken, idTokenInfo, oidcConfig);
        return idTokenInfo;
    } catch (e) {
        winston.error(LOG_ERROR_VALIDATING_ID_TOKEN, idToken, e.message);
        throw Error(error.ERROR_VALIDATING_ID_TOKEN);
    }
}

module.exports = {
    getValidatedIDTokenInfo: getValidatedIDTokenInfo
}