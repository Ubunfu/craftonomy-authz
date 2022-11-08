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
| DB_CONN_STRING            | The connection string to the backing database.  Defaults to `sqlite::memory`.                                                                                                                                                                                                                                                        | NO        | `postgres://user:pass@example.com:5432/dbname`                |
| LOG_LEVEL                 | Sets the logging level for the app according to those available by default by the `winston` logging library.  Default logging level is `info`.                                                                                                                                                                                       | NO        | `info`                                                        |

## Database

### SQLite In-Memory
By default, if `DB_CONN_STRING` is not provided, the app will start up an in-memory SQLite DB and use that as the 
primary data store.  This isn't recommended for much of anything aside from running automated tests, as there isn't a 
good way to manipulate that data.

### External Persistent
If a connection string is provided, the app will connect to that instead. Mostly for convenience and local testing, 
there is a containerized postgres database service defined in `/docker-compose.yml` that can be easily started up by 
running `docker-compose up -d db`.  The example value of `DB_CONN_STRING` illustrates how to properly configure a 
connection to it.

When the app starts up, it will attempt to create the tables it needs if they don't exist.  After the schema is created,
there is some sample mock data load in `/test/resources/test-dataload.sql`.