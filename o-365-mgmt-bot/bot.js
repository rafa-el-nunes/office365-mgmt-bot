"use strict";
const path = require('path');
const graphAPI = require(path.join(__dirname, '..', 'GraphAPI/graph.js'));
const builder = require("botbuilder");
const luis = require(path.join(__dirname, '..', '/LUIS/luis.js'));
const createUserDialogs = require(path.join(__dirname, '..', '/Dialogs/createUser.js'));
const connector = new builder.ChatConnector();

// const bot = new builder.UniversalBot(
//     connector,
//     (session) => {
//         session.beginDialog('adminConsent');
//     }
// );

const bot = new builder.UniversalBot(connector);

bot.recognizer(new builder.LuisRecognizer(luis.luisAppUrl));
console.log(luis.luisAppUrl);
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
]).triggerAction({
    matches: 'adminConsent'
});

bot.dialog('/', (session, args, next) => {
    session.send('Hi!');
});

bot.dialog('createUser', [
    (session, args) => {
        builder.Prompts.text(session, `How would you like the Display Name to be?`);
    },
    (session, results) => {
        session.privateConversationData['displayName'] = results.response;
        builder.Prompts.text(session, `How would you like the userPrincipalName to be?`);
    },
    (session, results) => {
        session.privateConversationData['userPrincipalName'] = results.response;
        builder.Prompts.text(session, `How would you like the Email Nickname to be?`);
    },
    (session, results) => {
        session.privateConversationData['emailNickname'] = results.response;
        builder.Prompts.text(session, `Type a temporary password. The user will be prompted to change it during the first access.`);
    },
    (session, results) => {
        session.privateConversationData['password'] = results.response;
        builder.Prompts.confirm(session, `Should I active this user right after creation?`, { listStyle: builder.ListStyle.button });
    },
    (session, results, next) => {
        session.privateConversationData['enableUser'] = results.response;
        var stringResult = JSON.stringify(session.privateConversationData);
        console.log(stringResult);
        next();
    },
    (session, results) => {
        var stringResult = JSON.stringify(session.privateConversationData);
        console.log(stringResult);
        graphAPI.getGraphAPIToken().then((result) => {
            var jsonBody = JSON.parse(result.body);
            console.log(jsonBody.access_token);
            return graphAPI.createUser(session.privateConversationData['enableUser'], session.privateConversationData['displayName'], session.privateConversationData['emailNickname'], { "password": session.privateConversationData['password'], "forceChangePasswordNextSignIn": false }, `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`, jsonBody.access_token);
        }).catch((errorMessage) => {
            console.log(errorMessage);
        });
    }


]).triggerAction({
    matches: 'createUser'
});

bot.use({
    receive: (event, next) => {
        console.log(event.text);
        next();
    }
});

module.exports = bot;
