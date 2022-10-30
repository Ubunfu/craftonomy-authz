const {handle} = require('../../src/error/ErrorHandler');
const errors = require('../../src/error/ErrorMessage');

function setupMocks() {
    const resMock = {
        status: () => {},
        send: () => {}
    }
    const statusSpy = jest.spyOn(resMock, 'status').mockImplementation(() => resMock);
    const sendSpy = jest.spyOn(resMock, 'send').mockImplementation(() => resMock);
    return {resMock, statusSpy, sendSpy};
}

test('Given ERROR_MISSING_GRANT_TYPE When handle Expect 400: invalid_request', async () => {
    const err = {
        message: errors.ERROR_MISSING_GRANT_TYPE
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_request'});
});

test('Given ERROR_MISSING_GRANT_TYPE When handle Expect 400: invalid_request', async () => {
    const err = {
        message: errors.ERROR_MISSING_GRANT_TYPE
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_request'});
});

test('Given ERROR_MISSING_CLIENT_ID When handle Expect 400: invalid_request', async () => {
    const err = {
        message: errors.ERROR_MISSING_CLIENT_ID
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_request'});
});

test('Given ERROR_MISSING_SUBJECT_TOKEN When handle Expect 400: invalid_request', async () => {
    const err = {
        message: errors.ERROR_MISSING_SUBJECT_TOKEN
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_request'});
});

test('Given ERROR_MISSING_SUBJECT_TOKEN_TYPE When handle Expect 400: invalid_request', async () => {
    const err = {
        message: errors.ERROR_MISSING_SUBJECT_TOKEN_TYPE
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_request'});
});

test('Given ERROR_UNSUPPORTED_CONTENT_TYPE When handle Expect 400: invalid_request', async () => {
    const err = {
        message: errors.ERROR_UNSUPPORTED_CONTENT_TYPE
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_request'});
});

test('Given ERROR_INVALID_CLIENT When handle Expect 400: invalid_client', async () => {
    const err = {
        message: errors.ERROR_INVALID_CLIENT
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_client'});
});

test('Given ERROR_GETTING_SIGNING_KEY When handle Expect 400: invalid_grant', async () => {
    const err = {
        message: errors.ERROR_GETTING_SIGNING_KEY
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_grant'});
});

test('Given ERROR_UNAUTHORIZED_GRANT_TYPE When handle Expect 400: unauthorized_client', async () => {
    const err = {
        message: errors.ERROR_UNAUTHORIZED_GRANT_TYPE
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'unauthorized_client'});
});

test('Given ERROR_NO_USER_SCOPES When handle Expect 400: invalid_scope', async () => {
    const err = {
        message: errors.ERROR_NO_USER_SCOPES
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_scope'});
});


test('Given ERROR_UNKNOWN_IDP When handle Expect 400: invalid_target', async () => {
    const err = {
        message: errors.ERROR_UNKNOWN_IDP
    }
    const spies = setupMocks();
    handle(err, spies.resMock);
    expect(spies.statusSpy).toHaveBeenCalledWith(400);
    expect(spies.sendSpy).toHaveBeenCalledWith({error: 'invalid_target'});
});