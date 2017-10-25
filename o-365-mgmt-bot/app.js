const path = require('path');
const express = require('express');
const queryString = require('querystring');
const url = require('url');
const restify = require('restify');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bot = require('./bot.js');
const http = require('http');

const app = express();

const server = http.createServer(app);

app.post('/api/messages', bot.connector().listen());

app.get('/token', (request, response) => {
    var rawUrl = `${process.env.BASE_URI}${request.originalUrl}`;
    var parsedUrl = url.parse(rawUrl);
    var parsedQueryString = queryString.parse(parsedUrl.query);
    var adminConsent = parsedQueryString.admin_consent;
    if (adminConsent) {
        response.send('You can go back to the chat now');
    } else {
        response.send('You are not authorized to use this BOT');
    }
});

app.listen(process.env.PORT);