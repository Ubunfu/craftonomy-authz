const errors = {
    ERROR_UNSUPPORTED_CONTENT_TYPE: 'invalid_request: unsupported content type',
    ERROR_MISSING_GRANT_TYPE: 'invalid_request: missing grant_type',
    ERROR_MISSING_CLIENT_ID: 'invalid_request: missing client_id',
    ERROR_MISSING_SUBJECT_TOKEN: 'invalid_request: missing subject_token',
    ERROR_MISSING_SUBJECT_TOKEN_TYPE: 'invalid_request: missing subject_token_type',
    ERROR_UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
    ERROR_UNSUPPORTED_SUBJECT_TOKEN_TYPE: 'invalid_request: unsupported subject_token_type',
    ERROR_INVALID_CLIENT: 'invalid_client',
    ERROR_UNAUTHORIZED_GRANT_TYPE: 'unauthorized_client: grant_type unauthorized for client',
    ERROR_VALIDATING_SUBJECT_TOKEN: 'invalid_grant: error validating subject token',
    ERROR_READING_OIDC_CONFIG: 'internal_server_error: unable to read oidc config',
    ERROR_GETTING_SIGNING_KEY: 'invalid_grant: error getting signing key',
}

module.exports = errors;