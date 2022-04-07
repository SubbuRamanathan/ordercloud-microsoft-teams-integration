const axios = require('axios');

class Token {
    static token = '';
    static expires = new Date();

    static getAccessToken = function () {
        if (Date.now() >= this.expires) {
            return Token.getNewAccessToken().then(tokenDetails => {
                this.token = tokenDetails.access_token;
                this.expires = new Date();
                this.expires.setSeconds(this.expires.getSeconds() + tokenDetails.expires_in);
                return this.token;
            }).catch(function(error){
                throw error;
            });
        }
        return Promise.resolve(this.token);
    }

    static getNewAccessToken = function () {
        const ordercloudTokenUrl = `${process.env.ORDERCLOUD_API_HOST}/oauth/token`;
        const requestBody = `client_id=${process.env.ORDERCLOUD_API_CLIENTID}&grant_type=client_credentials&client_secret=${process.env.ORDERCLOUD_API_CLIENTSECRET}&scope=FullAccess`;
        return axios.post(ordercloudTokenUrl, requestBody, {
            headers: { 'content-type': 'text/html; charset=UTF-8' }
        }).then((response) => {
            if (response.data.access_token === undefined)
                throw new Error('Unable to retrieve Access Token. Please Validate your OrderCloud Authorization Configurations.');
    
            return response.data;
        }).catch(function(error){
            error.message = `An Error occurred while fetching the Access Token. Please validate the OrderCloud Settings. \n${error.message}`;
            throw error;
        });
    }
}

module.exports = Token;