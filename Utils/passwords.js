const passwordGenerator = require('generate-password');

var passwordSettings = {
    length: 16,
    numbers: true,
    uppercase: true,
    strict: true,
    symbols: true
};

var generatePassword = () => {
    return new Promise((resolve, reject) => {
        var generatedPassword = passwordGenerator.generate(passwordSettings);
        if(generatedPassword.length === 16) {
            resolve({password: generatedPassword});
        } else {
            reject({error: 'There was a problem generating the password.'});
        }
    });
};

module.exports = {
    generatePassword
};