const teamsWebhook = require("../modules/teamswebhook.js");
const updateNotificationMessage = require("./modules/message.js");
const log = require("../modules/log.js");
const { isValidRequest } = require("./modules/validation.js");

log.setup();

module.exports = async function (context, request) {
    let responseMessage = '';
    let status;
    var operationIdOverride = {"ai.operation.id":context.traceContext.traceparent};

    const apiResponseDetails = request.body;
    if (apiResponseDetails && isValidRequest(request)) {
        try {
            const messageCard = updateNotificationMessage.compose(request, operationIdOverride);
            responseMessage = await teamsWebhook.send(apiResponseDetails.ConfigData.webhook, messageCard);
            status = 200;
            log.trace(responseMessage, operationIdOverride);
        } 
        catch (error) {
            error.message = `Failed to post the notification to Teams. Following error was encountered during the execution: \n${error.message}`;
            responseMessage = error.message;
            log.exception(error, operationIdOverride);
        }
    }
    else{
        responseMessage = 'Invalid Request!';
        log.exception(new Error(responseMessage), operationIdOverride);
    }
    context.res = {
        body: responseMessage,
        status: status ?? 500
    };
}