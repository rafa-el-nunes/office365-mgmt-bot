const passwordGenerator = require('./passwords.js');
const emailer = require('./Emailer.js');

emailer.sendEmail('subject', 'body', 'rafael.fn@outlook.com').then((response) => {
    console.log('response');
}).catch((error) => {
    console.log('6');
});