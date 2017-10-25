"use strict";

//Requiring NPM packages
const path = require('path');
const builder = require("botbuilder");

//Requiring local files
const graphAPI = require(path.join(__dirname, '..', 'GraphAPI/graph.js'));
const luis = require(path.join(__dirname, '..', '/LUIS/luis.js'));
const createUserDialogs = require(path.join(__dirname, '..', '/Dialogs/createUser.js'));
const passwordGenerator = require(path.join(__dirname, '..', '/Utils/passwords.js'));

//Building BOT object
const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(connector, (session) => {
    session.beginDialog('adminConsent');
});
bot.recognizer(new builder.LuisRecognizer(luis.luisAppUrl));

function createSigninCard(session) {
    return new builder.SigninCard(session)
        .text('This bot is only for admins')
        .button('Consent', `https://login.microsoftonline.com/rafaelnunes.onmicrosoft.com/adminconsent?client_id=${process.env.MICROSOFT_APP_ID}&state=12345&redirect_uri=${process.env.REDIRECT_URI}`);
}

bot.dialog('adminConsent', [
    (session, args, next) => {
        var card = createSigninCard(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
    }
]).triggerAction({
    matches: 'adminConsent'
});

// bot.dialog('/', (session, args, next) => {
//     session.send('Hi!');
//     session.endConversation();
// });

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
        builder.Prompts.confirm(session, `Should I active this user right after creation?`, { listStyle: builder.ListStyle.button });
    },
    (session, results, next) => {
        session.privateConversationData['enableUser'] = results.response;
        var password = null;
        passwordGenerator.generatePassword().then((generatedPassword) => {
            session.privateConversationData['password'] = generatedPassword.password;
        }).catch((error) => {
            session.send(error);
        });
        next();
    },
    (session) => {
        graphAPI.getGraphAPIToken().then((result) => {
            var jsonBody = JSON.parse(result.body);
            console.log(result.body);
            graphAPI.createUser(session.privateConversationData['enableUser'],
                session.privateConversationData['displayName'],
                session.privateConversationData['emailNickname'],
                {
                    "password": session.privateConversationData['password'],
                    "forceChangePasswordNextSignIn": true
                },
                `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`,
                jsonBody.access_token).then(() => {
                    session.endConversation();
                });
        }).catch((errorMessage) => {
            console.log(errorMessage);
            session.endConversation();
        });
    }
]).triggerAction({
    matches: 'createUser'
});

// bot.use({
//     receive: (event, next) => {
//         next();
//     }
// });

module.exports = bot;
