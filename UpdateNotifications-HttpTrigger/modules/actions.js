const log = require("../../modules/log");
const { getMessageTemplate, replaceParams } = require("../../modules/utils");
const { populateParamsFromApi } = require("./param");

exports.compose = function (apiResponseDetails, operationIdOverride) {
  let actions = [];

  try {
    let actionsInfo = getActionsInfo(apiResponseDetails);
    const actionTemplate = getMessageTemplate("action");
    actionsInfo.forEach(action => {
      actions.push(replaceParams(actionTemplate, {
        name: action.text,
        url: action.url
      }));
    });
  }
  catch (error) {
    log.exception(error, operationIdOverride, 'actions', apiResponseDetails.Route);
  }

  return actions;
}

const getActionsInfo = function (apiResponseDetails) {
  let actionsInfo = [];
  const actionDetails = apiResponseDetails.ConfigData.actions;
  const actionDetailsJSON = JSON.parse(actionDetails);
  for (var actionText in actionDetailsJSON) {
    const actionUrl = populateParamsFromApi(actionDetailsJSON[actionText], apiResponseDetails);
    if (actionUrl) {
      actionsInfo.push({ 
        text: actionText,
        url: actionUrl 
      });
    }
  }
  return actionsInfo;
}