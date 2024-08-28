const n = [
  129, 61, 8, 175, 160, 107, 124, 92, 95, 30, 17, 28, 171, 73, 173, 192, 145, 49, 138, 36, 192, 42, 114, 194, 125, 78,
  65, 42, 169, 113, 42, 50, 15, 199, 134, 197, 11, 63,
]

// Given the array of stock prices, find the maximum profit that can be made by buying and selling the stock.
// The stock must be bought before it's sold.
// For example, given [9, 11, 8, 5, 7, 10], you should return 5, since you could buy the stock at 5 dollars and sell it at 10 dollars.

function maxProfit(prices) {
  let maxProfit = 0
  let minPrice = prices[0]
  for (let i = 0; i < prices.length; i++) {
    minPrice = Math.min(minPrice, prices[i])
    maxProfit = Math.max(maxProfit, prices[i] - minPrice)
  }
  return maxProfit
}

console.log(maxProfit(n)) // 186
