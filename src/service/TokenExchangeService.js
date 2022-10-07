const error = require('../error/ErrorMessage')
const repository = require('../repository/MemoryAuthzRepository')
const winston = require('winston')
const {getValidatedSubjectTokenInfo} = require('./SubjectTokenValidatorService');
const {buildAccessToken} = require("./TokenBuilderService");

const LOG_INVALID_CLIENT = 'Invalid client ID: %s';
const LOG_UNAUTHORIZED_GRANT = 'Grant type %s not authorized for app: %s';
const LOG_UNKNOWN_ISSUER = 'IDP not found by issuer: %s';
const LOG_UNAUTHORIZED_IDP = 'IDP: %s not authorized for app: %s';
const LOG_NO_USER_SCOPES = 'No scopes found for user identified by email: %s';

const TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:jwt';
const TOKEN_TYPE_BEARER = 'bearer';
const EXPIRES_IN_1800 = 1800;

async function getAppClient(clientId) {
    let appClient = await repository.AppClient.findByPk(clientId);
    if (!appClient) {
        winston.error(LOG_INVALID_CLIENT, clientId);
        throw Error(error.ERROR_INVALID_CLIENT);
    }
    return appClient;
}

async function validateGrantAuthorizedForApp(appId, grantType) {
    let appGrant = await repository.AppGrant.findByPk(appId, grantType);
    if (!appGrant) {
        winston.error(LOG_UNAUTHORIZED_GRANT, grantType, appId);
        throw Error(error.ERROR_UNAUTHORIZED_GRANT_TYPE);
    }
}

async function findIdpByIssuerUrl(issuerUrl) {
    const idp = await repository.Idp.findOne({where: {issuerUrl: issuerUrl}});
    if (!idp) {
        winston.error(LOG_UNKNOWN_ISSUER, issuerUrl);
        throw Error(error.ERROR_UNKNOWN_IDP);
    }
    return idp;
}

async function findAppIdpByPk(appId, idpId) {
    const appIdp = await repository.AppIdp.findByPk(appId, idpId);
    if (!appIdp) {
        winston.error(LOG_UNAUTHORIZED_IDP, idpId, appId);
        throw Error(error.ERROR_INVALID_APP_IDP);
    }
    return appIdp;
}

async function validateAppAuthorizedForIdp(appId, issuerUrl) {
    const idp = await findIdpByIssuerUrl(issuerUrl);
    await findAppIdpByPk(appId, idp.idpId);
}

async function findUserScopesByEmail(email) {
    const userScopes = await repository.UserScope.findAll({where: {email: email}});
    if (!userScopes) {
        winston.error(LOG_NO_USER_SCOPES, email);
        throw Error(error.ERROR_NO_USER_SCOPES);
    }
    return userScopes
        .map((userScope) => userScope.scope)
        .join(" ");
}

async function buildTokenResponse(token, scopes) {
    return {
        access_token: token,
        issued_token_type: TOKEN_TYPE_JWT,
        token_type: TOKEN_TYPE_BEARER,
        expires_in: EXPIRES_IN_1800,
        scope: scopes
    };
}

async function exchangeToken(grantType, clientId, subjectToken, subjectTokenType) {
    const appClient = await getAppClient(clientId);
    await validateGrantAuthorizedForApp(appClient.appId, grantType);
    const subjectTokenInfo = await getValidatedSubjectTokenInfo(subjectToken);
    await validateAppAuthorizedForIdp(appClient.appId, subjectTokenInfo.issuer);
    const userScopes = await findUserScopesByEmail(subjectTokenInfo.email);
    const token = await buildAccessToken(
        clientId, subjectTokenInfo.email, subjectTokenInfo.subject, subjectTokenInfo.username, userScopes);
    return await buildTokenResponse(token, userScopes);
}

module.exports = {
    exchangeToken
}