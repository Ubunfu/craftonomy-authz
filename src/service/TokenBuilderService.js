const {sign} = require('jsonwebtoken');

async function buildAccessToken(clientId, email, subject, username, scopes) {

    return sign();
}

module.exports = {
    buildAccessToken
}