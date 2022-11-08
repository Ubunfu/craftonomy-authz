INSERT INTO "public"."APP" ("app_id", "app_name", "app_description", "createdAt", "updatedAt") VALUES ('1', 'test-app', 'test app', NOW(), NOW());
INSERT INTO "public"."APP_CLIENT" ("client_id", "app_id", "createdAt", "updatedAt") VALUES ('client', '1', NOW(), now());
INSERT INTO "public"."APP_GRANT" ("app_id", "grant_type", "createdAt", "updatedAt") VALUES ('1', 'urn:ietf:params:oauth:grant-type:token-exchange', now(), now());
INSERT INTO "public"."IDP" ("idp_id", "issuer_url", "idp_name", "idp_description", "createdAt", "updatedAt") VALUES ('1', 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_u9hvQAw2m', 'cognito', 'aws cognito', now(), now());
INSERT INTO "public"."APP_IDP" ("app_id", "idp_id", "createdAt", "updatedAt") VALUES ('1', '1', now(), now());
INSERT INTO "public"."USER_SCOPE" ("email", "scope", "createdAt", "updatedAt") VALUES ('rallen3882@gmail.com', 'shop.read', now(), now());
