const notification = require("./modules/notification.js");
const Token = require('../modules/token.js');
const log = require("../modules/log.js");

log.setup();

module.exports = async function (context) {
    var operationIdOverride = { "ai.operation.id": context.traceContext.traceparent };
    const reminderQueries = Object.keys(process.env).filter((config) =>
        (/^Reminders.(.*).Query$/g).test(config) && process.env[config].trim() != '');
    if (reminderQueries.length > 0) {
        Token.getAccessToken().then(accessToken => {
            reminderQueries.forEach(key => {
                const templateName = key.split('.')[1];
                const reminderConfig = {
                    template: templateName,
                    connectorUrl: process.env[`Reminders.${templateName}.ConnectorUrl`],
                    query: process.env[key]
                }
                notification.send(reminderConfig, accessToken, operationIdOverride);
            });
        }).catch(function (error) {
            log.exception(error, operationIdOverride);
        });
    }
};