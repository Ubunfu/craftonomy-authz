const error = require('../../error/ErrorMessage')
const repository = require('../../db/AuthzRepository')
const winston = require('winston')

const LOG_APP_CLIENT_NOT_FOUND = 'AppClient not found by clientId: %s';
const LOG_APP_GRANT_NOT_FOUND = 'AppGrant not found by appId: %s and grantType: %s';
const LOG_IDP_NOT_FOUND = 'Idp not found by issuerUrl: %s';
const LOG_APP_IDP_NOT_FOUND = 'AppIdp not found by appId: %s and idpId: %s';

async function findAppClient(clientId) {
    let appClient = await repository.AppClient.findByPk(clientId);
    if (!appClient) {
        winston.error(LOG_APP_CLIENT_NOT_FOUND, clientId);
        throw Error();
    }
    return appClient;
}

async function findAppGrant(appId, grantType) {
    let appGrant = await repository.AppGrant.findOne({
        where: {
            appId, grantType
        }});
    if (!appGrant) {
        winston.error(LOG_APP_GRANT_NOT_FOUND, grantType, appId);
        throw Error();
    }
    return appGrant;
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
    const appIdp = await repository.AppIdp.findOne({ where: {
        appId, idpId
    }});
    if (!appIdp) {
        winston.error(LOG_APP_IDP_NOT_FOUND, appId, idpId);
        throw Error();
    }
    return appIdp;
}

async function findUserScopesByEmail(email) {
    return await repository.UserScope.findAll({where: {email: email}});
}

async function saveUserScope(email, scope) {
    await repository.UserScope.create({
        email, scope
    });
}

module.exports = {
    findAppClient,
    findAppGrant,
    findIdpByIssuerUrl,
    findAppIdp,
    findUserScopesByEmail,
    saveUserScope,
}