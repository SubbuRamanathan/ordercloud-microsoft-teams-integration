const axios = require('axios');

exports.send = async function (teamsWebhookUrl, messageCard) {
  try{
    const response = await axios.post(teamsWebhookUrl, messageCard, {
      headers: { 'content-type': 'application/json' },
    });
    return `${response.status} - ${response.statusText}`;
  }
  catch(error){
    error.message = `${error.message} \nTeams Webhook:${teamsWebhookUrl} \nMessage: ${messageCard}`;
    throw error;
  }
}