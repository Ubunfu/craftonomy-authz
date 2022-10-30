const flatFileProvider = require('./FlatFileProvider');
const winston = require('winston');
const forge = require('node-forge');

const LOG_ERROR_READING_FILE = 'Error reading keystore file %s: %s';
const LOG_ERROR_PARSING_KEYSTORE = 'Error parsing keystore file %s as PKCS12 keystore';

async function fetchRemoteFile(filePath) {
    try {
        return await flatFileProvider.readFile(filePath);
    } catch (e) {
        winston.error(LOG_ERROR_READING_FILE, filePath, e.message);
        throw Error('error reading from filesystem');
    }
}

function parseFileAsKeystore(keystoreFile) {
    try {
        const pk12Ans1 = forge.asn1.fromDer(keystoreFile, false);
        return forge.pkcs12.pkcs12FromAsn1(pk12Ans1, false, process.env.SIGNING_KEYSTORE_PASSWORD);
    } catch (e) {
        winston.error(LOG_ERROR_PARSING_KEYSTORE, keystoreFile, e.message);
        throw Error('error reading keystore');
    }
}

function getPemKeyData(keyBag) {
    return forge.pki.privateKeyToPem(keyBag.key);
}

function getTimeBasedSelector(size) {
    const currentEpoch = Math.floor(new Date() / 1000);
    return currentEpoch % size;
}

function getArbitrarySigningKeyBag(keyBags) {
    const availableSigningKeyBags = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
    if (availableSigningKeyBags.length < 1) {
        throw Error('no signing keys');
    }
    if (availableSigningKeyBags.length === 1) {
        return availableSigningKeyBags[0];
    }
    return availableSigningKeyBags[getTimeBasedSelector(availableSigningKeyBags.size)];
}

/**
 * Returns an object representing a signing key available for use to sign an access token.
 * The object contains the key data as well as the key ID.
 * This provider layer creates an abstraction between the consumer of the signing
 * key and the implementation details concerning where it is stored / how it is
 * accessed.  This layer allows those details to change more easily, or even for
 * multiple strategies to be supported based on configuration.
 * @returns {Promise<void>}
 */
async function getSigningKey() {
    const keystoreFile = await fetchRemoteFile(process.env.SIGNING_KEYSTORE_FILE);
    const keystore = parseFileAsKeystore(keystoreFile);
    const keyBags = keystore.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const keyBag = getArbitrarySigningKeyBag(keyBags);
    const keyDataAsPem = getPemKeyData(keyBag);
    return {
        id: keyBag.attributes.friendlyName[0],
        data: keyDataAsPem
    };
}

module.exports = {
    getSigningKey
}