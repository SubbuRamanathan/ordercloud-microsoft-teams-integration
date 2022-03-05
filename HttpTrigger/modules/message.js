const { composeActions } = require("./actions.js");
const { composeFacts } = require("./facts.js");
const { getMessageTemplate, replaceParams, populateParamsFromApi } = require("./param.js");
const statusFactory = require("./status.js");

exports.compose = function (request, operationIdOverride) {
  try{
    const apiResponseDetails = request.body;
    const responseBody = apiResponseDetails.Response.Body;
    const configData = apiResponseDetails.ConfigData;

    const status = statusFactory.create(configData.status?.toUpperCase() ?? apiResponseDetails.Verb);
    let messageCard = getMessageTemplate(configData.template);
    messageCard = replaceParams(messageCard, {
      title: replaceParams(configData.title, { status: status.text }),
      subtitle: configData.subtitle,
      image: getAssociatedProductImage(responseBody) ?? configData.fallbackImage,
      themeColor: status.color
    });
    messageCard = populateParamsFromApi(messageCard, apiResponseDetails, '');

    let messageCardJSON = JSON.parse(messageCard);
    messageCardJSON.sections[0].facts = composeFacts(configData.facts, apiResponseDetails, operationIdOverride);
    messageCardJSON.potentialAction = composeActions(configData.actions, apiResponseDetails, operationIdOverride);

    return messageCardJSON;
  }
  catch(error){
    error.message = `Encountered an exception while composing message for ${apiResponseDetails.Route}. \n${error.message}`;
    throw error;
  }
}

const getAssociatedProductImage = function(response){
  //This method might need an update depending on how the image urls are stored in the extended properties for the implementation
  if(response.xp?.Images)
    return response.xp?.Images[0]?.Url;
}