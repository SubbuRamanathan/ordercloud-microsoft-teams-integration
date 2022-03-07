const log = require("../../modules/log");
const { getMessageTemplate, replaceJSONParams } = require("../../modules/utils");
const { getValue } = require("./param.js");

exports.compose = function (apiResponseDetails, operationIdOverride) {
  let facts = [];

  try {
    let factsInfo = getFacts(apiResponseDetails);
    const factTemplate = getMessageTemplate("fact");
    for (var i = 0; i < factsInfo.length; i++) {
      facts.push(getFactObject(factTemplate, factsInfo[i]));
    };
  }
  catch (error) {
    log.exception(error, operationIdOverride, 'facts', apiResponseDetails.Route);
  }
  return facts;
}

const getFacts = function (apiResponseDetails) {
  let factsInfo = [];
  const factNames = apiResponseDetails.ConfigData.facts;
  factNames.split('|').forEach(factName => {
    const factInfo = {
      name: factName,
      value: getValue(apiResponseDetails, factName)
    };
    if (factInfo)
      factsInfo.push(factInfo);
  });

  if (factsInfo.length === 0) {
    for (var param in apiResponseDetails.RouteParams) {
      factsInfo.push({
        name: param,
        value: apiResponseDetails.RouteParams[param]
      });
    }
  }

  if (process.env.IncludeLogIDInNotifications)
    factsInfo.push({
      name: 'LogID',
      value: apiResponseDetails.LogID
    });

  return factsInfo;
}

const getFactObject = function (factTemplate, fact) {
  if (fact.value !== undefined) {
    return replaceJSONParams(factTemplate, {
      name: sanitizeName(fact.name),
      value: fact.value
    });
  }
}

const sanitizeName = function (name) {
  const wordSeparatorRegex = /([a-z])([A-Z])/g;
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`.replace(wordSeparatorRegex, '$1 $2');
}
