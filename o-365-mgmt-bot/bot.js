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
        .button('Consent', `https://login.microsoftonline.com/rafaelnunes.onmicrosoft.com/adminconsent?client_id=${process.env.MICROSOFT_APP_ID}&state=12345&redirect_uri=${process.env.REDIRECT_URI}`);
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
                            title: 'Display Name',
                            value: session.privateConversationData['displayName']
                        },
                        {
                            title: 'User Principal Name',
                            value: session.privateConversationData['userPrincipalName']
                        },
                        {
                            title: 'Enable User?',
                            value: session.privateConversationData['enableUser']
                        }
                    ];

                    var card = cards.buildUserSummaryAdaptiveCard(userProperties);
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
                                `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`,
                                jsonBody.access_token).then((response) => {
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
                    console.log(session.privateConversationData);
                    emailer.sendEmail('A user account has been created or modified', session.privateConversationData['password'], `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`).then((response) => {
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
        console.log(session.privateConversationData['dialogOrder']);
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
    console.log(JSON.stringify(card));
    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
}).triggerAction({
    matches: /^adaptiveCard/i
});

bot.dialog('/', (session, args, next) => {
    session.sendTyping();
    session.send('Hi!');
});


// bot.dialog('createUser2', [
//     (session, args, next) => {
//         session.sendTyping();

//     }
// ]).triggerAction({
//     matches: /^testReplacement$/i,
// });

// bot.dialog('createUser', [
//     (session, args) => {
//         session.sendTyping();
//         builder.Prompts.text(session, `How would you like the Display Name to be?`);
//     },
//     (session, results, next) => {
//         session.sendTyping();
//         session.privateConversationData['displayName'] = results.response;
//         builder.Prompts.text(session, `How would you like the userPrincipalName to be?`);
//     },
//     (session, results) => {
//         session.sendTyping();
//         session.privateConversationData['userPrincipalName'] = results.response;
//         session.privateConversationData['emailNickname'] = results.response;
//         builder.Prompts.confirm(session, `Should I activate this user right after creation?`, { listStyle: builder.ListStyle.button });
//     },
//     (session, results, next) => {
//         session.privateConversationData['enableUser'] = results.response;
//         session.sendTyping();
//         session.send(`Ok, here's all the info about the new user:`);
//         next();
//     },
//     (session, results, next) => {
//         session.sendTyping();
//         var userProperties = [];
//         userProperties = [
//             {
//                 title: 'Display Name',
//                 value: session.privateConversationData['displayName']
//             },
//             {
//                 title: 'User Principal Name',
//                 value: session.privateConversationData['userPrincipalName']
//             },
//             {
//                 title: 'Enable User?',
//                 value: session.privateConversationData['enableUser']
//             }
//         ];

//         var card = cards.buildUserSummaryAdaptiveCard(userProperties);
//         var msg = new builder.Message(session).addAttachment(card);
//         session.send(msg);
//         next();
//     },
//     (session, results) => {
//         session.sendTyping();
//         builder.Prompts.confirm(session, 'Could you please confirm all the info is correct?', { listStyle: builder.ListStyle.button })
//     },
//     (session, results, next) => {
//         graphAPI.getGraphAPIToken().then((result) => {
//             session.send(`Ok. I'll go to Azure create the this user and will get back yo you in a sec. Hang on there.`);
//             session.sendTyping();
//             passwordGenerator.generatePassword().then((generatedPassword) => {
//                 session.privateConversationData['password'] = generatedPassword.password;
//                 var jsonBody = JSON.parse(result.body);
//                 graphAPI.createUser(session.privateConversationData['enableUser'],
//                     session.privateConversationData['displayName'],
//                     session.privateConversationData['emailNickname'],
//                     {
//                         "password": session.privateConversationData['password'],
//                         "forceChangePasswordNextSignIn": true
//                     },
//                     `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`,
//                     jsonBody.access_token).then((response) => {
//                         next();
//                     });
//             }).catch((error) => {
//                 session.send(error);
//                 session.endDialog();
//             });
//         }).catch((errorMessage) => {
//             session.endConversation();
//         });
//     },
//     (session) => {
//         emailer.sendEmail('A user account has been created or modified', session.privateConversationData['password'], `${session.privateConversationData['userPrincipalName']}@rafaelnunes.onmicrosoft.com`).then((response) => {
//             session.send(`Done. The new user is now created. You should have got an e-mail with the password.`);
//             console.log(response);
//             session.endDialog();
//         }).catch((error) => {
//             console.log(response);
//             session.endDialog();
//         });
//     }
// ])
//     .triggerAction({
//         matches: 'createUser'
//     })
//     .cancelAction(
//     "cancelCreation", `Got it. Just canceled. Let me know when you wanna go back to it.`,
//     {
//         matches: /^(cancel|stop)$/i,
//         confirmPrompt: "This will cancel everything. Are you sure?"
//     }
//     );

// bot.use({
//     receive: (event, next) => {
//         next();
//     }
// });

module.exports = bot;
