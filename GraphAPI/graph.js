const request = require('request');
require('dotenv').config();

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
            client_id: '001a308e-36f6-433c-ab52-646f2c0b3dd6',
            scope: 'https://graph.microsoft.com/.default',
            client_secret: 'OiVDRYu0LHw9WaGOQkQe0QC',
            grant_type: 'client_credentials'
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
                //var bodyJSON = JSON.parse(body);
                if (error) {
                    reject(error);
                } else {
                    console.log(response);
                    console.log(accessToken);
                    resolve(response);
                }
            });
    });
};

module.exports = {
    getGraphAPIToken,
    createUser
}