const fs = require('fs');

var template = fs.readFileSync('./PasswordEmail.html', 'utf-8');

template = template.replace('{{username}}', 'TEST').replace('{{password}}', 'TEST2');

console.log(template);