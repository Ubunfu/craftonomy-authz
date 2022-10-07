var express = require('express');
var router = express.Router();
const {validateRequest} = require('../service/OAuthRequestValidatorService');
const {handle} = require('../error/ErrorHandler')
const {exchangeToken} = require("../service/TokenExchangeService");

router.post('/token', function(req, res, next) {
  try {
    validateRequest(req);
    exchangeToken(
        req.body.grant_type,
        req.body.client_id,
        req.body.subject_token,
        req.body.subject_token_type,
    );
    res.send({data: "nice"});
  } catch (e) {
    handle(e, res)
  }
});

module.exports = router;
