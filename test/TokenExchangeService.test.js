const exchangeService = require('../src/service/TokenExchangeService')
const error = require('../src/error/ErrorMessage')
const repository = require('../src/repository/MemoryAuthzRepository')
const {getValidatedSubjectTokenInfo} = require('../src/service/SubjectTokenValidatorService');

jest.mock('../src/repository/MemoryAuthzRepository')
jest.mock('../src/service/SubjectTokenValidatorService')
jest.mock('winston')

const TEST_CLIENT = 'TEST_CLIENT';
const TEST_SECRET = 'TEST_SECRET';
const TEST_APP_ID = 'TEST_APP';
const GRANT_TYPE_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:jwt';
const TEST_SUBJECT_TOKEN = 'eyJraWQiOiJwaEVoOW9uZFg4dDFDcVZBU0I1R3RXTUtHYWJtdXdVUHhmbU1HSm84TmRBPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoieXNlNnFXZmJqSDA1blBJTkJ4YUJvQSIsInN1YiI6Ijg1ZTJhNzAwLWZiOGUtNDdiYi05NzBmLWEzYmNjNTI3NTk2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV91OWh2UUF3Mm0iLCJjb2duaXRvOnVzZXJuYW1lIjoicnlhbiIsIm9yaWdpbl9qdGkiOiJkNDQwMTMwYS0xZmY2LTRlYzAtOGUzNy04MTViNGVlZmJiY2EiLCJhdWQiOiJmaDlva2VnbnZnMGozbmo3Ym80M2VtNTR1IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2NjQwODQ0NDMsImV4cCI6MTY2NDA4ODA0MywiaWF0IjoxNjY0MDg0NDQzLCJhcHBSb2xlcyI6InVzZXIgYWRtaW4iLCJqdGkiOiIzYzViYmM3Ni1hZjQ4LTQwMmEtYjdjNy1jYWM3ZmIxODFkZjciLCJlbWFpbCI6InJhbGxlbjM4ODJAZ21haWwuY29tIn0.lVq0sOqFB9XZxHl1Lv0ww9CR_0vxm2KXz9CbxnAMuNrygJTpXycWGgLUvwwvZ-wn02EwIR1HMy8-PcjyOEPOT6IesF9InWnsKmqNAqSZvaL6v8m7eYB36QRAGDQ41D_v0I7kk1qYAunMbKubCsnxHqOXu2v9bz8ufUbbQHF8IKj5LZPTeez04IyBfSLFN-7FEjgWXOshdy4GJULDkzGKUnPuZOp14gQElaGPTvEo_qKhcrCIOt8titmli3Kn1ZeGvC7LrcljREouENdn3Qh8TL_k5oZDVp7mRotCYgh6iMyiLFYZlBBvLPG8ks7-2Wl_IGqepbUN9Sx1bn_tHHJ1KA';
const TEST_APP_CLIENT = {clientId: TEST_CLIENT, secret: TEST_SECRET, appId: TEST_APP_ID}
const TEST_APP_GRANT = {appId: TEST_APP_ID, grantType: GRANT_TYPE_TOKEN_EXCHANGE}

beforeEach(() => jest.resetAllMocks());

test('Given unknown client When exchangeToken Expect Error invalid_client', async () => {
    repository.AppClient.findByPk.mockResolvedValueOnce(null);
    await expect(
        () => exchangeService.exchangeToken(
            GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT))
        .rejects.toThrow(error.ERROR_INVALID_CLIENT);
})

test('Given client not authorized for grant_type When exchangeToken Expect Error unauthorized_client', async () => {
    repository.AppClient.findByPk.mockResolvedValueOnce(TEST_APP_CLIENT);
    repository.AppGrant.findByPk.mockResolvedValueOnce(null);
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT))
        .rejects.toThrow(error.ERROR_UNAUTHORIZED_GRANT_TYPE);
})

test('Given invalid subject token When exchangeToken Expect Error invalid_grant', async () => {
    repository.AppClient.findByPk.mockResolvedValueOnce(TEST_APP_CLIENT);
    repository.AppGrant.findByPk.mockResolvedValueOnce(TEST_APP_GRANT);
    getValidatedSubjectTokenInfo.mockImplementationOnce(
        jest.fn().mockRejectedValueOnce(new Error(error.ERROR_VALIDATING_SUBJECT_TOKEN)));
    await expect(() => exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT))
        .rejects.toThrow(error.ERROR_VALIDATING_SUBJECT_TOKEN);
});

test('Given valid input When exchangeToken Expect null FOR NOW', async () => {
    repository.AppClient.findByPk.mockResolvedValueOnce(TEST_APP_CLIENT);
    repository.AppGrant.findByPk.mockResolvedValueOnce(TEST_APP_GRANT);
    getValidatedSubjectTokenInfo.mockResolvedValueOnce(null);
    await expect(exchangeService.exchangeToken(
        GRANT_TYPE_TOKEN_EXCHANGE, TEST_CLIENT, TEST_SUBJECT_TOKEN, SUBJECT_TOKEN_TYPE_JWT))
        .resolves
        .toEqual(null);
});