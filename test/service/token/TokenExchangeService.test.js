const exchangeService = require('../../../src/service/token/TokenExchangeService')
const error = require('../../../src/error/ErrorMessage')
const {getValidatedIDTokenInfo} = require('../../../src/service/validator/IDTokenValidatorService');
const {buildAccessToken} = require('../../../src/service/token/TokenBuilderService')
const dbService = require('../../../src/service/db/DatabaseService');


jest.mock('../../../src/service/validator/IDTokenValidatorService')
jest.mock('../../../src/service/token/TokenBuilderService')
jest.mock('../../../src/service/db/DatabaseService')
jest.mock('winston')

const TEST_CLIENT = 'TEST_CLIENT';
const TEST_SECRET = 'TEST_SECRET';
const TEST_APP_ID = 'TEST_APP';
const TEST_EMAIL = 'user@mail.com';
const TEST_USERNAME = 'userA';
const GRANT_TYPE_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const TEST_SUBJECT_TOKEN = 'testRefreshToken';
const SUBJECT_TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:refresh-token';
const TEST_ID_TOKEN = 'eyJraWQiOiJwaEVoOW9uZFg4dDFDcVZBU0I1R3RXTUtHYWJtdXdVUHhmbU1HSm84TmRBPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoieXNlNnFXZmJqSDA1blBJTkJ4YUJvQSIsInN1YiI6Ijg1ZTJhNzAwLWZiOGUtNDdiYi05NzBmLWEzYmNjNTI3NTk2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV91OWh2UUF3Mm0iLCJjb2duaXRvOnVzZXJuYW1lIjoicnlhbiIsIm9yaWdpbl9qdGkiOiJkNDQwMTMwYS0xZmY2LTRlYzAtOGUzNy04MTViNGVlZmJiY2EiLCJhdWQiOiJmaDlva2VnbnZnMGozbmo3Ym80M2VtNTR1IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2NjQwODQ0NDMsImV4cCI6MTY2NDA4ODA0MywiaWF0IjoxNjY0MDg0NDQzLCJhcHBSb2xlcyI6InVzZXIgYWRtaW4iLCJqdGkiOiIzYzViYmM3Ni1hZjQ4LTQwMmEtYjdjNy1jYWM3ZmIxODFkZjciLCJlbWFpbCI6InJhbGxlbjM4ODJAZ21haWwuY29tIn0.lVq0sOqFB9XZxHl1Lv0ww9CR_0vxm2KXz9CbxnAMuNrygJTpXycWGgLUvwwvZ-wn02EwIR1HMy8-PcjyOEPOT6IesF9InWnsKmqNAqSZvaL6v8m7eYB36QRAGDQ41D_v0I7kk1qYAunMbKubCsnxHqOXu2v9bz8ufUbbQHF8IKj5LZPTeez04IyBfSLFN-7FEjgWXOshdy4GJULDkzGKUnPuZOp14gQElaGPTvEo_qKhcrCIOt8titmli3Kn1ZeGvC7LrcljREouENdn3Qh8TL_k5oZDVp7mRotCYgh6iMyiLFYZlBBvLPG8ks7-2Wl_IGqepbUN9Sx1bn_tHHJ1KA';
const TEST_APP_CLIENT = {clientId: TEST_CLIENT, secret: TEST_SECRET, appId: TEST_APP_ID}
const TEST_APP_GRANT = {appId: TEST_APP_ID, grantType: GRANT_TYPE_TOKEN_EXCHANGE};
const TEST_ISSUER_URL = 'https://tokenissuer.com';
const TEST_DEFAULT_SCOPES = 'scope.read';
const VALIDATED_ID_TOKEN_INFO = {
    email: TEST_EMAIL,
    username: TEST_USERNAME,
    issuer: TEST_ISSUER_URL,
    subject: '85e2a700-fb8e-47bb-970f-a3bcc5275962',
    keyId: 'testKid',
}
const TEST_IDP = {idpId: '1', issuerUrl: TEST_ISSUER_URL}
const TEST_APP_IDP = {appId: TEST_APP_ID, idpId: '1'};
const TEST_USER_SCOPES = [{email: TEST_EMAIL, scope: 'scope1'}, {email: TEST_EMAIL, scope: 'scope2'}];
const TEST_ACCESS_TOKEN = 'testToken';
const TEST_TOKEN_RESPONSE = {
    access_token: TEST_ACCESS_TOKEN,
    expires_in: 1800,
    issued_token_type: "urn:ietf:params:oauth:token-type:jwt",
    scope: "scope1 scope2",
    token_type: "bearer"
}
const TEST_TOKEN_RESPONSE_DEFAULT_SCOPES = {
    access_token: TEST_ACCESS_TOKEN,
    expires_in: 1800,
    issued_token_type: "urn:ietf:params:oauth:token-type:jwt",
    scope: TEST_DEFAULT_SCOPES,
    token_type: "bearer"
}

beforeEach(() => {
    jest.resetAllMocks()
    dbService.findAppClient.mockResolvedValueOnce(TEST_APP_CLIENT);
    dbService.findAppGrant.mockResolvedValueOnce(TEST_APP_GRANT);
    getValidatedIDTokenInfo.mockResolvedValueOnce(VALIDATED_ID_TOKEN_INFO);
    dbService.findIdpByIssuerUrl.mockResolvedValueOnce(TEST_IDP);
    dbService.findAppIdp.mockResolvedValueOnce(TEST_APP_IDP);
    dbService.findUserScopesByEmail.mockResolvedValueOnce(TEST_USER_SCOPES);
    buildAccessToken.mockResolvedValueOnce(TEST_ACCESS_TOKEN);
    process.env.CLAIMS_TOKEN_VALIDITY_SEC = 1800;
    process.env.DEFAULT_SCOPES = TEST_DEFAULT_SCOPES;
});

test('Given unknown client When exchangeToken Expect Error invalid_client', async () => {
    dbService.findAppClient.mockReset();
    dbService.findAppClient.mockRejectedValue(null);
    await expect(
        () => exchangeService.exchangeToken(
            GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .rejects.toThrow(error.ERROR_INVALID_CLIENT);
})

test('Given app not authorized for grant_type When exchangeToken Expect Error unauthorized_client', async () => {
    dbService.findAppGrant.mockReset();
    dbService.findAppGrant.mockRejectedValue(null);
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .rejects.toThrow(error.ERROR_UNAUTHORIZED_GRANT_TYPE);
})

test('Given invalid ID token When exchangeToken Expect Error invalid_grant', async () => {
    getValidatedIDTokenInfo.mockReset();
    getValidatedIDTokenInfo.mockImplementationOnce(
        jest.fn().mockRejectedValueOnce(new Error(error.ERROR_VALIDATING_ID_TOKEN)));
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .rejects.toThrow(error.ERROR_VALIDATING_ID_TOKEN);
});

test('Given unknown IDP When exchangeToken Expect Error invalid_target', async () => {
    dbService.findIdpByIssuerUrl.mockReset();
    dbService.findIdpByIssuerUrl.mockRejectedValue(null);
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .rejects.toThrow(error.ERROR_UNKNOWN_IDP);
});

test('Given app not linked to IDP When exchangeToken Expect Error invalid_target', async () => {
    dbService.findAppIdp.mockReset();
    dbService.findAppIdp.mockRejectedValue(null);
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .rejects.toThrow(error.ERROR_INVALID_APP_IDP);
});

test('Given error building access token When exchangeToken Expect Error internal_server_error', async () => {
    buildAccessToken.mockReset();
    buildAccessToken.mockImplementationOnce(
        jest.fn().mockRejectedValueOnce(new Error(error.ERROR_BUILDING_TOKEN)));
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .rejects.toThrow(error.ERROR_BUILDING_TOKEN);
});

test('Given no user scopes registered When exchangeToken Expect default scopes added and token issued', async () => {
    dbService.findUserScopesByEmail.mockReset();
    dbService.findUserScopesByEmail.mockResolvedValueOnce([]);
    await expect(exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .resolves
        .toEqual(TEST_TOKEN_RESPONSE_DEFAULT_SCOPES);
});

test('Given valid input When exchangeToken Expect token issued', async () => {
    await expect(exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT, TEST_ID_TOKEN))
        .resolves
        .toEqual(TEST_TOKEN_RESPONSE);
});