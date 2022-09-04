var express = require('express');
var path = require('path');
var logger = require('morgan');

var routerV1 = require('./routes/apiV1');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', routerV1);

module.exports = app;
