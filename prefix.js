/**
 * Include this file to insert a timestamp before every log.
 */

var prefix = require('log-prefix');
var colors = require('colors');

var patch = (func) => {
  prefix(func || defaultTimestamp) // prefix console.log with time
}

var defaultTimestamp = () => {
  return `[${new Date().toLocaleString()}]`.gray;
}

module.exports = patch;
patch(); // path automatically when required
