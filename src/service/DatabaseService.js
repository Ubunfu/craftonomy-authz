const error = require('../error/ErrorMessage')
const repository = require('../repository/MemoryAuthzRepository')
const winston = require('winston')

const LOG_APP_CLIENT_NOT_FOUND = 'AppClient not found by clientId: %s';
const LOG_APP_GRANT_NOT_FOUND = 'AppGrant not found by appId: %s and grantType: %s';
const LOG_IDP_NOT_FOUND = 'Idp not found by issuerUrl: %s';
const LOG_APP_IDP_NOT_FOUND = 'AppIdp not found by appId: %s and idpId: %s';
const LOG_USER_SCOPES_NOT_FOUND = 'UserScopes not found by email: %s';

async function findAppClient(clientId) {
    let appClient = await repository.AppClient.findByPk(clientId);
    if (!appClient) {
        winston.error(LOG_APP_CLIENT_NOT_FOUND, clientId);
        throw Error();
    }
    return appClient;
}

async function findAppGrant(appId, grantType) {
    let appGrant = await repository.AppGrant.findByPk(appId, grantType);
    if (!appGrant) {
        winston.error(LOG_APP_GRANT_NOT_FOUND, grantType, appId);
        throw Error();
    }
}

async function findIdpByIssuerUrl(issuerUrl) {
    const idp = await repository.Idp.findOne({where: {issuerUrl: issuerUrl}});
    if (!idp) {
        winston.error(LOG_IDP_NOT_FOUND, issuerUrl);
        throw Error();
    }
    return idp;
}

async function findAppIdp(appId, idpId) {
    const appIdp = await repository.AppIdp.findByPk(appId, idpId);
    if (!appIdp) {
        winston.error(LOG_APP_IDP_NOT_FOUND, appId, idpId);
        throw Error();
    }
    return appIdp;
}

async function findUserScopesByEmail(email) {
    const userScopes = await repository.UserScope.findAll({where: {email: email}});
    if (!userScopes) {
        winston.error(LOG_USER_SCOPES_NOT_FOUND, email);
        throw Error(error.ERROR_NO_USER_SCOPES);
    }
    return userScopes;
}

module.exports = {
    findAppClient,
    findAppGrant,
    findIdpByIssuerUrl,
    findAppIdp,
    findUserScopesByEmail,
}