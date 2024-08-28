const opts = {
  style: "currency",
  currency: "USD",
  notation: "standard",
  unitDisplay: "short",
  minimumFractionDigits: 0,
} as const

const usdFormatLong = Intl.NumberFormat("en-US", opts)
const usdFormatCompact = Intl.NumberFormat("en-US", { ...opts, notation: "compact" })

export const formatMoney = (money: number, compact = false) =>
  (compact ? usdFormatCompact : usdFormatLong).format(money)
