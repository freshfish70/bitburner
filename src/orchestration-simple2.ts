import { NS } from "@ns"

const TARGETS = [
  // "megacorp",
  // "nwo",
  // "kuai-gong",
  // "clarkinc",
  // "b-and-a",
  // "4sigma",
  // "blade",
  // "omnitek",
  // "global-pharm",
  // "deltaone",
  // "zeus-med",
  // "nova-med",
  // "univ-energy",
  // "unitalife",
  // "zb-institute",
  // "stormtech",
  // "aerocorp",
  // "omnia",
  // "icarus",
  // "zb-def",
  // "powerhouse-fitness",
  // "titan-labs",
  // "defcomm",
  // "taiyang-digital",
  // "solaris",
  // "vitalife",
  // "galactic-cyber",
  // "infocomm",
  // "applied-energetics",
  // "lexo-corp",
  // "alpha-ent",
  // "rho-construction",
  // "helios",
  // "microdyne",
  // "syscore",
  // "catalyst",
  // "snap-fitness",
  // "summit-uni",
  // "aevum-police",
  // "netlink",
  // "millenium-fitness",
  "computek",
  "rothman-uni",
  "the-hub",
  "johnson-ortho",
  "omega-net",
  "crush-fitness",
  "silver-helix",
  "phantasy",
  "iron-gym",
  "max-hardware",
  "zer0",
  "neo-net",
  "harakiri-sushi",
  "hong-fang-tea",
  "nectar-net",
  "joesguns",
  "sigma-cosmetics",
  "foodnstuff",
  "fulcrumassets",
  "n00dles",
]

let WORK_SERVERS = []

// Key = server
//
type Work = {
  pid: number
  host: string
  task: string
  ms: number
}
const WORK_MAP = new Map<string, Work>()

const WEAKEN_RAM = 1.75
const GROW_RAM = 1.75
const HACK_RAM = 1.7

const DEBUG = true

const getThreadsToUse = (factor: number, reduction: number, maxThreads: number) => {
  // Since we floor the result we might end up with returning 1 less thread than we should.
  // To avoid this we add 1 to the base.
  const base = Math.floor(factor / reduction) + 1
  // We return the minimum of the base and the maxThreads, in case +1 exceeds the maxThreads.
  return Math.min(base, maxThreads)
}

const startWork = (key: string, _ms: number, _pid: number, _host: string, _task: string) => {
  WORK_MAP.set(key, {
    ms: _ms,
    pid: _pid,
    host: _host,
    task: _task,
  })
}

const endWork = (key: string) => {
  WORK_MAP.delete(key)
}

const getWork = (key: string) => {
  return WORK_MAP.get(key)
}

const C_SECURITY = (v: string | number) => (+v).toFixed(1).toString()

const headers = [
  "NODE       ",
  "SECURITY   ",
  "MONEY      ",
  "EARNS      ",
  "WORKER     ",
  "THREADS    ",
  "MAX THREADS",
]
const logTableHeader = (ns: NS) => {
  const header = headers.join(" | ")
  ns.print(header)
}

const logTable = (
  ns: NS,
  node: string,
  security: string,
  money: string | number,
  earns: string | number,
  worker: string,
  threads: string | number,
  maxThreads: string | number,
) => {
  const row = [node, security, money, earns, worker, threads, maxThreads]
  for (let i = 0; i < row.length; i++) {
    row[i] = row[i].toString().slice(0, headers[i].length).padEnd(headers[i].length, " ")
  }

  ns.print(row.join(" | "))
}

export async function main(ns: NS): Promise<void> {
  // const target = "silver-helix"
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  WORK_SERVERS = [ns.getPurchasedServers()[0]]

  for (const server of WORK_SERVERS) {
    ns.scp(["/hacking/x-weaken.js", "/hacking/x-grow.js", "/hacking/x-hack.js"], server)
  }

  const log = (msg: string) => {
    if (!DEBUG) return
    ns.print(msg)
  }

  const T = true
  while (T) {
    ns.clearLog()
    logTableHeader(ns)

    for (const node of TARGETS) {
      const NODE_CURRENT_MONEY = Math.max(ns.getServerMoneyAvailable(node), 1)
      const NODE_MAX_MONEY = ns.getServerMaxMoney(node)

      const NODE_MIN_SECURITY = ns.getServerMinSecurityLevel(node)
      const NODE_CURRENT_SECURITY = ns.getServerSecurityLevel(node)
      const NODE_SECURITY_DIFFERENCE = NODE_CURRENT_SECURITY - NODE_MIN_SECURITY

      const HACK_TIME = Math.ceil(ns.getHackTime(node))
      const GROW_TIME = Math.ceil(ns.getGrowTime(node))
      const WEAKEN_TIME = Math.ceil(ns.getWeakenTime(node))

      for (const WORK_SERVER of WORK_SERVERS) {
        const WORK_NODE_NAME = `${WORK_SERVER}_${node}`

        const WORKER = ns.getServer(WORK_SERVER)
        const WORKER_RAM = WORKER.maxRam
        const WORKER_USED_RAM = WORKER.ramUsed

        const WORKER_FREE_RAM = WORKER_RAM - WORKER_USED_RAM
        const WORKER_CPU_CORES = WORKER.cpuCores || 1

        const MAX_HACK_THREADS = Math.floor(WORKER_FREE_RAM / HACK_RAM)
        const MAX_GROW_THREADS = Math.floor(WORKER_FREE_RAM / GROW_RAM)
        const MAX_WEAKEN_THREADS = Math.floor(WORKER_FREE_RAM / WEAKEN_RAM)

        const WEAKEN_REDUCTION = ns.weakenAnalyze(1, WORKER_CPU_CORES)
        const WEAKEN_THREADS_TO_USE = getThreadsToUse(NODE_SECURITY_DIFFERENCE, WEAKEN_REDUCTION, MAX_WEAKEN_THREADS)
        const CALCULATED_SECURITY_LEVEL = WEAKEN_REDUCTION * WEAKEN_THREADS_TO_USE
        const POST_SECURITY = Math.ceil(NODE_CURRENT_SECURITY - CALCULATED_SECURITY_LEVEL)

        const GROWTH_MULTIPLIER = NODE_MAX_MONEY / NODE_CURRENT_MONEY
        const REQUIRED_GROWTH_THREADS = Math.ceil(ns.growthAnalyze(node, GROWTH_MULTIPLIER, WORKER_CPU_CORES))
        const GROW_THREADS_TO_USE = Math.min(REQUIRED_GROWTH_THREADS, MAX_GROW_THREADS)

        const MONEY_REMOVE_PERCENTAGE = ns.hackAnalyze(node)
        const P = 0.9

        const HACK_THREADS_TO_USE = Math.min(Math.ceil(P / MONEY_REMOVE_PERCENTAGE), MAX_HACK_THREADS)

        const MONEY_EARNED = MONEY_REMOVE_PERCENTAGE * HACK_THREADS_TO_USE * NODE_CURRENT_MONEY

        // HWGW
        const SECURITY_INCREASE_BY_HACK = ns.hackAnalyzeSecurity(HACK_THREADS_TO_USE, node)
        const HW_THREADS2 = SECURITY_INCREASE_BY_HACK / WEAKEN_REDUCTION

        const e = 1 / (1 - Math.min(0.99, MONEY_REMOVE_PERCENTAGE * HACK_THREADS_TO_USE))
        const COUNTER_HACK_MONEY_DRAIN_THREADS = Math.ceil(ns.growthAnalyze(node, e, WORKER_CPU_CORES))
        const SECURITY_INCREASE_BY_GROW = ns.growthAnalyzeSecurity(COUNTER_HACK_MONEY_DRAIN_THREADS)

        const GW_THREADS = SECURITY_INCREASE_BY_GROW / WEAKEN_REDUCTION

        const COUNTER_HACK_THREADS = Math.ceil(HW_THREADS2) || 1
        const COUNTER_GROW_THREADS = Math.ceil(GW_THREADS) || 1

        const TOTAL_THREADS =
          HACK_THREADS_TO_USE + COUNTER_HACK_THREADS + COUNTER_HACK_MONEY_DRAIN_THREADS + COUNTER_GROW_THREADS

        if (TOTAL_THREADS > WORKER_FREE_RAM) {
          continue
        }

        const W1_TIME = WEAKEN_TIME + 300 // Should complete second
        const HACK_WAIT = W1_TIME - HACK_TIME - 300 // Should complete first
        const GROW_WAIT = W1_TIME - GROW_TIME + 100 // Should complete third
        const W2_DELAY = 1000 // Should complete last

        const TOTAL_WORK_TIME = W1_TIME + W2_DELAY + 100

        const work = getWork(WORK_NODE_NAME)
        const pid = work?.pid || 0

        if (!ns.isRunning(pid, work?.host ?? "home")) {
          logTable(
            ns,
            node,
            C_SECURITY(NODE_CURRENT_SECURITY),
            ns.formatNumber(NODE_CURRENT_MONEY),
            0,
            WORK_SERVER,
            TOTAL_THREADS,
            WORKER_FREE_RAM,
          )
          endWork(WORK_NODE_NAME)
          // Offset MIN_SECURITY by 5 to have some buffer.
          if (NODE_CURRENT_SECURITY > NODE_MIN_SECURITY + 2) {
            const pid = ns.exec("/hacking/x-weaken.js", WORK_SERVER, WEAKEN_THREADS_TO_USE, node, 0)
            startWork(
              WORK_NODE_NAME,
              WEAKEN_TIME,
              pid,
              WORK_SERVER,
              `Weakening ${node} from ${NODE_CURRENT_SECURITY} to ${POST_SECURITY}`,
            )
            // If the server has less than X% of the max money, we grow.
          } else if (NODE_CURRENT_MONEY < NODE_MAX_MONEY * 0.7) {
            const pid = ns.exec("/hacking/x-grow.js", WORK_SERVER, GROW_THREADS_TO_USE, node, 0)
            startWork(
              WORK_NODE_NAME,
              GROW_TIME,
              pid,
              WORK_SERVER,
              `Growing ${node} to ${ns.formatNumber(NODE_MAX_MONEY)}`,
            )
          } else {
            if (MONEY_REMOVE_PERCENTAGE === 0) {
              continue
            }

            ns.exec("/hacking/x-weaken.js", WORK_SERVER, COUNTER_HACK_THREADS, node, 0)
            const pid = ns.exec("/hacking/x-weaken.js", WORK_SERVER, COUNTER_GROW_THREADS, node, W2_DELAY)
            ns.exec("/hacking/x-hack.js", WORK_SERVER, HACK_THREADS_TO_USE, node, HACK_WAIT)
            ns.exec("/hacking/x-grow.js", WORK_SERVER, COUNTER_HACK_MONEY_DRAIN_THREADS, node, GROW_WAIT)

            startWork(
              WORK_NODE_NAME,
              TOTAL_WORK_TIME,
              pid,
              WORK_SERVER,
              `Hacking ${node} for ${ns.formatNumber(MONEY_EARNED)}`,
            )
          }
        } else {
          logTable(
            ns,
            node,
            C_SECURITY(NODE_CURRENT_SECURITY),
            ns.formatNumber(NODE_CURRENT_MONEY),
            ns.formatNumber(MONEY_EARNED),
            WORK_SERVER,
            TOTAL_THREADS.toString(),
            WORKER_FREE_RAM.toString(),
          )
        }
      }
    }
    await ns.sleep(1000)
  }
}
