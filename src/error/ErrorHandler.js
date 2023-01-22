const errors = require("./ErrorMessage");

function is400InvalidRequest(message) {
    return [
        errors.ERROR_MISSING_GRANT_TYPE,
        errors.ERROR_MISSING_CLIENT_ID,
        errors.ERROR_MISSING_SUBJECT_TOKEN,
        errors.ERROR_MISSING_SUBJECT_TOKEN_TYPE,
        errors.ERROR_UNSUPPORTED_SUBJECT_TOKEN_TYPE,
        errors.ERROR_UNSUPPORTED_CONTENT_TYPE
    ].indexOf(message) >= 0;
}

function is400InvalidClient(message) {
    return [
        errors.ERROR_INVALID_CLIENT
    ].indexOf(message) >= 0;
}

function is400InvalidGrant(message) {
    return [
        errors.ERROR_GETTING_SIGNING_KEY,
        errors.ERROR_VALIDATING_ID_TOKEN
    ].indexOf(message) >= 0;
}

function is400unauthorizedClient(message) {
    return [
        errors.ERROR_UNAUTHORIZED_GRANT_TYPE
    ].indexOf(message) >= 0;
}

function is400UnsupportedGrantType(message) {
    return [
        errors.ERROR_UNSUPPORTED_GRANT_TYPE
    ].indexOf(message) >= 0;
}

function is400InvalidScope(message) {
    return [
        errors.ERROR_NO_USER_SCOPES
    ].indexOf(message) >= 0;
}

function is400InvalidTarget(message) {
    return [
        errors.ERROR_UNKNOWN_IDP
    ].indexOf(message) >= 0;
}

function handle(error, res) {
    if (is400InvalidRequest(error.message)) {
        res.status(400)
            .send({
                error: 'invalid_request'
            });
    } else if (is400InvalidClient(error.message)) {
        res.status(400)
            .send({
                error: 'invalid_client'
            });
    } else if (is400InvalidGrant(error.message)) {
        res.status(400)
            .send({
                error: 'invalid_grant'
            });
    } else if (is400unauthorizedClient(error.message)) {
        res.status(400)
            .send({
                error: 'unauthorized_client'
            });
    } else if (is400UnsupportedGrantType(error.message)) {
        res.status(400)
            .send({
                error: 'unsupported_grant_type'
            });
    } else if (is400InvalidScope(error.message)) {
        res.status(400)
            .send({
                error: 'invalid_scope'
            });
    } else if (is400InvalidTarget(error.message)) {
        res.status(400)
            .send({
                error: 'invalid_target'
            });
    } else {
        res.status(500)
            .send({
                error: 'internal_server_error'
            });
    }
}

module.exports = {handle}