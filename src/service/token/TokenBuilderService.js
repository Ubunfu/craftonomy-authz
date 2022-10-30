const {sign} = require('jsonwebtoken');
const uuid = require('uuid');
const keyProvider = require("../jwk/SigningKeyProvider");
const winston = require('winston')

async function getEpochSecsFromNow(seconds) {
    return Math.floor(new Date() / 1000) + seconds;
}

async function buildTokenPayload(clientId, email, subject, username, scopes) {
    if (!clientId || !email || !subject || !username || !scopes) {
        winston.error('Missing data trying to build token');
        throw Error('missing input');
    }
    return {
        iss: process.env.CLAIMS_ISS,
        exp: await getEpochSecsFromNow(parseInt(process.env.CLAIMS_TOKEN_VALIDITY_SEC)),
        aud: [
            process.env.CLAIMS_AUD
        ],
        sub: subject,
        client_id: clientId,
        iat: await getEpochSecsFromNow(0),
        jti: uuid.v4(),
        email: email,
        username: username,
        scope: scopes
    };
}

async function buildAccessToken(clientId, email, subject, username, scopes) {
    const tokenPayload = await buildTokenPayload(clientId, email, subject, username, scopes);
    const signingKey = await keyProvider.getSigningKey();
    return sign(tokenPayload, signingKey.data, { keyid: signingKey.id });
}

module.exports = {
    buildAccessToken
}