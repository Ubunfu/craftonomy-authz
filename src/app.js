require('dotenv').config()
const express = require('express');
const logger = require('morgan');
const routerV1 = require('./routes/OAuthV1Api');
const { sequelize } = require('./db/AuthzRepository')
const winston = require('winston')
winston.configure({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console()
    ]
})

const app = express();

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/oauth2', routerV1);

sequelize.sync()

module.exports = app;
