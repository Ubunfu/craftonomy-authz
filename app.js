require('dotenv').config()
const express = require('express');
const path = require('path');
const logger = require('morgan');
const routerV1 = require('./routes/apiV1');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', routerV1);

module.exports = app;
