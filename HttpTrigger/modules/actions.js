const appInsights = require("applicationinsights");
const { replaceParams, populateParamsFromApi, getMessageTemplate } = require("./param");

exports.composeActions = function (actionsInfo, apiResponseDetails, operationIdOverride) {
  let actions = [];
  try{
    const actionTemplate = getMessageTemplate("action");
    const actionsInfoJSON = JSON.parse(actionsInfo);
    for (var key in actionsInfoJSON) {
      const actionUrl = populateParamsFromApi(actionsInfoJSON[key], apiResponseDetails);
      if (actionUrl) {
        const action = replaceParams(actionTemplate, {
          name: key,
          url: actionUrl
        });
        actions.push(JSON.parse(action));
      }
    }  
  }
  catch(error){
    console.log(`Encountered an exception while composing actions for ${apiResponseDetails.Route}. \n${error}`);
    appInsights.defaultClient.trackException({exception: error, tagOverrides:operationIdOverride});
  }
  return actions;
}