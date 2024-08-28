import { NS } from "@ns"

// export async function main(ns: NS) {
//   const flags = ns.flags([
//     ["refreshrate", 200],
//     ["help", false],
//   ]) as any
//   if (flags._.length === 0 || flags.help) {
//     ns.tprint("This script helps visualize the money and security of a server.")
//     ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`)
//     ns.tprint("Example:")
//     ns.tprint(`> run ${ns.getScriptName()} n00dles`)
//     return
//   }
//   ns.tail()
//   ns.disableLog("ALL")
//   while (true) {
//     const server = flags._[0]
//     let money = ns.getServerMoneyAvailable(server)
//     if (money === 0) money = 1
//     const maxMoney = ns.getServerMaxMoney(server)
//     const minSec = ns.getServerMinSecurityLevel(server)
//     const sec = ns.getServerSecurityLevel(server)
//     ns.clearLog()
//     ns.print(`${server}:`)
//     ns.print(
//       ` $_______: ${ns.formatNumber(money)} / ${ns.formatNumber(maxMoney)} (${((money / maxMoney) * 100).toFixed(2)}%)`,
//     )
//     ns.print(` security: +${(sec - minSec).toFixed(2)}`)
//     ns.print(` hack____: ${ns.tFormat(ns.getHackTime(server))} (t=${Math.ceil(ns.hackAnalyzeThreads(server, money))})`)
//     ns.print(
//       ` grow____: ${ns.tFormat(ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`,
//     )
//     ns.print(` weaken__: ${ns.tFormat(ns.getWeakenTime(server))} (t=${Math.ceil((sec - minSec) * 20)})`)
//     await ns.sleep(flags.refreshrate)
//   }
// }

/** @param {NS} ns */
export async function main(ns: NS) {
  const args = ns.args

  if (!args.length) {
    ns.tprint("This script helps visualize the money and security of a server.")
    ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`)
    ns.tprint("Example:")
    ns.tprint(`> run ${ns.getScriptName()} n00dles`)
    return
  }

  ns.disableLog("ALL")
  ns.clearLog()
  ns.tail()

  const server = args[0]?.toString()
  const refreshRate = 1000

  const dots = [".", "..", "...", "...."]
  let indexDots = 0

  while (true) {
    const serverCurrentSecurity = ns.getServerSecurityLevel(server)
    const serverMinSecurity = ns.getServerMinSecurityLevel(server)
    const serverMaxMoney = ns.getServerMaxMoney(server)

    let serverCurrentMoney = ns.getServerMoneyAvailable(server)
    if (serverCurrentMoney === 0) serverCurrentMoney = 1

    const moneyPercent = ((serverCurrentMoney / serverMaxMoney) * 100).toFixed(2)
    const weakenThreads = Math.ceil((serverCurrentSecurity - serverMinSecurity) * 20)
    const growThreads = Math.ceil(ns.growthAnalyze(server, serverMaxMoney / serverCurrentMoney))
    const growThreadsHome = Math.ceil(
      ns.growthAnalyze(server, serverMaxMoney / serverCurrentMoney, ns.getServer().cpuCores),
    )
    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(server, serverCurrentMoney))
    const hackChance = ns.hackAnalyzeChance(server) * 100
    const moneyStolenPerThread = (ns.hackAnalyze(server) * 100).toFixed(2)

    const dot = dots[indexDots]

    ns.print("=============================================================")
    ns.print(` Server: ${server}`)
    ns.print(` Money: ${ns.formatNumber(serverCurrentMoney)} / ${ns.formatNumber(serverMaxMoney)} (${moneyPercent}%)`)
    ns.print(` Hack Chance: ${hackChance}%`)
    ns.print(` Security   : +${(serverCurrentSecurity - serverMinSecurity).toFixed(2)}`)
    ns.print(` Weaken     : ${ns.tFormat(ns.getWeakenTime(server))} (t=${weakenThreads})`)
    ns.print(
      ` Grow       : ${ns.tFormat(ns.getGrowTime(server))} (t=${growThreads}/core, t=${growThreadsHome}/${ns.getServer().cpuCores} cores)`,
    )
    ns.print(` Hack       : ${ns.tFormat(ns.getHackTime(server))} (t=${hackThreads}) ${moneyStolenPerThread}% / thread`)

    ns.print("-------------------------------------------------------------")
    ns.print(` Running ${dot}`)
    ns.print("=============================================================")

    await ns.sleep(refreshRate)

    indexDots = (indexDots + 1) % dots.length

    ns.clearLog()
  }
}
