
var Bot = require('botsilo');
var bot = new Bot('arby', 'arby'); // default host 'mqtts://botsilo.com:8883'
var fs = require('fs');

bot.on('connect', () => {
  console.log('connected to broker');
  bot.follow(bot.id);
  bot.info();
});

bot.on('close', () => {
  console.log('disconnected from broker');
  process.exit();
});

bot.on('message', (from, payload) => {
  if (from != 'server') {
    console.log('MESSAGE', from, JSON.stringify(payload, null, 2));
    fs.readFile('log', (err,data) => {
      if (err) return console.log(err);
      var lines = data.toString().split('\n');
      for (var line of lines.splice(lines.length - 50)) {
        if (line) bot.send(line, [from]);
      }
    })
  }
});

bot.on('error', (err) => {
  console.log('ERROR', err.message);
});

bot.start();
