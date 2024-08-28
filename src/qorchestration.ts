import { NS } from "@ns"

const seclevel = (ns: NS, target: string) => ns.print(`Security level  : ${ns.getServerSecurityLevel(target)}`)
const moneyLevel = (ns: NS, target: string) => ns.print(`Money Available : ${ns.getServerMoneyAvailable(target)}`)

const getHackTime = (ns: NS, target: string) => {
  const server = ns.getServer(target)
  ns.getPurchasedServerLimit
  return ns.formulas.hacking.hackTime(server, ns.getPlayer())
}

const getGrowTime = (ns: NS, target: string) => {
  return ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer())
}

const getWeakenTime = (ns: NS, target: string) => {
  return ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer())
}

const getThreadsGrowTo = (ns: NS, target: string, percentageOfServerMax: number) => {
  const server = ns.getServer(target)
  return ns.formulas.hacking.growThreads(
    server,
    ns.getPlayer(),
    (server.moneyMax || 0, server.cpuCores) / percentageOfServerMax,
  )
}

const getMoneyForHack = (ns: NS, target: string) => {
  const server = ns.getServer(target)
  const percentage = ns.formulas.hacking.hackPercent(server, ns.getPlayer())
  return (server.moneyAvailable || 0) * percentage
}

const getGrowPercentage = (ns: NS, target: string, threads: number) => {
  const server = ns.getServer(target)
  return ns.formulas.hacking.growPercent(server, threads, ns.getPlayer(), server.cpuCores)
}

const startGrow = async (ns: NS, delay = 0) => {
  await ns.sleep(delay)
  ns.print(`Starting grow job`)
  await ns.grow("n00dles", { threads: 1 })
  ns.print(`Grow job done`)
}

const startHack = async (ns: NS, delay = 0) => {
  await ns.sleep(delay)
  ns.print(`Starting hack job`)
  await ns.hack("n00dles", { threads: 1 })
  ns.print(`hack job done`)
}

const startWeaken = async (ns: NS, delay = 0) => {
  await ns.sleep(delay)
  ns.print(`Starting weaken job`)
  await ns.weaken("n00dles", { threads: 1 })
  ns.print(`Weaken job done`)
}

export async function main(ns: NS): Promise<void> {
  const target = "n00dles"
  ns.tail()
  ns.disableLog("ALL")

  seclevel(ns, target)
  moneyLevel(ns, target)

  const expectedHackTime = getHackTime(ns, target)
  const expectedGrowTime = getGrowTime(ns, target)
  const expectedWeakenTime = getWeakenTime(ns, target)
  const expectedThreadsGrowTo = getThreadsGrowTo(ns, target, 100)
  const expectedMoneyForHack = getMoneyForHack(ns, target)
  const expectedGrowPercentage = getGrowPercentage(ns, target, expectedThreadsGrowTo)

  ns.print(`
    Expected hack time: ${expectedHackTime}
    Expected grow time: ${expectedGrowTime}
    Expected weaken time: ${expectedWeakenTime}
    Expected threads to grow to: ${expectedThreadsGrowTo}
    Expected money for hack: ${ns.formatNumber(expectedMoneyForHack)}
    Expected grow percentage: ${expectedGrowPercentage}
`)

  const hackOffset = expectedWeakenTime - expectedHackTime
  const growOffset = expectedWeakenTime - expectedGrowTime

  // ns.exec("x-hack.ts", "home", 1, hackOffset, target)

  // await startHack(ns, hackOffset)
  // startGrow(ns, growOffset)
  // startWeaken(ns, 0)
  // await ns.sleep(expectedWeakenTime + 2000)

  // let start = Date.now()
  // const money = await ns.hack(target, { threads: 1 })
  // seclevel(ns, target)
  // moneyLevel(ns, target)
  // ns.print(`Got: ${ns.formatNumber(money)}`)
  // ns.print(`Hacked in ${Date.now() - start}ms`)
  //
  // start = Date.now()
  // const weaken = await ns.weaken(target, { threads: 1 })
  // ns.print(`Weakened by: ${weaken}`)
  // seclevel(ns, target)
  // moneyLevel(ns, target)
  // ns.print(`Weakened in ${Date.now() - start}ms`)
  //
  // start = Date.now()
  // const grow = await ns.grow(target, { threads: 1 })
  // ns.print(`Grown by: ${grow}`)
  // seclevel(ns, target)
  // moneyLevel(ns, target)
  // ns.print(`Grown in ${Date.now() - start}ms`)
}
