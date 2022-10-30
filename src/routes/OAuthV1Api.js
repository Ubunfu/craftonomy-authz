var express = require('express');
var router = express.Router();
const {validateRequest} = require('../service/validator/OAuthRequestValidatorService');
const {handle} = require('../error/ErrorHandler')
const {exchangeToken} = require("../service/token/TokenExchangeService");

router.post('/token', async function(req, res, next) {
  try {
    validateRequest(req);
    res.send(await exchangeToken(
        req.body.grant_type,
        req.body.client_id,
        req.body.subject_token,
        req.body.subject_token_type,
    ));
  } catch (e) {
    handle(e, res)
  }
});

module.exports = router;
