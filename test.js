
var Bittrex = require('./index');
var orders = require('./orders');
var config = require('./config');


var b = new Bittrex(config.bittrex.key, config.bittrex.secret);

(async () => {
  var ticker = await b.req('/public/getticker', {market: 'BTC-ETH'});

  var rate = parseFloat((ticker.Ask*.90).toFixed(6));

  var order = await orders.buyLimit('BTC-ETH', .01, rate);
  console.log(order);

})();
