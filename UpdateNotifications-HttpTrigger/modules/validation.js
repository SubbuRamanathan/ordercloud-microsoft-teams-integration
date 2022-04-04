const { getValue } = require("./param");
const crypto = require('crypto');

exports.isValidRequest = function (request) {
  if (!isValidSecret(request))
    return false;

  const filters = request.body.ConfigData.filters;
  if (filters) {
    const filtersJSON = JSON.parse(filters);
    for (var filter in filtersJSON) {
      let filterValue = filtersJSON[filter].replace('!', '');
      if (filterValue == 'null')
        filterValue = undefined;

      const isMatch = getValue(request.body, filter) === filterValue;
      const isNegate = filtersJSON[filter].indexOf('!') === 0;
      if ((isNegate && isMatch) || (!isNegate && !isMatch))
        return false;
    }
  }
  return true;
}

const isValidSecret = function (request) {
  if (process.env.ORDERCLOUD_WEBHOOK_SECRET != '') {
    var incomingEncryptedSecret = request.headers["x-oc-hash"];
    var computedEncryptedSecret = crypto.createHmac('SHA256', process.env.ORDERCLOUD_WEBHOOK_SECRET)
      .update(JSON.stringify(request.body)).digest('base64');
    if (incomingEncryptedSecret !== computedEncryptedSecret) {
      return false;
    }
  }
  return true;
}