const { getValueFromObject } = require("../../modules/utils");

const interpolationFindRegex = /\${([\w.]+)}/g;

exports.populateAllParamsFromApi = function (messageInfo, apiResponseDetails, fallback) {
  for(var key in messageInfo){
    messageInfo[key] = populateParamsFromApi(messageInfo[key], apiResponseDetails, fallback);
  }
  return messageInfo;
}

const populateParamsFromApi = function (message, apiResponseDetails, fallback) {
  message = message.replace(interpolationFindRegex, (_, v) => getValue(apiResponseDetails, v) ?? fallback ?? _);
  message = message.replace(/'(\s|)'/g, "").replace(/\(\)/g, '');
  if(!interpolationFindRegex.test(message)) 
    return message;
}
exports.populateParamsFromApi = populateParamsFromApi;

const getValue = function (apiResponseDetails, param) {
  if(param){
    return getValueFromObject(apiResponseDetails.Request.Body, param) ?? 
      getValueFromObject(apiResponseDetails.Response.Body, param) ?? 
      getValueFromObject(apiResponseDetails.RouteParams, param);
  }
}
exports.getValue = getValue;