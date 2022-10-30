const errors = require("../../error/ErrorMessage");
const winston = require('winston')

const GRANT_TYPE_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const CONTENT_TYPE_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const SUBJECT_TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:jwt';

function ensureRequiredParametersPresent(req) {
    if (!req.body.grant_type) {
        winston.error(errors.ERROR_MISSING_GRANT_TYPE);
        throw Error(errors.ERROR_MISSING_GRANT_TYPE);
    }
    if (!req.body.client_id) {
        winston.error(errors.ERROR_MISSING_CLIENT_ID);
        throw Error(errors.ERROR_MISSING_CLIENT_ID);
    }
    if (!req.body.subject_token) {
        winston.error(errors.ERROR_MISSING_SUBJECT_TOKEN);
        throw Error(errors.ERROR_MISSING_SUBJECT_TOKEN);
    }
    if (!req.body.subject_token_type) {
        winston.error(errors.ERROR_MISSING_SUBJECT_TOKEN_TYPE)
        throw Error(errors.ERROR_MISSING_SUBJECT_TOKEN_TYPE);
    }
}

function ensureParametersAreValid(req) {
    if (req.get('Content-Type') !== CONTENT_TYPE_X_WWW_FORM_URLENCODED) {
        winston.error('Unsupported Content-Type: %s', req.get('Content-Type'))
        throw Error(errors.ERROR_UNSUPPORTED_CONTENT_TYPE);
    }
    if (req.body.grant_type !== GRANT_TYPE_TOKEN_EXCHANGE) {
        winston.error('Unsupported grant-type: %s', req.body.grant_type)
        throw Error(errors.ERROR_UNSUPPORTED_GRANT_TYPE);
    }
    if (req.body.subject_token_type !== SUBJECT_TOKEN_TYPE_JWT) {
        winston.error('Unsupported subject_token_type: %s', req.body.subject_token_type)
        throw Error(errors.ERROR_UNSUPPORTED_SUBJECT_TOKEN_TYPE);
    }
}

function validateRequest(req) {
    ensureRequiredParametersPresent(req)
    ensureParametersAreValid(req)
}

module.exports = {
    validateRequest
}