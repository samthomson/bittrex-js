
const Bittrex = require('./index');

var key = 'a64fcb611d4a4fbc82c739d2a02f1256';
var secret = '120d8c62e681470b9a7587d3217aa9c4';


function sortObject(obj) {
    var keysSorted = Object.keys(obj).sort((a,b) => {
      return obj[b] - obj[a]
    });
    var res = [];
    for (var k of keysSorted) {
      res.push([k, obj[k]]);
    };
    return res;
}

var bittrex = new Bittrex(key,secret);

setInterval(async () => {
  var summaries = await bittrex.req('/public/getmarketsummaries', {});

  var btcMarkets = {};
  var ethMarkets = {};
  var usdtMarkets = {};

  // build market map
  for (var s of summaries) {
    var other = s.MarketName.split('-')[1];
    if (s.MarketName.startsWith('BTC-')) {
      btcMarkets[other] = s;
    }
    else if (s.MarketName.startsWith('ETH-')) {
      ethMarkets[other] = s;
    }
    else if (s.MarketName.startsWith('USDT-')) {
      usdtMarkets[other] = s;
    }
  }

  var ethResults = {};
  for (var market in ethMarkets) {
    if (!(market in btcMarkets)) continue;
    var A = btcMarkets['ETH'];
    var B = ethMarkets[market];
    var C = btcMarkets[market];

    var routeNoFee = (1/A.Ask) * (1/B.Ask) * (C.Ask);
    var routeWithFee = ((1/A.Ask)*.9975) * ((1/B.Ask)*.9975) * (C.Bid*.9975);
    ethResults[market] = (routeWithFee-1.0)*100.0;
  }

  var usdtResults = {};
  for (var market in usdtMarkets) {
    if (!(market in btcMarkets)) continue;
    if (market == 'BTC') continue;
    var A = usdtMarkets['BTC'];
    var B = usdtMarkets[market];
    var C = btcMarkets[market];

    var routeNoFee = (A.Ask) * (1/B.Ask) * (C.Ask);
    var routeWithFee = ((A.Ask)*.9975) * ((1/B.Ask)*.9975) * (C.Bid*.9975);
    usdtResults[market] = (routeWithFee-1.0)*100.0;
  }

  // steps:
  // 1. Buy ETH with BTC (Buy for ask)
  // 2. Buy X with ETH (Buy for ask)
  // 3. Sell X for BTC (Sell for Last)

  var trimmed = sortObject(ethResults).slice(0,10);
  for (var t of trimmed) {
    var other = t[0];
    var route = t[1];
    if (route > 0.1) {
      console.log(`[${new Date().toLocaleString()}] BTC -> ETH -> ${other} -> BTC\t${route}`);
    }
  }

  var trimmed = sortObject(usdtResults).slice(0,10);
  for (var t of trimmed) {
    var other = t[0];
    var route = t[1];
    if (route > 0.1) {
      console.log(`[${new Date().toLocaleString()}] BTC -> USDT -> ${other} -> BTC\t${route}`);

    }
  }



  //console.log(`BTC -> ETH -> X -> BTC`);
  //console.log(sortObject(ethResults).slice(0,10));
  //console.log();
  //console.log(`BTC -> USDT -> X -> BTC`);
  //console.log(sortObject(usdtResults).slice(0,10));


}, 2000);

console.log(`[${new Date().toLocaleString()}] started`)
