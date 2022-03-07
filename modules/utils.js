const fs = require('fs')

const templateType = process.env.TemplateType;
const interpolationFindRegex = /\${([\w.]+)}/g;

const replaceJSONParams = function (message, args) {
  let messageString = JSON.stringify(message);
  messageString = replaceParams(messageString, args);
  return JSON.parse(messageString);
}
exports.replaceJSONParams = replaceJSONParams;

const replaceParams = function (message, args) {
  return message.replace(interpolationFindRegex, (_, v) => getValueFromObject(args, v) ?? _);
}
exports.replaceParams = replaceParams;

exports.applyAppearances = function (messageCard) {
  return replaceJSONParams(messageCard, {
    buttonTextColor: process.env.ButtonTextColor,
    buttonBackgroundColor: process.env.ButtonBackgroundColor,
    backgroundImageUrl: process.env.NotificationBackgroundImage
  });
}

exports.getMessageTemplate = function (templateName) {
  const templateDirectory = `${__dirname}\\..\\templates\\${templateType}\\`;
  if (fs.existsSync(`${templateDirectory}${templateName}.json`)) {
    return require(`${templateDirectory}${templateName}.json`);
  }
  else{
    return fs.readFileSync(`${templateDirectory}${templateName}.txt`, 'utf8');
  }
}

const getValueFromObject = function(object, param){
  param.split('.').forEach(propName => {
    if(object)
      object = object[`${propName}`];
  });
  return object;
}
exports.getValueFromObject = getValueFromObject;