const winston = require('winston');
const jwksClient = require('jwks-rsa');
const jwksProviderService = require('../../../src/service/jwk/JwksProviderService');
const error = require('../../../src/error/ErrorMessage');

jest.mock('jwks-rsa');
jest.mock('winston');

const TEST_JWKS_URI = 'https://jwksUri.net';
const TEST_KEY_ID = 'key001';
const TEST_PUBLIC_KEY = 'testRSAPublicKey';

test('Given JWKS client throws error When getSigningKey Expect Error error getting signing key', async () => {
    jwksClient.mockReturnValueOnce({
        getSigningKey: jest.fn().mockRejectedValue(new Error())
    });
    await expect(() => jwksProviderService.getSigningKey(TEST_JWKS_URI, TEST_KEY_ID))
        .rejects
        .toThrow(error.ERROR_GETTING_SIGNING_KEY);
});

test('Given JWKS client returns key data When getSigningKey Expect key data returned', async () => {
    jwksClient.mockReturnValueOnce({
        getSigningKey: jest.fn().mockResolvedValue({
            rsaPublicKey: TEST_PUBLIC_KEY
        })
    });
    await expect(jwksProviderService.getSigningKey(TEST_JWKS_URI, TEST_KEY_ID))
        .resolves
        .toEqual(TEST_PUBLIC_KEY);
});