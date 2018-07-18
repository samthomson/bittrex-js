
const Bittrex = require('./index');
const orders = require('./orders');
const delay = require('delay');

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



var getBalance = async (currency) => {
  return await bittrex.req('/account/getbalance', {currency});
}

var GOING = false;

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

    //var routeNoFee = (1/A.Ask) * (1/B.Ask) * (C.Ask);
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

    //var routeNoFee = (A.Ask) * (1/B.Ask) * (C.Ask);
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
    if (route > 0) {
      // Opportunity found!
      console.log(`[${new Date().toLocaleString()}] BTC -> ETH -> ${other} -> BTC\t${route}`);
      if (GOING) break;
      // In this case we are skipping the BTC -> ETH exchange and holding ETH instead
      // so we make two trades:
      // A: Buy X with ETH
      // B: Sell X for BTC

      var A = btcMarkets['ETH'];
      var B = ethMarkets[other];
      var C = btcMarkets[other];

      if (B.Volume < 100 || C.Volume < 100) {
        console.log('Volume too low', B.Volume, C.Volume);
        continue;
      }

      var ethAmount = .05;
      var otherAmount = (ethAmount / B.Ask).toFixed(8);

      if (route < 1) continue;

      console.log(`\nMAKING TRADES:`);
      console.log(`Order #0: BTC-ETH`);
      console.log(`@ ${A.Ask} BTC / ETH`);
      console.log(`Order #1: ETH-${other}`);
      console.log(`@ ${B.Ask} ETH / ${other}`);
      console.log(`Order #2: BTC-${other}`);
      console.log(`@ ${C.Bid} BTC / ${other}`);


      console.log(`\nTrying to buy ${otherAmount} ${other} for ${ethAmount} ETH @ ${B.Ask}`);

      if (GOING) break;
      GOING = true;

      try {
        var order = await orders.buyLimit(`ETH-${other}`, parseFloat(otherAmount), parseFloat(B.Ask));
        console.log(order);
        order = order.result;
      } catch (err) {
        console.log(err.message);
        console.log(`Error making ETH-${other} trade`);
        console.log('delaying 10 seconds');
        await delay(10*1000)
        GOING = false;
        break;
      }

      await delay(50);
      try {
        var orderResult = await bittrex.req('/account/getorder', {uuid: order.OrderId});
      } catch (err) {
        console.log(err.message);
        console.log(`Error making BTC-${other} trade`);
        console.log('delaying 10 seconds');
        await delay(10*1000)
        GOING = false;
        break;
      }
      console.log(`order result:`, orderResult);

      var filled = orderResult.Quantity - orderResult.QuantityRemaining;

      if (filled == 0) return console.log('First order did not fill');

      try {
        console.log(await orders.sellLimit(`BTC-${other}`, filled, parseFloat(C.Bid)));
      } catch (err) {
        console.log(err.message);
        console.log('delaying 10 seconds');
        await delay(10*1000)
        GOING = false;
        break;
      }


      break;



    }
  }

  //var trimmed = sortObject(usdtResults).slice(0,10);
  //for (var t of trimmed) {
  //  var other = t[0];
  //  var route = t[1];
  //  if (route > 0.1) {
  //    console.log(`[${new Date().toLocaleString()}] BTC -> USDT -> ${other} -> BTC\t${route}`);

  //  }
  //}



  //console.log(`BTC -> ETH -> X -> BTC`);
  //console.log(sortObject(ethResults).slice(0,10));
  //console.log();
  //console.log(`BTC -> USDT -> X -> BTC`);
  //console.log(sortObject(usdtResults).slice(0,10));


}, 500);

console.log(`[${new Date().toLocaleString()}] started`);
