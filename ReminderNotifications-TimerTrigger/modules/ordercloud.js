const axios = require('axios');

exports.invoke = function(apiUrlPath, accessToken){
    const apiUrl = new URL(`${process.env.ORDERCLOUD_API_HOST}/v1${apiUrlPath}`);
    const settings = require(`${__dirname}\\..\\settings.json`);
    apiUrl.searchParams.append('pagesize', settings.ReminderNotificationsLimitPerScheduledRun);
    return axios.get(apiUrl.toString(), {
        headers: { 'Authorization': 'Bearer ' + accessToken },
    });
}