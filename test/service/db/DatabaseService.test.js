const repository = require('../../../src/db/AuthzRepository');
const winston = require('winston');
const dbService = require('../../../src/service/db/DatabaseService');

jest.mock('../../../src/db/AuthzRepository');
jest.mock('winston');

// Test field-level data
const TEST_CLIENT_ID = 'client';
const TEST_APP_ID = 'appID';
const TEST_GRANT_TYPE = 'grantType';
const TEST_ISSUER_URL = 'issuerUrl';
const TEST_IDP_ID = 'idpId';
const TEST_EMAIL = 'email';

// Test entities
const TEST_ENTITY = {
    field1: 'value1'
}

describe('findAppClient', () => {
    test('Given repository returns empty When findAppClient Expect Error', async () => {
        repository.AppClient.findByPk.mockResolvedValueOnce(null);
        await expect(() => dbService.findAppClient(TEST_CLIENT_ID))
            .rejects
            .toThrow('');
    });
    test('Given repository returns an AppClient When findAppClient Expect AppClient returned', async () => {
        repository.AppClient.findByPk.mockResolvedValueOnce(TEST_ENTITY);
        await expect(dbService.findAppClient(TEST_CLIENT_ID))
            .resolves
            .toEqual(TEST_ENTITY);
    })
});

describe('findAppGrant', () => {
    test('Given repository returns empty When findAppGrant Expect Error', async () => {
        repository.AppGrant.findOne.mockResolvedValueOnce(null);
        await expect(() => dbService.findAppGrant(TEST_APP_ID, TEST_GRANT_TYPE))
            .rejects
            .toThrow('');
    });
    test('Given repository returns an AppGrant When findAppGrant Expect AppGrant returned', async () => {
        repository.AppGrant.findOne.mockResolvedValueOnce(TEST_ENTITY);
        await expect(dbService.findAppGrant(TEST_APP_ID, TEST_GRANT_TYPE))
            .resolves
            .toEqual(TEST_ENTITY);
    })
});

describe('findIdpByIssuerUrl', () => {
    test('Given repository returns empty When findIdpByIssuerUrl Expect Error', async () => {
        repository.Idp.findOne.mockResolvedValueOnce(null);
        await expect(() => dbService.findIdpByIssuerUrl(TEST_ISSUER_URL))
            .rejects
            .toThrow('');
    });
    test('Given repository returns an Idp When findIdpByIssuerUrl Expect Idp returned', async () => {
        repository.Idp.findOne.mockResolvedValueOnce(TEST_ENTITY);
        await expect(dbService.findIdpByIssuerUrl(TEST_ISSUER_URL))
            .resolves
            .toEqual(TEST_ENTITY);
    })
});

describe('findAppIdp', () => {
    test('Given repository returns empty When findAppIdp Expect Error', async () => {
        repository.AppIdp.findByPk.mockResolvedValueOnce(null);
        await expect(() => dbService.findAppIdp(TEST_APP_ID, TEST_IDP_ID))
            .rejects
            .toThrow('');
    });
    test('Given repository returns an AppIdp When findAppIdp Expect AppIdp returned', async () => {
        repository.AppIdp.findByPk.mockResolvedValueOnce(TEST_ENTITY);
        await expect(dbService.findAppIdp(TEST_APP_ID, TEST_IDP_ID))
            .resolves
            .toEqual(TEST_ENTITY);
    })
});

describe('findUserScopesByEmail', () => {
    test('Given repository returns empty When findUserScopesByEmail Expect Error', async () => {
        repository.UserScope.findAll.mockResolvedValueOnce(null);
        await expect(() => dbService.findUserScopesByEmail(TEST_EMAIL))
            .rejects
            .toThrow('');
    });
    test('Given repository returns UserScopes When findUserScopesByEmail Expect UserScopes returned', async () => {
        repository.UserScope.findAll.mockResolvedValueOnce(TEST_ENTITY);
        await expect(dbService.findUserScopesByEmail(TEST_EMAIL))
            .resolves
            .toEqual(TEST_ENTITY);
    })
});