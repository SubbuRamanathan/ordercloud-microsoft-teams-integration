const appInsights = require("applicationinsights");
const teamsWebhook = require("./modules/webhook.js");
const message = require("./modules/message.js");
const { isValidRequest } = require("./modules/validation.js");

appInsights.setup();
const client = appInsights.defaultClient;

module.exports = async function (context, request) {
    let responseMessage = '';
    let status;
    var operationIdOverride = {"ai.operation.id":context.traceContext.traceparent};

    const apiResponseDetails = request.body;
    if (apiResponseDetails && isValidRequest(apiResponseDetails)) {
        try {
            const messageCard = message.compose(request, operationIdOverride);
            responseMessage = teamsWebhook.send(apiResponseDetails.ConfigData.webhook, messageCard);
            status = 200;
            client.trackTrace({message: responseMessage, tagOverrides:operationIdOverride});
        } catch (error) {
            error.message = `Failed to post the notification to Teams. Following error was encountered during the execution: \n${error.message}`;
            responseMessage = error.message;
            client.trackException({exception: error, tagOverrides:operationIdOverride});
        }
    }
    else{
        responseMessage = 'Invalid Request!';
        client.trackException({exception: new Error(responseMessage), tagOverrides:operationIdOverride});
    }
    context.res = {
        body: responseMessage,
        status: status ?? 500
    };
}