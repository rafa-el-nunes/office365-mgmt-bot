const path = require('path');
const graphAPI = require('./graph.js');
const microsoftGraph = require('@microsoft/microsoft-graph-client');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

var accessToken = null;

graphAPI.getGraphAPIToken().then((body) => {
    accessToken = body.token;

    console.log(accessToken);
    var client = microsoftGraph.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    console.log(accessToken);
    console.log(client);

    client.api('/users').get((error, response) => {
        console.log(response);
    });

}).catch((error) => {
    if (error) {
        console.log(`Error: ${error.errorTitle}.\nDescription: ${error.errorDescription}`);
    }
});