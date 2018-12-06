# bittrex-js
Very simple Bittrex API wrapper for Node JS.

Created by [GAFO TECH](https://gafo.tech);

Information for the API can be found [here](https://support.bittrex.com/hc/en-us/articles/115003723911-Developer-s-Guide-API#apireference;)

## Installation

```bash
npm install bittrex-js
```

## Usage

Usage of [bittrex-api-js](#) is very simple. There is only one method after initialization:
`req`.

To make an API call, just call the `req` method with the endpoint and data object as parameters.

```javascript
var Bittrex = require('bittrex-api-js');

(async () => {
  var b = new Bittrex('apiKey', 'apiSecret');

  var ticker = await b.req('/public/getticker', {market: 'BTC'});

})

```

## Endpoints

*Request parameters coming soon*

### Public API

- /public/getmarkets
- /public/getmarkets
- /public/getcurrencies
- /public/getticker
- /public/getmarketsummaries
- /public/getmarketsummary
- /public/getorderbook
- /public/getmarkethistory

### Market API

- /market/buylimit
- /market/selllimit
- /market/cancel
- /market/getopenorders

### Account API

- /account/getbalances
- /account/getbalance
- /account/getdepositaddress
- /account/withdraw
- /account/getorder
- /account/getorderhistory
- /account/getwithdrawalhistory
- /account/getdeposithistory
