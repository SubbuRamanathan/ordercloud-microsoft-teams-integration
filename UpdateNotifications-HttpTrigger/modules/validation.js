const { getValue } = require("./param");
const { isOcHashValid } = require("@ordercloud/catalyst");

exports.isValidRequest = function (request) {
  return isOcHashValid(request).then(function(isValid){
    if (!isValid)
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
  }).catch(function(error){
    throw error;
  });
}