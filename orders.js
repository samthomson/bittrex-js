
var config = require('./config');
var Bittrex = require('./index');
var nodeBittrex = require('node-bittrex-api');

var b = new Bittrex(config.bittrex.key, config.bittrex.secret);

nodeBittrex.options({
  apikey: config.bittrex.key,
  apisecret: config.bittrex.secret
});

var buyLimit = (market, q, r) => {
  return new Promise((resolve,reject) => {
    var offer = {
      MarketName: market,
      OrderType: 'LIMIT',
      Quantity: q,
      Rate: r,
      TimeInEffect: 'IMMEDIATE_OR_CANCEL', // supported options are 'IMMEDIATE_OR_CANCEL', 'GOOD_TIL_CANCELLED', 'FILL_OR_KILL'
      ConditionType: 'NONE', // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
      Target: 0, // used in conjunction with ConditionType
    };
    console.log(`LIMIT BUY: ${JSON.stringify(offer, null, 2)}`);
    nodeBittrex.tradebuy(offer, (data, err) => {
      if (err) return reject(new Error(err.message));
      resolve(data);
    })
  });
}

var sellLimit = (market, q, r) => {
  return new Promise((resolve,reject) => {
    var offer = {
      MarketName: market,
      OrderType: 'LIMIT',
      Quantity: q,
      Rate: r,
      TimeInEffect: 'GOOD_TIL_CANCELLED', // supported options are 'IMMEDIATE_OR_CANCEL', 'GOOD_TIL_CANCELLED', 'FILL_OR_KILL'
      ConditionType: 'NONE', // supported options are 'NONE', 'GREATER_THAN', 'LESS_THAN'
      Target: 0, // used in conjunction with ConditionType
    };
    console.log(`LIMIT SELL: ${JSON.stringify(offer,null,2)}`);
    nodeBittrex.tradesell(offer, (data, err) => {
      if (err) return reject(new Error(err.message));
      resolve(data);
    })
  })
}

module.exports.buyLimit = buyLimit;
module.exports.sellLimit = sellLimit;
