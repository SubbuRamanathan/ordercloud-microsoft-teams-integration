const templateType = process.env.TemplateType;
const interpolationFindRegex = /\${([\w.]+)}/g;

exports.populateParamsFromApi = function (message, apiResponseDetails, fallback) {
  message = message.replace(interpolationFindRegex, (_, v) => getValue(apiResponseDetails, v) ?? fallback ?? _);
  message = message.replace(/'(\s|)'/g, "").replace(/\(\)/g, '');
  if(!interpolationFindRegex.test(message)) 
    return message;
}

exports.replaceParams = function (message, args) {
  return message.replace(interpolationFindRegex, (_, v) => args[v] ?? _);
}

exports.getMessageTemplate = function (templateName) {
  return JSON.stringify(require(`${__dirname}\\..\\templates\\${templateType}\\${templateName}.json`));
}

const getValue = function (apiResponseDetails, param) {
  if(param){
    return getValueFromObject(apiResponseDetails.Request.Body, param) ?? 
      getValueFromObject(apiResponseDetails.Response.Body, param) ?? 
      getValueFromObject(apiResponseDetails.RouteParams, param);
  }
}
exports.getValue = getValue;

const getValueFromObject = function(object, param){
  param.split('.').forEach(propName => {
    if(object)
      object = object[`${propName}`];
  });
  return object;
}