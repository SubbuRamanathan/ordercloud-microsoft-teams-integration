const statusFactory = require("./status.js");

const templateType = process.env.TemplateType;
const interpolationFindRegex = /\${(\w+)}/g;

exports.compose = function (request) {
  const response = request.body.Response.Body;
  const configData = request.body.ConfigData;

  const status = statusFactory.create(request.body.Verb);
  let messageCard = getMessageTemplate(configData.template);
  messageCard = replaceParams(messageCard, {
    title: replaceParams(configData.title, { status: status.text }), 
    subtitle: configData.subtitle, 
    image: configData.image,
    themeColor: status.color });
    messageCard = populateResponseInfo(messageCard, response);

  let messageCardJSON = JSON.parse(messageCard);
  messageCardJSON.sections[0].facts = composeFacts(configData.facts, response, request.body.LogID);
  messageCardJSON.potentialAction = composeActions(configData.actions, response);

  return messageCardJSON;
}

const composeFacts = function(factNames, response, logId){
  let facts = [];
  const factTemplate = getMessageTemplate("fact");
  factNames.split('|').forEach(factName => {
    const fact = replaceParams(factTemplate, {
      name: factName,
      value: response[`${factName}`] ?? logId
    });
    facts.push(JSON.parse(fact)); 
  });
  return facts;
}

const composeActions = function(actionsInfo, response){
  let actions = [];
  const actionTemplate = getMessageTemplate("action");
  const actionsInfoJSON = JSON.parse(actionsInfo);
  for(var key in actionsInfoJSON){
    const action = replaceParams(actionTemplate, {
      name: key,
      url: populateResponseInfo(actionsInfoJSON[key], response)
    });
    actions.push(JSON.parse(action)); 
  }
  return actions;
}

const populateResponseInfo = function(message, response){
  return message.replace(interpolationFindRegex, (_, v) => response[`${v}`] ?? _);
}

const replaceParams = function(message, args){
  return message.replace(interpolationFindRegex, (_, v) => args[v] ?? _);
}

const getMessageTemplate = function(templateName){
  return JSON.stringify(require(`${__dirname}\\..\\templates\\${templateType}\\${templateName}.json`));
}