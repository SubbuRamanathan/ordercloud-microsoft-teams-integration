const { getValue } = require("./param");

exports.isValidRequest = function(apiResponseDetails){
  const filters = apiResponseDetails.ConfigData.filters;
  if(filters){
    const filtersJSON = JSON.parse(filters);
    for (var filter in filtersJSON) {
      let filterValue = filtersJSON[filter].replace('!','');
      if(filterValue == 'null')
        filterValue = undefined;

      const isMatch = getValue(apiResponseDetails, filter) === filterValue;
      const isNegate = filtersJSON[filter].indexOf('!') === 0;
      if((isNegate && isMatch) || (!isNegate && !isMatch))
        return false;
    }
  }
  return true;
}