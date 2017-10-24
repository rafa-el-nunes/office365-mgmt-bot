function displayName(session, buider) {
    return builder.Prompts.text(session, `How would you like the Display Name to be?`);
}

function accountEnabled(session, builder) {
    return builder.Prompts.confirm(session, `Should I active this user right after creation?`);
}

function mailNickname(session, buider) {
    return builder.Prompts.text(session, `How would you like the Email Nickname to be?`);
}

function userPrincipalName(session, buider) {
    return builder.Prompts.text(session, `How would you like the userPrincipalName to be?`);
}

function password(session, buider) {
    return builder.Prompts.text(session, `Type a temporary password. The user will be prompted to change it during the first access.`);
}

var basicCreationDialog = (session, builder) => {
    displayName(session, builder);
    userPrincipalName(session, builder);
    mailNickname(session, builder);
    password(session, builder);
}

module.exports = {
    basicCreationDialog
}