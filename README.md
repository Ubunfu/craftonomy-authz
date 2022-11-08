# Craftonomy Authorization Server

The official authorization server for the Craftonomy platform.

## API Spec

API specifications [located here](https://github.com/Ubunfu/craftonomy-authz/blob/develop/api/) or in `/api`.

## Supported OAuth 2.0 Grant Types

* `urn:ietf:params:oauth:grant-type:token-exchange`

## Configuration

| Config Key                | Description                                                                                                                                                                                                                                                                                                                          | Required? | Example                                                       |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|---------------------------------------------------------------|
| CLAIMS_TOKEN_VALIDITY_SEC | The number of seconds that issued access tokens should be valid for.                                                                                                                                                                                                                                                                 | YES       | `1800`                                                        |
| CLAIMS_ISS                | The value of the `iss` (issuer) claim of issued access tokens.  This should be set to the FQDN of the authorization server.                                                                                                                                                                                                          | YES       | `https://authz.craftonomy.net`                                |
| CLAIMS_AUD                | The value of the `aud` (audience) claim of issued access tokens.  Value is a comma-separated list. List items values are implementation specific, but should uniquely identify the resource providers to which the authorization server is permitting the token bearer some level of authorization as defined by the granted scopes. | YES       | `https://api.craftonomy.net`, `https://api.otherplatform.net` |
| SIGNING_KEYSTORE_FILE     | The path to the keystore file that contains keys which should be used to sign access tokens.  It should be a PKCS12 keystore file.                                                                                                                                                                                                   | YES       | `signingKeystore.p12`                                         |
| SIGNING_KEYSTORE_PASSWORD | The password to the keystore file defined by `SIGNING_KEYSTORE_FILE`.                                                                                                                                                                                                                                                                | YES       | `secureKeystoreP455w0rd`                                      |
| DB_CONN_STRING            | The connection string to the backing database.                                                                                                                                                                                                                                                                                       | YES       | `postgres://user:pass@example.com:5432/dbname`                |
| LOG_LEVEL                 | Sets the logging level for the app according to those available by default by the `winston` logging library.  Default logging level is `info`.                                                                                                                                                                                       | NO        | `info`                                                        |
