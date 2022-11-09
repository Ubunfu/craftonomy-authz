const error = require('../../error/ErrorMessage')
const winston = require('winston')
const subjectTokenValidator = require('../validator/SubjectTokenValidatorService');
const tokenBuilder = require("./TokenBuilderService");
const db = require('../db/DatabaseService');

const LOG_INVALID_CLIENT = 'Invalid client ID: %s';
const LOG_UNAUTHORIZED_GRANT = 'Grant type %s not authorized for app: %s';
const LOG_UNKNOWN_ISSUER = 'IDP not found by issuer: %s';
const LOG_UNAUTHORIZED_IDP = 'IDP: %s not authorized for app: %s';

const TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:jwt';
const TOKEN_TYPE_BEARER = 'bearer';

async function findAppClient(clientId) {
    try {
        return await db.findAppClient(clientId);
    } catch (e) {
        winston.error(LOG_INVALID_CLIENT, clientId);
        throw Error(error.ERROR_INVALID_CLIENT);
    }
}

async function validateGrantAuthorizedForApp(appId, grantType) {
    try {
        return await db.findAppGrant(appId, grantType);
    } catch (e) {
        winston.error(LOG_UNAUTHORIZED_GRANT, grantType, appId);
        throw Error(error.ERROR_UNAUTHORIZED_GRANT_TYPE);
    }
}

async function findIdpByIssuerUrl(issuerUrl) {
    try {
        return await db.findIdpByIssuerUrl(issuerUrl);
    } catch (e) {
        winston.error(LOG_UNKNOWN_ISSUER, issuerUrl);
        throw Error(error.ERROR_UNKNOWN_IDP);
    }
}

async function findAppIdpByPk(appId, idpId) {
    try {
        return await db.findAppIdp(appId, idpId);
    } catch (e) {
        winston.error(LOG_UNAUTHORIZED_IDP, idpId, appId);
        throw Error(error.ERROR_INVALID_APP_IDP);
    }
}

async function validateAppAuthorizedForIdp(appId, issuerUrl) {
    const idp = await findIdpByIssuerUrl(issuerUrl);
    await findAppIdpByPk(appId, idp.idpId);
}

async function registerDefaultUserScopes(email) {
    const defaultUserScopes = process.env.DEFAULT_SCOPES.split(',');
    for (const scope of defaultUserScopes) {
        await db.saveUserScope(email, scope);
    }
    return defaultUserScopes;
}

async function findUserScopesByEmail(email) {
    let userScopes = await db.findUserScopesByEmail(email);
    if (userScopes.length === 0) {
        // user must not be registered
        userScopes = await registerDefaultUserScopes(email);
        return userScopes.join(" ");
    }
    return userScopes
        // map each object to it's 'scope' field
        .map((userScope) => userScope.scope)
        .join(" ");
}

async function buildTokenResponse(token, scopes) {
    return {
        access_token: token,
        issued_token_type: TOKEN_TYPE_JWT,
        token_type: TOKEN_TYPE_BEARER,
        expires_in: parseInt(process.env.CLAIMS_TOKEN_VALIDITY_SEC),
        scope: scopes
    };
}

async function exchangeToken(grantType, clientId, subjectToken, subjectTokenType) {
    const appClient = await findAppClient(clientId);
    await validateGrantAuthorizedForApp(appClient.appId, grantType);
    const subjectTokenInfo = await subjectTokenValidator.getValidatedSubjectTokenInfo(subjectToken);
    await validateAppAuthorizedForIdp(appClient.appId, subjectTokenInfo.issuer);
    const userScopes = await findUserScopesByEmail(subjectTokenInfo.email);
    const token = await tokenBuilder.buildAccessToken(
        clientId, subjectTokenInfo.email, subjectTokenInfo.subject, subjectTokenInfo.username, userScopes);
    return await buildTokenResponse(token, userScopes);
}

module.exports = {
    exchangeToken
}