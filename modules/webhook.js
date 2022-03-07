const axios = require('axios');

exports.send = async function (teamsWebhookUrl, messageCard) {
  try{
    if(!messageCard)
      throw new Error('Message Card is Empty');

    await axios.post(teamsWebhookUrl, messageCard, {
      headers: { 'content-type': 'application/json' },
    });
    return 'Notification posted to Teams successfully!';
  }
  catch(error){
    error.message = `${error.message} \nTeams Webhook:${teamsWebhookUrl} \nMessage: ${messageCard}`;
    throw error;
  }
}