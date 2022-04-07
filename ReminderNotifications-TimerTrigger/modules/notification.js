const ordercloud = require("../../modules/ordercloud.js");
const teamsWebhook = require("../../modules/teamswebhook.js");
const log = require("../../modules/log");
const { replaceParams, replaceJSONParams, getMessageTemplate, applyAppearances } = require("../../modules/utils.js");

exports.send = function(config, accessToken, operationIdOverride){
    ordercloud.invoke(parseQuery(config.query), accessToken).then(apiResponse => {
        apiResponse.data.Items.forEach(result => {
            const messageCard = composeMessage(config.template, result);
            teamsWebhook.send(config.connectorUrl, messageCard).catch(function(error){
                log.exception(error, operationIdOverride, 'message', config.template);
            });
        });
    }).catch(function(error){
        log.exception(error, operationIdOverride, 'message', config.template);
    });
}

const composeMessage = function(templateName, result){
    const messageCard = replaceJSONParams(getMessageTemplate(templateName), result);
    return applyAppearances(messageCard);
}

const parseQuery = function(query){
    return replaceParams(query, {
        tomorrowDate: getTomorrowDate()
    });
}

const getTomorrowDate = function(){
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
}