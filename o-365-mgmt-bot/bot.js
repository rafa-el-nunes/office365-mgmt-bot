"use strict";

//Requiring NPM packages
const path = require('path');
const builder = require("botbuilder");

//Requiring local files
const graphAPI = require(path.join(__dirname, '..', 'GraphAPI/graph.js'));
const luis = require(path.join(__dirname, '..', '/LUIS/luis.js'));
const createUserDialog = require(path.join(__dirname, '..', '/Dialogs/createUser.js'));
const passwordGenerator = require(path.join(__dirname, '..', '/Utils/passwords.js'));
const emailer = require(path.join(__dirname, '..', '/Utils/Emailer.js'));
const cards = require(path.join(__dirname, '..', '/Utils/Cards.js'));

//Building BOT object
const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(connector);
bot.recognizer(new builder.LuisRecognizer(luis.luisAppUrl));

function createSigninCard(session) {
    return new builder.SigninCard(session)
        .text('This bot is only for admins')
        .button('Consent', `https://login.microsoftonline.com/${process.env.TENANT}/adminconsent?client_id=${process.env.MICROSOFT_APP_ID}&state=12345&redirect_uri=${process.env.REDIRECT_URI}`);
}

bot.dialog('createUser', [
    (session, args, next) => {
        if (!session.privateConversationData['dialogs']) {
            session.privateConversationData['dialogs'] = createUserDialog.getUserDialog();
            session.privateConversationData['dialogOrder'] = 1;
            session.replaceDialog('createUser');
        } else {
            var dialogs = session.privateConversationData['dialogs'];
            var dialogOrder = session.privateConversationData['dialogOrder'];

            var dialog = dialogs.filter(function (e, i) {
                return dialogs[i].order == dialogOrder;
            });

            if (dialog.length === 1) {
                dialog = dialog[0];
                session.privateConversationData['dialog'] = dialog;
            }

            if (dialog.order) {
                session.sendTyping();
                if (dialog.promptType === 'text') {
                    builder.Prompts.text(session, dialog.message);
                } else if (dialog.promptType === 'confirm') {
                    builder.Prompts.confirm(session, dialog.message);
                } else if (dialog.promptType === 'botmessage') {
                    session.send(dialog.message);
                    next();
                } else if (dialog.promptType === 'adaptivecard') {
                    var userProperties = [];
                    userProperties = [
                        {
                            title: 'Display Name:',
                            value: session.privateConversationData['displayName']
                        },
                        {
                            title: 'User Principal Name:',
                            value: session.privateConversationData['userPrincipalName']
                        },
                        {
                            title: 'Enable User?',
                            value: session.privateConversationData['enableUser']
                        }
                    ];

                    var actions = [];

                    if(session.privateConversationData['finalDialog']) {
                        actions = [
                            {
                                type: 'Action.OpenUrl',
                                url: `${process.env.AZURE_PORTALURL_USERID}${session.privateConversationData['userID']}`,
                                title: 'Azure'
                            },
                            {
                                type: 'Action.OpenUrl',
                                url: `${process.env.OFFICE365_PORTALURL_USERS}`,
                                title: 'Office 365'
                            }
                        ];
                    }

                    var card = cards.buildUserSummaryAdaptiveCard(userProperties, actions);
                    var msg = new builder.Message(session).addAttachment(card);
                    session.send(msg);
                    next();
                } else if (dialog.promptType === 'createuser') {
                    graphAPI.getGraphAPIToken().then((result) => {
                        session.sendTyping();
                        passwordGenerator.generatePassword().then((generatedPassword) => {
                            session.privateConversationData['password'] = generatedPassword.password;
                            var jsonBody = JSON.parse(result.body);
                            graphAPI.createUser(
                                session.privateConversationData['enableUser'],
                                session.privateConversationData['displayName'],
                                session.privateConversationData['emailNickname'],
                                {
                                    "password": session.privateConversationData['password'],
                                    "forceChangePasswordNextSignIn": true
                                },
                                `${session.privateConversationData['userPrincipalName']}@${process.env.TENANT_DOMAIN}`,
                                jsonBody.access_token).then((response) => {
                                    session.privateConversationData['userID'] = response.body.id;
                                    next();
                                });
                        }).catch((error) => {
                            session.send(error);
                            session.endDialog();
                        });
                    }).catch((errorMessage) => {
                        session.endConversation();
                    });
                } else if (dialog.promptType === 'sendemail') {
                    emailer.sendEmail('A user account has been created or modified', session.privateConversationData['password'], `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`).then((response) => {
                        session.privateConversationData['finalDialog'] = true;
                        next();
                    }).catch((error) => {
                        session.endConversation();
                    });
                }
            } else {
                session.endConversation();
            }
        }
    },
    (session, results, next) => {
        if (session.privateConversationData[session.privateConversationData['dialog'].userPropertyName] !== '') {
            session.privateConversationData[session.privateConversationData['dialog'].userPropertyName] = results.response;
            if (session.privateConversationData['dialog'].userPropertyName === 'userPrincipalName') {
                session.privateConversationData['emailNickname'] = session.privateConversationData['userPrincipalName'];
            }
        }

        session.privateConversationData['dialogOrder'] = session.privateConversationData['dialogOrder'] + 1;
        session.replaceDialog('createUser');
    }
])
    .triggerAction({
        matches: 'createUser'
    })
    .cancelAction(
    "cancelCreation", `Got it. Just canceled. Let me know when you wanna go back to it.`,
    {
        matches: /^(cancel|stop)$/i,
        confirmPrompt: "This will cancel everything. Are you sure?"
    }
    );

bot.dialog('adminConsent', [
    (session, args, next) => {
        var card = createSigninCard(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
        session.endDialog();
    }
]).triggerAction({
    matches: /^admin-consent/i
});

bot.dialog('adaptiveCard', (session, args, next) => {
    var card = cards.userSummaryAdaptiveCard;
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
}).triggerAction({
    matches: /^adaptiveCard/i
});

bot.dialog('/', (session, args, next) => {
    session.sendTyping();
    session.send('Hi!');
});

module.exports = bot;
