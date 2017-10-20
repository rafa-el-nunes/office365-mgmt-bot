"use strict";

const builder = require("botbuilder");
const dialog = require("./dialogs/luis");
const bot = new builder.UniversalBot(
    new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
    }), 
    dialog.waterfall
);

bot.recognizer(new builder.LuisRecognizer(process.env.LUIS_MODEL_URL));

module.exports = bot;
