const error = require('../error/ErrorMessage')
const repository = require('../repository/MemoryAuthzRepository')
const winston = require('winston')
const {getValidatedSubjectTokenInfo} = require('./SubjectTokenValidatorService');

const LOG_INVALID_CLIENT = 'Invalid client ID: %s';
const LOG_UNAUTHORIZED_GRANT = 'Grant type %s not authorized for client %s';

async function getAppClient(clientId) {
    let appClient = await repository.AppClient.findByPk(clientId);
    if (!appClient) {
        winston.error(LOG_INVALID_CLIENT, clientId);
        throw Error(error.ERROR_INVALID_CLIENT);
    }
    return appClient;
}

async function validateGrantAuthorizedForClient(clientId, grantType) {
    let appGrant = await repository.AppGrant.findByPk(clientId, grantType);
    if (!appGrant) {
        winston.error(LOG_UNAUTHORIZED_GRANT, grantType, clientId);
        throw Error(error.ERROR_UNAUTHORIZED_GRANT_TYPE);
    }
}

async function exchangeToken(grantType, clientId, subjectToken, subjectTokenType) {
    const appClient = await getAppClient(clientId);
    await validateGrantAuthorizedForClient(clientId, grantType);
    await getValidatedSubjectTokenInfo(subjectToken);
    // TODO
    return null;
}

module.exports = {
    exchangeToken
}