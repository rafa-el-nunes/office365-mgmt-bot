const path = require('path');
const graphAPI = require('./graph.js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

graphAPI.getGraphAPIToken().then((response) => {
    console.log(response);
});