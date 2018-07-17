
'use strict';

var request = require('request');
var hmac = require('./hmac');

class Bittrex {

  /**
   * constructor - description
   *
   * @param  {type} apiKey    description
   * @param  {type} apiSecret description
   * @return {type}           description
   */
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * req - make Bittrex API request
   *
   * @param  {String} endpoint the endpoint to hit
   * @param  {Object} data     the data to hit with
   * @return {Promise}         resolves with request result, rejects otherwise
   */
  req(endpoint, data) {
    return new Promise((resolve,reject) => {
      var nonce = Math.floor(new Date().getTime() / 1000);
      var uri = `https://bittrex.com/api/v1.1${endpoint}?apiKey=${this.apiKey}&nonce=${nonce}`;
      for (var key in data) {
        uri += `&${key}=${data[key]}`;
      }
      var options = {
        method: 'GET',
        uri: uri,
        headers: {
          apisign: hmac(this.apiSecret, uri)
        }
      };
      request(options, (err,response,body) => {
        if (err) reject(err);
        try {
          var res = JSON.parse(body);
        } catch (err) {
         return reject(new Error('Request failed'));
        }
        if (res.success) resolve(res.result);
        else reject(new Error(res.message));
      });
    });
  }


  req2(endpoint, data) {
    return new Promise((resolve,reject) => {
      var nonce = Math.floor(new Date().getTime() / 1000);
      var uri = `https://bittrex.com/Api/v2.0${endpoint}?apiKey=${this.apiKey}&nonce=${nonce}`;
      for (var key in data) {
        uri += `&${key}=${data[key]}`;
      }
      var options = {
        method: 'POST',
        uri: uri,
        headers: {
          apisign: hmac(this.apiSecret, uri)
        },
        json: JSON.stringify(data)
      };
      request(options, (err,response,body) => {
        if (err) reject(err);
        try {
          var res = JSON.parse(body);
        } catch (err) {
          console.log(body);
         return reject(new Error('Request failed'));
        }
        if (res.success) resolve(res.result);
        else reject(new Error(res.message));
      });
    });
  }
}

module.exports = Bittrex;
