var express = require('express');
var router = express.Router();

router.get('/oauth2/token', function(req, res, next) {
  res.send({data: "nice"})
});

module.exports = router;
