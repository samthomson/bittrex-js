
const Stream = require('./stream');
const Bittrex = require('./index');

var key = 'a64fcb611d4a4fbc82c739d2a02f1256';
var secret = '120d8c62e681470b9a7587d3217aa9c4';

var ticker;

setInterval(async () => {
  var b = new Bittrex(key, secret);
  var btc_eth = (await b.req('/public/getmarketsummary', {market: 'BTC-ETH'}))[0];
  var eth_qtm = (await b.req('/public/getmarketsummary', {market: 'ETH-QTUM'}))[0];
  var btc_qtm = (await b.req('/public/getmarketsummary', {market: 'BTC-QTUM'}))[0];

  var x = btc_eth.Ask * eth_qtm.Ask;
  var y = btc_qtm.Ask;


  var route = (1/btc_eth.Ask) * (1/eth_qtm.Ask) * (btc_qtm.Ask);
  console.log(route);
  console.log(`BTC -> ETH -> QTUM -> BTC`);
  console.log(((route-1.0)*100.0).toFixed(5));


}, 5000);




return;


var s = new Stream('BTC-ETH');
s.start();

s.on('message', m => {
  process.stdout.write('\033c');

  console.log(ticker);

  var count=0, q=0, avg=0;

  console.log(`\nBuys:`);
  m.Buys.map(b => {
    if (!(b.Q && b.R)) return;
    console.log(`${b.Q.toFixed(10)}\t${b.R}`);
    q += b.Q;
    avg += b.R;
    count++;
  });
  console.log('------------\t------------')
  console.log(`${q.toFixed(10)}\t${(1.0*avg/count).toFixed(5)}`);

  count=0;q=0;avg=0;
  console.log(`\nSells:`);
  m.Sells.map(s => {
    if (!(s.Q && s.R)) return;
    console.log(`${s.Q.toFixed(10)}\t${s.R}`);
    q += s.Q;
    avg += s.R;
    count++;
  });
  console.log('------------\t------------')
  console.log(`${q.toFixed(10)}\t${(1.0*avg/count).toFixed(5)}`);

  console.log(`\nFills:`);
  m.Fills.map(f => {
    console.log(`${f.Q.toFixed(10)}\t${f.R}`);
  });



  //console.log(JSON.stringify(m, null, 2));
});
