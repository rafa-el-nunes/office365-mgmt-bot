const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
var luisAppUrl = process.env.LUIS_APP_URL;

module.exports = {
    luisAppUrl
}