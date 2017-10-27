const userSummaryAdaptiveCard = {
    contentType: 'application/vnd.microsoft.card.adaptive',
    content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.0',
        body: [
            {
                type: 'Container',
                items: [
                    {
                        type: 'TextBlock',
                        text: 'User summary',
                        weight: 'bolder',
                        isSubtle: false,
                        size: 'extraLarge',
                        wrap: true
                    },
                    {
                        type: 'TextBlock',
                        text: 'Important: The password will be generated and sent out to your e-mail. The user will have to change the password on the first access.',
                        wrap: true,
                        size: 'medium'
                    },
                    {
                        type: 'FactSet',
                        spacing: 'extraLarge',
                        separator: true,
                        facts: []
                    }
                ]
            }
        ],
        actions: []
    }
};

function buildUserSummaryAdaptiveCard(userProperties) {
    var payload = JSON.parse(JSON.stringify(userSummaryAdaptiveCard));
    userProperties.forEach(function (element) {
        console.log(typeof (element.value));
        payload.content.body[0].items[2].facts.push(
            {
                type: 'Fact',
                title: element.title,
                value: typeof (element.value) === 'boolean' ? element.value.toString() : element.value
            }
        );
    }, this);
    return payload;
}

module.exports = {
    buildUserSummaryAdaptiveCard,
    userSummaryAdaptiveCard
}