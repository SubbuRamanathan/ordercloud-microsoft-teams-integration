const appInsights = require("applicationinsights");

exports.setup = function(){
  appInsights.setup();
}

exports.exception = function (error, operationIdOverride, task, route) {
  if(task)
    error.message = `Encountered an exception while composing ${task} for ${route}. \n${error.message}`;

  appInsights.defaultClient.trackException({exception: error, tagOverrides:operationIdOverride});
}

exports.trace = function(message, operationIdOverride){
  appInsights.defaultClient.trackTrace({message: message, tagOverrides:operationIdOverride});
}