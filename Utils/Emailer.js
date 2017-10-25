const request = require('request');
const path = require('path');
const graphAPI = require(path.join(__dirname, '..', 'GraphAPI/graph.js'));
const fs = require('fs');

var emailTemplate = fs.readFileSync(path.join(__dirname, '..', 'MailTemplates/PasswordEmail.html'), 'utf-8');

var sendEmail = (subject, password, userName) => {
    return new Promise((resolve, reject) => {
        graphAPI.getGraphAPIToken().then((response) => {
            var access_token = JSON.parse(response.body).access_token;

            var mailBody = {
                message: {
                    subject: `${subject}`,
                    toRecipients: [{
                        emailAddress: {
                            address: `rafael.fn@outlook.com`
                        }
                    }],
                    body: {
                        content: emailTemplate.replace('{{username}}', userName).replace('{{password}}', password),
                        contentType: "html"
                    }
                }
            }

            if (response) {
                var options = {
                    method: 'POST',
                    url: 'https://graph.microsoft.com/v1.0/users/o365bot@rafaelnunes.onmicrosoft.com/sendMail',
                    headers:
                    {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Length': Buffer.byteLength(JSON.stringify(mailBody), 'utf8')
                    },
                    body: JSON.stringify(mailBody),
                    SaveToSentItems: false,
                };

                console.log(options);

                request(options, (error, response, body) => {
                    if (body) {
                        resolve(body);
                    } else {
                        reject(body);
                    }
                });
            }
        }).catch((error) => {
            reject('5');
        });
    });
};

module.exports = {
    sendEmail
}