const validatorService = require('../../src/service/validator/OAuthRequestValidatorService')
const errors = require('../../src/error/ErrorMessage')
const {getClone} = require("../util/TestUtil");

jest.mock('winston');

const GRANT_TYPE_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const GRANT_TYPE_CLIENT_CREDENTIALS = 'client_credentials';
const TEST_CLIENT_ID = 'TEST_CLIENT';
const TEST_SCOPE = 'scopeA scopeB';
const TEST_SUBJECT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const SUBJECT_TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:jwt';
const SUBJECT_TOKEN_TYPE_ACCESS_TOKEN = 'urn:ietf:params:oauth:token-type:access_token';
const CONTENT_TYPE_JSON = 'application/json';
const CONTENT_TYPE_X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const VALID_REQUEST = {
    body: {
        grant_type: GRANT_TYPE_TOKEN_EXCHANGE,
        client_id: TEST_CLIENT_ID,
        scope: TEST_SCOPE,
        subject_token: TEST_SUBJECT_TOKEN,
        subject_token_type: SUBJECT_TOKEN_TYPE_JWT
    }
}

beforeEach(() => jest.resetAllMocks());

test('Given invalid content-type When validate Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.get = () => {
        return CONTENT_TYPE_JSON;
    };
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_UNSUPPORTED_CONTENT_TYPE)
})

test('Given missing grant type When validateRequest Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.body.grant_type = null;
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_MISSING_GRANT_TYPE);
})

test('Given missing client id When validateRequest Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.body.client_id = null;
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_MISSING_CLIENT_ID)
})

test('Given missing subject_token When validateRequest Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.body.subject_token = null;
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_MISSING_SUBJECT_TOKEN)
})

test('Given missing subject_token_type When validateRequest Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.body.subject_token_type = null;
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_MISSING_SUBJECT_TOKEN_TYPE)
})

test('Given grant type is not token-exchange When validateRequest Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.get = () => {
        return CONTENT_TYPE_X_WWW_FORM_URLENCODED
    };
    req.body.grant_type = GRANT_TYPE_CLIENT_CREDENTIALS;
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_UNSUPPORTED_GRANT_TYPE);
})

test('Given subject token type is not JWT When validateRequest Expect Error', () => {
    let req = getClone(VALID_REQUEST);
    req.get = () => {
        return CONTENT_TYPE_X_WWW_FORM_URLENCODED
    };
    req.body.subject_token_type = SUBJECT_TOKEN_TYPE_ACCESS_TOKEN;
    expect(() => validatorService.validateRequest(req))
        .toThrow(errors.ERROR_UNSUPPORTED_SUBJECT_TOKEN_TYPE);
})

test('Given valid request parameters When validateRequest Expect no errors thrown', async () => {
    let req = getClone(VALID_REQUEST);
    req.get = () => {
        return CONTENT_TYPE_X_WWW_FORM_URLENCODED
    };
    expect(validatorService.validateRequest(req)).resolves;
});