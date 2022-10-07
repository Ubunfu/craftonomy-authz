const validatorService = require('../src/service/SubjectTokenValidatorService');
const error = require('../src/error/ErrorMessage');
const axios = require('axios');
const jwksProviderService = require('../src/service/JwksProviderService')
const jsonwebtoken = require('jsonwebtoken');
const winston = require('winston')

const TEST_SUBJECT_TOKEN = 'eyJraWQiOiJwaEVoOW9uZFg4dDFDcVZBU0I1R3RXTUtHYWJtdXdVUHhmbU1HSm84TmRBPSIsImFsZyI6IkhTMjU2In0.eyJhdF9oYXNoIjoieXNlNnFXZmJqSDA1blBJTkJ4YUJvQSIsInN1YiI6Ijg1ZTJhNzAwLWZiOGUtNDdiYi05NzBmLWEzYmNjNTI3NTk2MiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV91OWh2UUF3Mm0iLCJjb2duaXRvOnVzZXJuYW1lIjoicnlhbiIsIm9yaWdpbl9qdGkiOiJkNDQwMTMwYS0xZmY2LTRlYzAtOGUzNy04MTViNGVlZmJiY2EiLCJhdWQiOiJmaDlva2VnbnZnMGozbmo3Ym80M2VtNTR1IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2NjQwODQ0NDMsImV4cCI6MTY2NDA4ODA0MywiaWF0IjoxNjY0MDg0NDQzLCJqdGkiOiIzYzViYmM3Ni1hZjQ4LTQwMmEtYjdjNy1jYWM3ZmIxODFkZjciLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIn0.q0_NP_gIHzByO4L_AwcF9h8l7QD1ifgF3ug43O2ZK9c';
const TEST_SUBJECT_TOKEN_INVALID = 'sdf';
const TEST_SUBJECT_TOKEN_SUB = '85e2a700-fb8e-47bb-970f-a3bcc5275962';
const TEST_SIGNING_KEY = 'testSigningKey';
const TEST_OIDC_CONFIG_RESP = {
    data: {
        issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u9hvQAw2m",
        jwks_uri: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u9hvQAw2m/.well-known/jwks.json",
    }
}
const TEST_JWKS_RESP = {
    data: {
        keys: [{
            alg: "RS256",
            e: "AQAB",
            kid: "phEh9ondX8t1CqVASB5GtWMKGabmuwUPxfmMGJo8NdA=",
            kty: "RSA",
            n: "sR283yoEtaaQ6_B4tZb079KxRCr86PQloHIcWnTp6GTlrpYYYe_ctYgz1HIvK6DMZmXQ3BxWLGli7GnfvaBst6R1MEXenf4tIBauKjTbt6XqdGEQVymr1VO2Eco0339MJrstiD49hfbPkKA3SYsxwkoRHuP1VXurnn1UvDTmQfBJ5nUdXGAi_xA1Ftw6CXKFdxZQ8V2umwALvPEQJkVZtvz2z-9o8qvR2HxPSLkOOp8uiwrcazAmN2NWCQ3CM8Xl-bjlGQYSiN91WRmO4LjiGdUw4ysB_CKDPUlUK5GfILcSYa2WDDZ0XUq1-R1k8x378BSD30lHVJkFyOSof9avOw",
            use: "sig"
        }]
    }
}
const TEST_SUBJECT_TOKEN_DECODED = {
    header: {
        kid: "phEh9ondX8t1CqVASB5GtWMKGabmuwUPxfmMGJo8NdA="
    },
    payload: {
        iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u9hvQAw2m",
        sub: "85e2a700-fb8e-47bb-970f-a3bcc5275962",
    }
}

jest.mock('axios');
jest.mock('winston')
jest.mock('../src/service/JwksProviderService');
jest.mock('jsonwebtoken');

beforeEach(() => jest.resetAllMocks())

test('Given subject token not a JWT When getValidatedSubjectTokenInfo Expect Error invalid_grant', async () => {
    await expect(() => validatorService.getValidatedSubjectTokenInfo(TEST_SUBJECT_TOKEN_INVALID))
        .rejects.toThrow(error.ERROR_VALIDATING_SUBJECT_TOKEN);
});

test('Given error getting OIDC config info When getValidatedSubjectTokenInfo Expect Error invalid_grant', async () => {
    axios.get.mockImplementationOnce(jest.fn().mockRejectedValueOnce(new Error()));
    jwksProviderService.getSigningKey.mockImplementationOnce(jest.fn().mockRejectedValueOnce());
    await expect(() => validatorService.getValidatedSubjectTokenInfo(TEST_SUBJECT_TOKEN))
        .rejects.toThrow(error.ERROR_VALIDATING_SUBJECT_TOKEN);
});

test('Given error getting signing key When getValidatedSubjectTokenInfo Expect Error invalid_grant', async () => {
    axios.get.mockResolvedValueOnce(TEST_OIDC_CONFIG_RESP);
    jwksProviderService.getSigningKey.mockImplementationOnce(jest.fn().mockRejectedValueOnce());
    await expect(() => validatorService.getValidatedSubjectTokenInfo(TEST_SUBJECT_TOKEN))
        .rejects.toThrow(error.ERROR_VALIDATING_SUBJECT_TOKEN);
});

test('Given subject token signature invalid When getValidatedSubjectTokenInfo Expect error invalid_grant', async () => {
    axios.get.mockResolvedValueOnce(TEST_OIDC_CONFIG_RESP);
    jwksProviderService.getSigningKey.mockResolvedValueOnce(TEST_SIGNING_KEY);
    jsonwebtoken.verify.mockImplementationOnce(jest.fn().mockRejectedValueOnce(new Error()));
    await expect(() => validatorService.getValidatedSubjectTokenInfo(TEST_SUBJECT_TOKEN))
        .rejects.toThrow(error.ERROR_VALIDATING_SUBJECT_TOKEN);
});

test('Given valid subject token When getValidatedSubjectTokenInfo Expect returns info', async () => {
    axios.get.mockResolvedValueOnce(TEST_OIDC_CONFIG_RESP);
    jsonwebtoken.decode.mockResolvedValueOnce(TEST_SUBJECT_TOKEN_DECODED);
    jsonwebtoken.verify.mockResolvedValueOnce(null);
    jwksProviderService.getSigningKey.mockResolvedValueOnce(TEST_SIGNING_KEY);
    await expect(validatorService.getValidatedSubjectTokenInfo(TEST_SUBJECT_TOKEN))
        .resolves.toEqual({
            issuer: TEST_OIDC_CONFIG_RESP.data.issuer,
            subject: TEST_SUBJECT_TOKEN_SUB,
            keyId: TEST_JWKS_RESP.data.keys[0].kid,
        });
});