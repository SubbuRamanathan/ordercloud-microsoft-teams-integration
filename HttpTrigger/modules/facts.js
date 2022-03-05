const appInsights = require("applicationinsights");
const { getMessageTemplate, replaceParams, getValue } = require("./param.js");

exports.composeFacts = function (factNames, apiResponseDetails, operationIdOverride) {
  let facts = [];

  try{
    const factTemplate = getMessageTemplate("fact");
    factNames.split('|').forEach(factName => {
      const fact = getFactObject(factTemplate, factName, getValue(apiResponseDetails, factName));
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
  }
  catch(error){
    console.log(`Encountered an exception while composing facts for ${apiResponseDetails.Route}. \n${error}`);
    appInsights.defaultClient.trackException({exception: error, tagOverrides:operationIdOverride});
  }

  return facts;
}

const getFactObject = function (factTemplate, factName, factValue) {
  if (factValue !== undefined) {
    const fact = replaceParams(factTemplate, {
      name: sanitizeName(factName),
      value: factValue
    });
    return JSON.parse(fact);
  }
}

const sanitizeName = function(name){
  const wordSeparatorRegex = /([a-z])([A-Z])/g;
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`.replace(wordSeparatorRegex, '$1 $2');
}
