const createUserDialog = [
    {
        order: 1,
        message: `How would you like the Display Name to be?`,
        userPropertyName: 'displayName',
        promptType: 'text'
    },
    {
        order: 2,
        message: `How would you like the userPrincipalName to be?`,
        userPropertyName: 'userPrincipalName',
        promptType: 'text'
    },
    {
        order: 3,
        message: `Should I activate this user right after creation?`,
        userPropertyName: 'enableUser',
        promptType: 'confirm'
    },
    {
        order: 6,
        message: 'Could you please confirm all the info is correct?',
        userPropertyName: '',
        promptType: 'confirm'
    },
    {
        order: 4,
        message: `Ok, here's all the info about the new user:`,
        userPropertyName: '',
        promptType: 'botmessage'
    },
    {
        order: 5,
        message: '',
        userPropertyName: '',
        promptType: 'adaptivecard'
    },
    {
        order: 7,
        message: `Ok. I'll go to Azure create the this user and will get back yo you in a sec. Hang on there.`,
        userPropertyName: '',
        promptType: 'botmessage'
    },
    {
        order: 8,
        message: ``,
        userPropertyName: '',
        promptType: 'createuser'
    },
    {
        order: 9,
        message: ``,
        userPropertyName: '',
        promptType: 'sendemail'
    },
    {
        order: 10,
        message: `Done. The new user is now created. You should have got an e-mail with the password.`,
        userPropertyName: '',
        promptType: 'botmessage'
    }
];

var getUserDialog = () => {
    var userDialog = JSON.parse(JSON.stringify(createUserDialog));
    return userDialog;
};

module.exports = {
    getUserDialog
}