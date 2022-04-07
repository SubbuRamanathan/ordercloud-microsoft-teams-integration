const updateNotificationActions = require("./actions.js");
const updateNotificationFacts = require("./facts.js");
const statusFactory = require("./status.js");
const { populateAllParamsFromApi } = require("./param.js");
const { applyAppearances, replaceParams, getMessageTemplate, replaceJSONParams } = require("../../modules/utils.js");

exports.compose = function (request, operationIdOverride) {
  try {
    const messageCardInfo = getMessageCardInfo(request, operationIdOverride);
    let messageCard = getMessageTemplate(request.body.ConfigData.template);
    messageCard = replaceJSONParams(messageCard, messageCardInfo);

    if(process.env.TemplateType == 'classic'){
      messageCard.sections[0].facts = messageCardInfo.facts;
      messageCard.potentialAction = JSON.parse(`[${messageCardInfo.actions.join(',')}]`);
    }
    else{
      messageCard.sections[0].facts.splice.apply(messageCard.sections[0].facts, [1, 0].concat(messageCardInfo.facts));
      messageCard = replaceJSONParams(messageCard, {
        potentialActions: messageCardInfo.actions.join('')
      });
    }

    return applyAppearances(messageCard);
  }
  catch (error) {
    error.message = `Encountered an exception while composing message for ${apiResponseDetails.Route}. \n${error.message}`;
    throw error;
  }
}

const getMessageCardInfo = function (request, operationIdOverride) {
  const apiResponseDetails = request.body;
  const responseBody = apiResponseDetails.Response.Body;
  const configData = apiResponseDetails.ConfigData;

  const status = statusFactory.create(configData.status?.toUpperCase() ?? apiResponseDetails.Verb);
  let messageCardInfo = {
    title: replaceParams(configData.title, { status: status.text }),
    subtitle: configData.subtitle,
    image: getAssociatedProductImage(responseBody) ?? configData.image,
    themeColor: status.color
  };
  messageCardInfo = populateAllParamsFromApi(messageCardInfo, apiResponseDetails, '');

  messageCardInfo.facts = updateNotificationFacts.compose(apiResponseDetails, operationIdOverride);
  messageCardInfo.actions = updateNotificationActions.compose(apiResponseDetails, operationIdOverride);

  return messageCardInfo;
}

const getAssociatedProductImage = function (response) {
  //This method might need an update depending on how the image urls are stored in the extended properties for the implementation
  if (response.xp?.Images)
    return response.xp?.Images[0]?.Url;
}