const flatFileProvider = require('./FlatFileProvider');
const winston = require('winston');
const forge = require('node-forge');

const LOG_ERROR_READING_FILE = 'Error reading keystore file %s: %s';
const LOG_ERROR_PARSING_KEYSTORE = 'Error parsing keystore file %s as PKCS12 keystore';

function fetchRemoteFile(filePath) {
    try {
        return flatFileProvider.readFile(filePath);
    } catch (e) {
        winston.error(LOG_ERROR_READING_FILE, filePath, e.message);
        throw Error('error reading from filesystem');
    }
}

function parseFileAsKeystore(keystoreFile) {
    try {
        const pk12Ans1 = forge.asn1.fromDer(keystoreFile);
        return forge.pkcs12.pkcs12FromAsn1(pk12Ans1, false, process.env.SIGNING_KEYSTORE_PASSWORD);
    } catch (e) {
        winston.error(LOG_ERROR_PARSING_KEYSTORE, keystoreFile, e.message);
        throw Error('error reading keystore');
    }
}

function getPemKeyData(keyBag) {
    return forge.pki.privateKeyToPem(keyBag.key);
}

function getTimeBasedSigningKeySelector(numAvailSigningKeys) {
    const currentEpoch = Math.floor(new Date() / 1000);
    return currentEpoch % numAvailSigningKeys;
}

function getArbitrarySigningKeyBag(keyBags) {
    const availableSigningKeyBags = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
    if (availableSigningKeyBags.length < 1) {
        throw Error('no signing-capable keys found in keystore');
    }
    return availableSigningKeyBags[getTimeBasedSigningKeySelector(availableSigningKeyBags.length)];
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
function getSigningKey() {
    const keystoreFile = fetchRemoteFile(process.env.SIGNING_KEYSTORE_FILE);
    const keystore = parseFileAsKeystore(keystoreFile);
    const signingKeyBags = keystore.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const chosenSigningKeyBag = getArbitrarySigningKeyBag(signingKeyBags);
    const keyDataAsPem = getPemKeyData(chosenSigningKeyBag);
    return {
        id: chosenSigningKeyBag.attributes.friendlyName[0],
        data: keyDataAsPem
    };
}

module.exports = {
    getSigningKey
}