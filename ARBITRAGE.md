

# Triangular Arbitrage Stategies


BTC -> ETH -> OTHER -> BTC


## Naive Strategy

1. Poll market data every X seconds
2. Calculate triangular spread between all pairs of markets
3. If opportunity found, buy OTHER with ETH (buy ask price)
4. Sell amount filled of OTHER for BTC (sell for bid price)

Enhancements:
- Ignore low volume pairs
- TODO: buffer bid/ask prices to make them more competitive
- TODO: instead of playing ImmediateOrCancel order, make it GoodTilCancelled
for a few seconds, cancel it, then sell the amount filled


## Enhanced Strategy

Use order book streams to increase success rate.
