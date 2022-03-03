const statusFactory = require("./status.js");

const templateType = process.env.TemplateType;
const interpolationFindRegex = /\${(\w+)}/g;

exports.compose = function (request) {
  const apiResponseDetails = request.body;
  const responseBody = request.body.Response.Body;
  const configData = request.body.ConfigData;

  const status = statusFactory.create(request.body.Verb);
  let messageCard = getMessageTemplate(configData.template);
  messageCard = replaceParams(messageCard, {
    title: replaceParams(configData.title, { status: status.text }),
    subtitle: configData.subtitle,
    image: getAssociatedProductImage(responseBody) ?? configData.fallbackImage,
    themeColor: status.color
  });
  messageCard = populateSpecificDetails(messageCard, apiResponseDetails, '');

  let messageCardJSON = JSON.parse(messageCard);
  messageCardJSON.sections[0].facts = composeFacts(configData.facts, apiResponseDetails);
  messageCardJSON.potentialAction = composeActions(configData.actions, apiResponseDetails);

  return messageCardJSON;
}

const composeFacts = function (factNames, apiResponseDetails) {
  let facts = [];
  const factTemplate = getMessageTemplate("fact");
  factNames.split('|').forEach(factName => {
    const fact = getFactObject(factTemplate, factName, apiResponseDetails.Response.Body[`${factName}`]);
    if (fact)
      facts.push(fact);
  });

  if (facts.length === 0){
    for(var param in apiResponseDetails.RouteParams){
      facts.push(getFactObject(factTemplate, param, apiResponseDetails.RouteParams[param]));      
    }
  }

  if (process.env.IncludeLogID)
    facts.push(getFactObject(factTemplate, 'LogID', apiResponseDetails.LogID));

  return facts;
}

const composeActions = function (actionsInfo, apiResponseDetails) {
  let actions = [];
  const actionTemplate = getMessageTemplate("action");
  const actionsInfoJSON = JSON.parse(actionsInfo);
  for (var key in actionsInfoJSON) {
    const actionUrl = populateSpecificDetails(actionsInfoJSON[key], apiResponseDetails);
    if (actionUrl) {
      const action = replaceParams(actionTemplate, {
        name: key,
        url: actionUrl
      });
      actions.push(JSON.parse(action));
    }
  }
  return actions;
}

const getFactObject = function (factTemplate, factName, factValue) {
  if (factValue !== undefined) {
    const fact = replaceParams(factTemplate, {
      name: factName,
      value: factValue
    });
    return JSON.parse(fact);
  }
}

const getAssociatedProductImage = function(response){
  //This method might need an update depending on how the image urls are stored in the extended properties for the implementation
  return response.xp?.Images[0]?.Url;
}

const getMessageTemplate = function (templateName) {
  return JSON.stringify(require(`${__dirname}\\..\\templates\\${templateType}\\${templateName}.json`));
}

const populateSpecificDetails = function (message, apiResponseDetails, fallback) {
  message = message.replace(interpolationFindRegex, (_, v) => apiResponseDetails.Response.Body[`${v}`] ?? 
    apiResponseDetails.RouteParams[`${v}`] ?? fallback ?? _);
  message = message.replace(/'(\s|)'/g, "").replace(/\(\)/g, '');
  if(!interpolationFindRegex.test(message)) 
    return message;
}

const replaceParams = function (message, args) {
  return message.replace(interpolationFindRegex, (_, v) => args[v] ?? _);
}