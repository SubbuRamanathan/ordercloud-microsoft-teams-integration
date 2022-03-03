const appInsights = require("applicationinsights");
const teamsWebhook = require("./modules/webhook.js");
const message = require("./modules/message.js");

appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, request) {
    let responseMessage = '';
    let status;
    var operationIdOverride = {"ai.operation.id":context.traceContext.traceparent};

    if (request.body) {
        try {
            const messageCard = message.compose(request);
            teamsWebhook.send(request.body.ConfigData.webhook, messageCard);
            responseMessage = 'Notification posted to Teams successfully!';
            status = 200;
            client.trackTrace({message: responseMessage, tagOverrides:operationIdOverride});
        } catch (error) {
            error.message = `Failed to post the notification to Teams. Following error was encountered during the execution: \n${error.message}`;
            responseMessage = error.message;
            client.trackException({exception: error, tagOverrides:operationIdOverride});
        }
    }
    else{
        responseMessage = 'Expected parameters are not found in the Payload!';
        client.trackException({exception: new Error(responseMessage), tagOverrides:operationIdOverride});
    }
    context.res = {
        body: responseMessage,
        status: status ?? 500
    };
}