const express = require('express');
const router = express.Router();

router.get('/token', (request, response) => {
    console.log(request);
});