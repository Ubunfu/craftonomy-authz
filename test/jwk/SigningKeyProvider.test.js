const signingKeyProvider = require('../../src/service/jwk/SigningKeyProvider');
const winston = require('winston');
const flatFileProvider = require('../../src/service/jwk/FlatFileProvider');
const fs = require("fs");
var forge = require('node-forge');

jest.mock('winston');
jest.mock('../../src/service/jwk/FlatFileProvider');

const TEST_KEYSTORE = './test/resources/signing-test.p12';
const TEST_KEYSTORE_EMPTY = './test/resources/signing-test-empty.p12';
const TEST_KEYSTORE_PASSWORD = 'password';

beforeEach(() => {
    jest.resetAllMocks();
    process.env.SIGNING_KEYSTORE_PASSWORD = TEST_KEYSTORE_PASSWORD;
    flatFileProvider.readFile.mockImplementation(
        jest.fn(() => fs.readFileSync(TEST_KEYSTORE, 'binary'))
    );
});

test('Given keysore file unreadable When getSigningKey Expect Error error reading from filesystem', async () => {
    flatFileProvider.readFile.mockReset();
    flatFileProvider.readFile.mockImplementation(
        jest.fn().mockRejectedValue(new Error('some random i/o error'))
    );
    await expect(() => signingKeyProvider.getSigningKey())
        .rejects
        .toThrow('error reading from filesystem');
});

test('Given cannot open keystore When getSigningKey Expect Error error reading keystore', async () => {
    const fromDerMock = jest.spyOn(forge.asn1, 'fromDer').mockImplementation(() => {
        throw Error('some node-forge error');
    });
    await expect(() => signingKeyProvider.getSigningKey())
        .rejects
        .toThrow('error reading keystore');
    fromDerMock.mockRestore();
});

test('Given cannot read keystore as PKCS12 When getSigningKey Expect Error error reading keystore', async () => {
    const pkcs12FromAsn1Mock = jest.spyOn(forge.pkcs12, 'pkcs12FromAsn1').mockImplementation(() => {
        throw Error('some node-forge error');
    });
    await expect(() => signingKeyProvider.getSigningKey())
        .rejects
        .toThrow('error reading keystore');
    pkcs12FromAsn1Mock.mockRestore();
});

test('Given no signing keys available When getSigningKey Expect Error no signing keys', async () => {
    // no signing keys
    flatFileProvider.readFile.mockImplementation(
        jest.fn(() => fs.readFileSync(TEST_KEYSTORE_EMPTY, 'binary'))
    );
    await expect(() => signingKeyProvider.getSigningKey())
        .rejects
        .toThrow('no signing keys');
});

test('Given signing keys available When getSigningKey Expect returns a key', async () => {
    const signingKey = await signingKeyProvider.getSigningKey();
    expect(signingKey.id).toEqual('test-1');
    expect(signingKey.data).toContain('BEGIN RSA PRIVATE KEY');
});