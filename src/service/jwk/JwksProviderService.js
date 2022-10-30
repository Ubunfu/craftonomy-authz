const winston = require("winston");
const jwksClient = require('jwks-rsa');
const error = require('../../error/ErrorMessage')

const LOG_ERROR_GETTING_SIGNING_KEY = 'Unable to retrieve signing key with ID: %s from provider %s';

async function getSigningKey(jwksUri, keyId) {
    try {
        const client = jwksClient({ jwksUri: jwksUri });
        const jwksResp = await client.getSigningKey(keyId);
        return jwksResp.publicKey || jwksResp.rsaPublicKey;
    } catch (e) {
        winston.error(LOG_ERROR_GETTING_SIGNING_KEY, keyId, jwksUri);
        throw Error(error.ERROR_GETTING_SIGNING_KEY);
    }
}

module.exports = {
    getSigningKey
}