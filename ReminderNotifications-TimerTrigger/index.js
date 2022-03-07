const notification = require("./modules/notification.js");
const Token = require('../modules/token.js');
const log = require("../modules/log.js");

log.setup();

module.exports = async function (context) {
    var operationIdOverride = {"ai.operation.id":context.traceContext.traceparent};
    const settings = require(`${__dirname}\\config.json`);
    Token.getAccessToken().then(accessToken => {
        settings.forEach(reminderConfig => {
            notification.send(reminderConfig, accessToken, operationIdOverride);
        });
    });
};