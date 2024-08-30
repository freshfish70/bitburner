import { NS } from "@ns"

type StockRow = {
  symbol: string
  ask: number | string
  bid: number | string
  price: number | string
  forcast: number | string
  company: string | number
  volatility: number | string
  shares?: number
  avgSharePrice?: number
}

type RowKey = keyof StockRow
type TableHeader = [RowKey, string, number][]

const HEADERS: TableHeader = [
  ["symbol", "SYMBOL", 8],
  ["company", "COMPANY", 12],
  ["ask", "ASK", 12],
  ["bid", "BID", 12],
  ["price", "PRICE", 12],
  ["forcast", "FORCAST", 12],
  ["volatility", "VOLATILITY", 12],
  ["shares", "SHARES", 12],
  ["avgSharePrice", "AVG PRICE", 12],
]

const logTableHeader = (ns: NS) => {
  const headers = HEADERS.map(([, h, l]) => h.padEnd(l, " "))
  ns.print(headers.join(" | "))
}

const logTable = (ns: NS, row: StockRow) => {
  const columns = HEADERS.reduce((acc: string[], [key, , columnWidth]) => {
    const value = row[key as RowKey]
    if (!value) {
      acc.push("".padEnd(columnWidth, " "))
    } else {
      acc.push(value.toString().slice(0, columnWidth).padEnd(columnWidth, " "))
    }
    return acc
  }, [])

  ns.print(columns.join(" | "))
}

const formatToDecimals = (v: number, d = 1): string => v.toFixed(d)

const RUN = true
export async function main(ns: NS): Promise<void> {
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  logTableHeader(ns)
  const STOCK_API = ns.stock
  const STOCK_CONSTANTS = STOCK_API.getConstants()
  const FEE = STOCK_CONSTANTS.StockMarketCommission

  do {
    ns.clearLog()
    logTableHeader(ns)

    const ALL_STOCKS = STOCK_API.getSymbols()
    ALL_STOCKS.sort((a, b) => STOCK_API.getPrice(b) - STOCK_API.getPrice(a))

    for (const symbol of ALL_STOCKS) {
      const company = STOCK_API.getOrganization(symbol)

      const ask = STOCK_API.getAskPrice(symbol)
      // Sell price...
      const bid = STOCK_API.getBidPrice(symbol)
      const price = STOCK_API.getPrice(symbol) // WSE and TIX
      const forcast = STOCK_API.getForecast(symbol) // 4SIGMA => returns as 0.XXX
      const volatility = STOCK_API.getVolatility(symbol) // 4SIGMA => returns as 0.XXX

      const [shares, avgSharePrice] = STOCK_API.getPosition(symbol)

      if (symbol === "JGN" && !shares) {
        // const maxShares = Math.floor(ns.getServerMoneyAvailable("home") / price)
        // const purchaseCost = maxShares * price
        // const totalCost = purchaseCost + (purchaseCost * FEE)
        // const canAfford = ns.getServerMoneyAvailable("home") > totalCost

        // if (canAfford) {
        STOCK_API.buyStock(symbol, 100)
        //   ns.print(`Purchased ${maxShares} shares of ${symbol} for $${totalCost}`)
        // }
      }

      logTable(ns, {
        symbol,
        ask: formatToDecimals(ask),
        bid: formatToDecimals(bid),
        price: formatToDecimals(price),
        forcast: formatToDecimals(forcast, 5),
        company,
        volatility: formatToDecimals(volatility, 4),
        shares,
        avgSharePrice,
      })
    }

    await STOCK_API.nextUpdate()
  } while (RUN)
}
