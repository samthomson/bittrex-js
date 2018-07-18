/**
 *  Node.js example
 *  https://github.com/Bittrex/beta
 *
 *  Adrian Soluch
 *
 *  prerequisites:
 *  npm i signalr-client jsonic
 *
 *  tested on node v9.10.1
 */
const signalR = require ('signalr-client');
const jsonic = require('jsonic');
const zlib = require('zlib');
const EventEmitter = require('events');


class Stream extends EventEmitter {

  constructor(market) {
    super();
    this.market = market;
  }

  start () {
    var client = new signalR.client (
      'wss://beta.bittrex.com/signalr',
      ['c2']
    );
    var market = this.market;
    let data, b64, raw, json;
    client.serviceHandlers.connected = (connection) => {
      console.log ('connected');
      client.call ('c2', 'SubscribeToExchangeDeltas', market).done ((err, result) => {
        if (err) { return console.error (err); }
        if (result === true) {
          console.log ('Subscribed to ' + market);
        }
      });
    }
    client.serviceHandlers.messageReceived = (message) => {
      data = jsonic (message.utf8Data);
      if (data.hasOwnProperty ('M')) {
        if (data.M[0]) {
          if (data.M[0].hasOwnProperty ('A')) {
            if (data.M[0].A[0]) {
              /**
               *  handling the GZip and base64 compression
               *  https://github.com/Bittrex/beta#response-handling
               */
              b64 = data.M[0].A[0];
              raw = new Buffer.from(b64, 'base64');

              zlib.inflateRaw (raw, (err, inflated) => {
                if (! err) {
                  json = JSON.parse (inflated.toString ('utf8'));
                  this.emit('message', {
                    Market: json.M,
                    Nonce: json.N,
                    Buys: json.Z,
                    Sells: json.S,
                    Fills: json.f
                  });
                }
              });
            }
          }
        }
      }
    };
  }

}

module.exports = Stream;

var stream = new Stream('BTC-WAX');
stream.start();
stream.on('message', m => {
  console.log(JSON.stringify(m, null, 2));
})
