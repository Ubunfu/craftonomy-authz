const tokenBuilderService = require('../../../src/service/token/TokenBuilderService');
const keyProvider = require("../../../src/service/jwk/SigningKeyProvider");
const winston = require('winston')
const fs = require("fs");
const jsonwebtoken = require('jsonwebtoken');

const TEST_CLIENT = 'client1';
const TEST_EMAIL = 'email1';
const TEST_SUBJECT = 'subject1';
const TEST_USER = 'user1';
const TEST_SCOPES = 'scope1 scope2';
const TEST_ISSUER = 'https://token.issuer.com';
const TEST_AUDIENCE = 'https://token.audience.com';

jest.mock('winston')
jest.mock("../../../src/service/jwk/SigningKeyProvider");

beforeEach(() => {
    process.env.CLAIMS_TOKEN_VALIDITY_SEC = 1800;
    process.env.CLAIMS_ISS = TEST_ISSUER;
    process.env.CLAIMS_AUD = TEST_AUDIENCE;
    keyProvider.getSigningKey.mockImplementation(
        jest.fn(async () =>  {
            return {
                id: '1',
                data: await fs.readFileSync('signingKey.pem')
            }
        }));
});

test('Given any parameters missing When buildAccessToken Expect Error missing input', async () => {
    await expect(() => tokenBuilderService.buildAccessToken(
        null, TEST_EMAIL, TEST_SUBJECT, TEST_USER, TEST_SCOPES))
        .rejects.toThrow('missing input');
    await expect(() => tokenBuilderService.buildAccessToken(
        TEST_CLIENT, null, TEST_SUBJECT, TEST_USER, TEST_SCOPES))
        .rejects.toThrow('missing input');
    await expect(() => tokenBuilderService.buildAccessToken(
        TEST_CLIENT, TEST_EMAIL, null, TEST_USER, TEST_SCOPES))
        .rejects.toThrow('missing input');
    await expect(() => tokenBuilderService.buildAccessToken(
        TEST_CLIENT, TEST_EMAIL, TEST_SUBJECT, null, TEST_SCOPES))
        .rejects.toThrow('missing input');
    await expect(() => tokenBuilderService.buildAccessToken(
        TEST_CLIENT, TEST_EMAIL, TEST_SUBJECT, TEST_USER, null))
        .rejects.toThrow('missing input');
});

test('Given signing key not available When buildAccessToken Expect Error re-thrown', async () => {
    keyProvider.getSigningKey.mockReset();
    keyProvider.getSigningKey.mockImplementation(
        jest.fn().mockRejectedValue(new Error('keyProviderError')));
    await expect(() => tokenBuilderService.buildAccessToken(
        TEST_CLIENT, TEST_EMAIL, TEST_SUBJECT, TEST_USER, TEST_SCOPES))
        .rejects.toThrow('keyProviderError');
});

test('Given valid params and signing key When buildAccessToken Expect valid JWT', async () => {
    const signedJwt = await tokenBuilderService.buildAccessToken(
        TEST_CLIENT, TEST_EMAIL, TEST_SUBJECT, TEST_USER, TEST_SCOPES);
    const decodedJwt = await jsonwebtoken.decode(signedJwt, {complete: true});
    expect(decodedJwt.header.kid).toEqual('1');
    expect(decodedJwt.payload.iss).toEqual(TEST_ISSUER);
    await expect(decodedJwt.payload.exp).toBeGreaterThan(await getEpochSecsFromNow(0));
    await expect(decodedJwt.payload.exp).toBeLessThanOrEqual(await getEpochSecsFromNow(parseInt(process.env.CLAIMS_TOKEN_VALIDITY_SEC)));
    expect(decodedJwt.payload.aud).toEqual([TEST_AUDIENCE]);
    expect(decodedJwt.payload.sub).toEqual(TEST_SUBJECT);
    expect(decodedJwt.payload.client_id).toEqual(TEST_CLIENT);
    expect(decodedJwt.payload.iat).toBeGreaterThan(0);
    await expect(decodedJwt.payload.iat).toBeLessThanOrEqual(await getEpochSecsFromNow(0));
    expect(decodedJwt.payload.jti).toHaveLength(36); //UUID v4 length
    expect(decodedJwt.payload.email).toEqual(TEST_EMAIL);
    expect(decodedJwt.payload.username).toEqual(TEST_USER);
    expect(decodedJwt.payload.scope).toEqual(TEST_SCOPES);
});

async function getEpochSecsFromNow(seconds) {
    return Math.floor(new Date() / 1000) + seconds;
}