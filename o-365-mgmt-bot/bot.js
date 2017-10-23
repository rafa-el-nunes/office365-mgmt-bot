"use strict";
const path = require('path');
const graphAPI = require(path.join(__dirname, '..', 'GraphAPI/graph.js'));
const builder = require("botbuilder");
const dialog = require("./dialogs/echo");

const connector = new builder.ChatConnector();

const bot = new builder.UniversalBot(
    connector,
    (session) => {
        session.beginDialog('adminConsent');
    }
);

function createSigninCard(session) {
    return new builder.SigninCard(session)
        .text('This bot is only for admins')
        .button('Consent', `https://login.microsoftonline.com/common/adminconsent?client_id=${process.env.MICROSOFT_APP_ID}&state=12345&redirect_uri=${process.env.REDIRECT_URI}`);
}

bot.dialog('adminConsent', [
    (session, args, next) => {
        var card = createSigninCard(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.endDialog(msg);
    }
]);

bot.dialog('createUser', (session, args, next) => {
    graphAPI.getGraphAPIToken().then((result) => {
        var jsonBody = JSON.parse(result.body);
        console.log(jsonBody.access_token);
        return graphAPI.createUser(true, 'BOT User 1', 'botuser1', { "password": "Test1234", "forceChangePasswordNextSignIn": false }, 'botuser1@rafaelnunes.onmicrosoft.com', jsonBody.access_token);
    }).catch((errorMessage) => {
        console.log(errorMessage);
    });
}).triggerAction({
    matches: /^create user$/i
});

bot.use({
    receive: (event, next) => {
        console.log(event.text);
        next();
    }
});

module.exports = bot;
