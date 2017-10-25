const request = require('request');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

var getGraphAPIToken = () => {
    var options = {
        method: 'POST',
        url: 'https://login.microsoftonline.com/c021a310-bac1-4dd3-a72d-97b350560afe/oauth2/v2.0/token',
        headers:
        {
            'content-type': 'application/x-www-form-urlencoded'
        },
        form:
        {
            client_id: `${process.env.MICROSOFT_APP_ID}`,
            scope: `${process.env.SCOPE}`,
            client_secret: `${process.env.MICROSOFT_APP_PASSWORD}`,
            grant_type: `${process.env.GRANT_TYPE}`
        }
    };

    return new Promise((resolve, reject) => {
        request(options,
            (error, response, body) => {
                var bodyJSON = JSON.parse(body);
                if (bodyJSON.error) {
                    reject({
                        errorTitle: bodyJSON.error,
                        errorDescription: bodyJSON.error_description
                    });
                } else {
                    if (bodyJSON.access_token) {
                        resolve({
                            body: body
                        });
                    } else {
                        reject({
                            errorTitle: bodyJSON.error,
                            errorDescription: bodyJSON.error_description
                        });
                    }
                }
            });
    });
};

var createUser = (accountEnaled, displayName, mailNickname, passwordProfile, userPrincipalName, accessToken) => {
    var options = {
        url: 'https://graph.microsoft.com/v1.0/users',
        method: 'POST',
        headers:
        {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body:
        {
            accountEnabled: accountEnaled,
            displayName: displayName,
            mailNickname: mailNickname,
            passwordProfile: passwordProfile,
            userPrincipalName: userPrincipalName
        },
        json: true
    }

    return new Promise((resolve, reject) => {
        request(options,
            (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
    });
};

module.exports = {
    getGraphAPIToken,
    createUser
}