
'use strict';

var crypto = require('crypto');

/**
 * hmac - compute sha512 hmac given key and data
 *
 * @param  {String} key  the key to hmac with
 * @param  {String} data the data to hmac
 * @return {String}      the hmac
 */
var hmac = module.exports = (key, data) => {
  var hash = crypto.createHmac('sha512', key);
  hash.update(data);
  return hash.digest('hex');
}
