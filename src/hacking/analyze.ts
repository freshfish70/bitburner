import { NS, Server } from "@ns"

const getHackTime = (ns: NS, target: Server) => {
  return ns.formulas.hacking.hackTime(target, ns.getPlayer())
}

const getGrowTime = (ns: NS, target: Server) => {
  return ns.formulas.hacking.growTime(target, ns.getPlayer())
}

const getWeakenTime = (ns: NS, target: Server) => {
  return ns.formulas.hacking.weakenTime(target, ns.getPlayer())
}

const getThreadsGrowTo = (ns: NS, target: Server, percentageOfServerMax: number) => {
  return ns.formulas.hacking.growThreads(
    target,
    ns.getPlayer(),
    (target.moneyAvailable || 0) * (1 + percentageOfServerMax / 100),
    target.cpuCores,
  )
}

const getMoneyForHack = (ns: NS, target: Server) => {
  const percentage = ns.formulas.hacking.hackPercent(target, ns.getPlayer())
  return (target.moneyAvailable || 0) * percentage
}

const getGrowPercentage = (ns: NS, target: string, threads: number) => {
  const server = ns.getServer(target)
  return ns.formulas.hacking.growPercent(server, threads, ns.getPlayer(), server.cpuCores)
}

const i = (ns: NS, target: string) => ({
  Security_level: ns.getServerSecurityLevel(target),
  Min_Security_level: ns.getServerMinSecurityLevel(target),
  Money_Max: ns.getServerMaxMoney(target),
  Money_Available: ns.getServerMoneyAvailable(target),
  Hack_time: ns.getHackTime(target),
  Weaken_time: ns.getWeakenTime(target),
  Grow_time: ns.getGrowTime(target),
})

/**
 * Constant value for weaken.
 * This is the value that we will weaken the server by for each thread.
 */
const WEAKEN_DECREASE_VALUE = 0.05
const HACK_INCREASE_VALUE = 0.002
const SCRIPT_RAM = 1.75

const getThreadsToReduceSecurity = (ns: NS, target: string, security: number) => {
  const currentSecurity = ns.getServerSecurityLevel(target)
  const diff = currentSecurity - security
  return Math.ceil(diff / WEAKEN_DECREASE_VALUE)
}

export const getTargetStats = (ns: NS, target: string) => {
  const server = ns.getServer(target)

  const currentMoney = server.moneyAvailable || 0
  const maxMoney = server.moneyAvailable || 0

  // diff in percentage between current and max money
  const moneyDiff = (currentMoney / maxMoney) * 100
  let growthPercentage = 10
  if (moneyDiff < 10) {
    growthPercentage = moneyDiff
  }

  // 5 hack = 1 decrease in security
  // 1 hack = 0.2 decrease in security

  return {
    currentSecurity: server.hackDifficulty,
    mininumSecurity: server.minDifficulty,
    weaken: {
      time: getWeakenTime(ns, server),
      threads: getThreadsToReduceSecurity(ns, target, server.minDifficulty || 0),
    },
    grow: {
      time: getGrowTime(ns, server),
      threads: getThreadsGrowTo(ns, server, growthPercentage),
    },
    hack: {
      time: getHackTime(ns, server),
      returnsForOneThread: getMoneyForHack(ns, server),
    },
  }
}

export const weakenAnalyze = async (ns: NS, target: string) => {
  const weakenTime = ns.getWeakenTime(target)
  ns.print(`Weaken time: ${weakenTime}`)
  const currentSecurity = ns.getServerSecurityLevel(target)
  const minSecurity = 5 //ns.getServerMinSecurityLevel(target)
  const diff = currentSecurity - minSecurity
  ns.print(`Diff: ${diff}`)
  const threads = Math.ceil(diff / WEAKEN_DECREASE_VALUE)
  const a = ns.weakenAnalyze(threads, 1)
  ns.print(`Require ${threads} threads to get to ${minSecurity} from ${currentSecurity}`)
  ns.print(`Expected reduce: ${a}`)
  const reducedBy = await ns.weaken(target, { threads })
  ns.print(`Reduced by: ${reducedBy}`)
  ns.print(`New security: ${ns.getServerSecurityLevel(target)}`)
}

export const growAnalyzis = async (ns: NS, target: string) => {
  const growTime = ns.getGrowTime(target)
  ns.print(`Grow time: ${growTime}`)
  // const per = 10
  // const threads = getThreadsGrowTo(ns, target, per)
  // ns.print(`Require: ${threads} to get to ${per}% of server max`)
  // const growPercentage = getGrowPercentage(ns, target, threads)
  // ns.print(`For ${threads} threads it would grow to ${growPercentage}%`)
  const threads = 10
  const sec = ns.growthAnalyzeSecurity(threads, target, ns.getServer().cpuCores)
  ns.print(`Sec growth: ${sec}`)
  const s = ns.getServerSecurityLevel(target)
  ns.print(`Expected sec after growth: ${s + sec}`)

  ns.print(`Money: ${ns.getServerMoneyAvailable(target)}`)
  ns.print(`Security: ${s}`)
  const w = await ns.grow(target, { threads })
  ns.print(`Applied ${w}x multiplier`)
  ns.print(`Money: ${ns.getServerMoneyAvailable(target)}`)
  ns.print(`Security: ${ns.getServerSecurityLevel(target)}`)
}

export const hackAnalyze = async (ns: NS, target: Server) => {
  const hackTime = ns.getHackTime(target.hostname)
  const h = getHackTime(ns, target)
  ns.print(hackTime, h)
}
