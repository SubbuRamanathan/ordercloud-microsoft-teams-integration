const statusFactory = require("./status.js");

const templateType = process.env.TemplateType;
const interpolationFindRegex = /\${(\w+)}/g;

exports.compose = function (request) {
  const response = request.body.Response.Body;
  const configData = request.body.ConfigData;
  const modifiedObjectId = getModifiedObjectId(request.body.RouteParams);

  const status = statusFactory.create(request.body.Verb);
  let messageCard = getMessageTemplate(configData.template);
  messageCard = replaceParams(messageCard, {
    title: replaceParams(configData.title, { status: status.text }),
    subtitle: configData.subtitle,
    image: getAssociatedProductImage(response) ?? configData.fallbackImage,
    themeColor: status.color
  });
  messageCard = populateResponseInfo(messageCard, response, modifiedObjectId);

  let messageCardJSON = JSON.parse(messageCard);
  messageCardJSON.sections[0].facts = composeFacts(configData.facts, response, modifiedObjectId, request.body.LogID);
  messageCardJSON.potentialAction = composeActions(configData.actions, response);

  return messageCardJSON;
}

const composeFacts = function (factNames, response, modifiedObjectId, logId) {
  let facts = [];
  const factTemplate = getMessageTemplate("fact");
  factNames.split('|').forEach(factName => {
    const fact = getFactObject(factTemplate, factName, response[`${factName}`]);
    if (fact)
      facts.push(fact);
  });

  if (facts.length === 0)
    facts.push(getFactObject(factTemplate, 'ID', modifiedObjectId));

  if (process.env.IncludeLogID)
    facts.push(getFactObject(factTemplate, 'LogID', logId));

  return facts;
}

const composeActions = function (actionsInfo, response) {
  let actions = [];
  const actionTemplate = getMessageTemplate("action");
  const actionsInfoJSON = JSON.parse(actionsInfo);
  for (var key in actionsInfoJSON) {
    const actionUrl = populateResponseInfo(actionsInfoJSON[key], response);
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

const populateResponseInfo = function (message, response, fallback) {
  const messageWithResponseInfo = message.replace(interpolationFindRegex, (_, v) => response[`${v}`] ?? fallback ?? _);
  if(!interpolationFindRegex.test(messageWithResponseInfo)) 
    return messageWithResponseInfo;
}

const replaceParams = function (message, args) {
  return message.replace(interpolationFindRegex, (_, v) => args[v] ?? _);
}

const getModifiedObjectId = function (routeParams) {
  for (var propName in routeParams) {
    if (routeParams.hasOwnProperty(propName)) {
      return routeParams[propName];
    }
  }
}