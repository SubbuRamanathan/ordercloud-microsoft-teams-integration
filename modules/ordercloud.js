const axios = require('axios');

exports.invoke = function(apiUrlPath, accessToken){
    const apiUrl = new URL(`${process.env.ORDERCLOUD_API_HOST}/v1${apiUrlPath}`);
    apiUrl.searchParams.append('pagesize', process.env.ReminderNotificationsLimitPerScheduledRun);
    return axios.get(apiUrl.toString(), {
        headers: { 'Authorization': 'Bearer ' + accessToken },
    });
}