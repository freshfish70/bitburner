import { NS } from "@ns"

const TARGETS = [
  // "megacorp",
  // "nwo",
  // "kuai-gong",
  // "clarkinc",
  "b-and-a",
  "4sigma",
  "blade",
  "omnitek",
  "global-pharm",
  "deltaone",
  "zeus-med",
  "nova-med",
  "univ-energy",
  "unitalife",
  "zb-institute",
  "stormtech",
  "aerocorp",
  "omnia",
  "icarus",
  "zb-def",
  "powerhouse-fitness",
  "titan-labs",
  "defcomm",
  "taiyang-digital",
  "solaris",
  "vitalife",
  "galactic-cyber",
  "infocomm",
  "applied-energetics",
  "lexo-corp",
  "alpha-ent",
  "rho-construction",
  "helios",
  "microdyne",
  "syscore",
  "catalyst",
  "snap-fitness",
  "summit-uni",
  "aevum-police",
  "netlink",
  "millenium-fitness",
  //
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
  doneAt: number
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
    doneAt: Date.now() + _ms,
  })
}

const endWork = (key: string) => {
  WORK_MAP.delete(key)
}

const getWork = (key: string) => {
  return WORK_MAP.get(key)
}

const C_SECURITY = (v: string | number) => (+v).toFixed(1).toString()

type TableRow = {
  node: string
  security: string
  money: string | number
  earns: string | number
  worker: string
  threads: string | number
  maxThreads: string | number
  timeLeft: string | number
}

type RowKey = keyof TableRow
type TableHeader = [RowKey, string, number][]

const HEADERS: TableHeader = [
  ["node", "NODE", 15],
  ["worker", "WORKER", 12],
  ["security", "SECURITY", 10],
  ["money", "MONEY", 12],
  ["earns", "EARNS", 12],
  ["threads", "THREADS", 12],
  ["maxThreads", "MAX THREADS", 12],
  ["timeLeft", "TIME LEFT", 12],
]

const logTableHeader = (ns: NS) => {
  const headers = HEADERS.map(([, h, l]) => h.padEnd(l, " "))
  ns.print(headers.join(" | "))
}

const logTable = (ns: NS, row: TableRow) => {
  const columns = HEADERS.reduce((acc: string[], [key, , columnWidth]) => {
    const value = row[key as RowKey]
    acc.push(value.toString().slice(0, columnWidth).padEnd(columnWidth, " "))
    return acc
  }, [])

  ns.print(columns.join(" | "))
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

  const T = true
  while (T) {
    ns.clearLog()
    logTableHeader(ns)

    for (const NODE of TARGETS) {
      const NODE_CURRENT_MONEY = Math.max(ns.getServerMoneyAvailable(NODE), 1)
      const NODE_MAX_MONEY = ns.getServerMaxMoney(NODE)

      const NODE_MIN_SECURITY = ns.getServerMinSecurityLevel(NODE)
      const NODE_CURRENT_SECURITY = ns.getServerSecurityLevel(NODE)
      const NODE_SECURITY_DIFFERENCE = NODE_CURRENT_SECURITY - NODE_MIN_SECURITY

      const HACK_TIME = Math.ceil(ns.getHackTime(NODE))
      const GROW_TIME = Math.ceil(ns.getGrowTime(NODE))
      const WEAKEN_TIME = Math.ceil(ns.getWeakenTime(NODE))

      let nodeHasWorkerAttached = false

      for (const WORK_SERVER of WORK_SERVERS) {
        if (nodeHasWorkerAttached) {
          // If we already have a worker attached to the node, we skip the rest of the workers.
          break
        }

        const WORK_NODE_NAME = `${WORK_SERVER}_${NODE}`

        const work = getWork(WORK_NODE_NAME)
        const pid = work?.pid || 0
        const workIsInProgress = ns.isRunning(pid, work?.host ?? "home")

        nodeHasWorkerAttached = workIsInProgress

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
        const REQUIRED_GROWTH_THREADS = Math.ceil(ns.growthAnalyze(NODE, GROWTH_MULTIPLIER, WORKER_CPU_CORES))
        const GROW_THREADS_TO_USE = Math.min(REQUIRED_GROWTH_THREADS, MAX_GROW_THREADS)

        const MONEY_REMOVE_PERCENTAGE = ns.hackAnalyze(NODE)
        const P = 0.9

        const HACK_THREADS_TO_USE = Math.min(Math.ceil(P / MONEY_REMOVE_PERCENTAGE), MAX_HACK_THREADS)

        const MONEY_EARNED = MONEY_REMOVE_PERCENTAGE * HACK_THREADS_TO_USE * NODE_CURRENT_MONEY

        // HWGW
        const SECURITY_INCREASE_BY_HACK = ns.hackAnalyzeSecurity(HACK_THREADS_TO_USE, NODE)
        const HW_THREADS2 = SECURITY_INCREASE_BY_HACK / WEAKEN_REDUCTION

        const e = 1 / (1 - Math.min(0.99, MONEY_REMOVE_PERCENTAGE * HACK_THREADS_TO_USE))
        const COUNTER_HACK_MONEY_DRAIN_THREADS = Math.ceil(ns.growthAnalyze(NODE, e, WORKER_CPU_CORES))
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

        if (!workIsInProgress) {
          logTable(ns, {
            node: NODE,
            security: C_SECURITY(NODE_CURRENT_SECURITY),
            money: ns.formatNumber(NODE_CURRENT_MONEY),
            earns: 0,
            worker: WORK_SERVER,
            threads: TOTAL_THREADS,
            maxThreads: WORKER_FREE_RAM,
            timeLeft: 0,
          })

          endWork(WORK_NODE_NAME)
          // Offset MIN_SECURITY by 5 to have some buffer.
          if (NODE_CURRENT_SECURITY > NODE_MIN_SECURITY + 2) {
            const pid = ns.exec("/hacking/x-weaken.js", WORK_SERVER, WEAKEN_THREADS_TO_USE, NODE, 0)
            startWork(
              WORK_NODE_NAME,
              WEAKEN_TIME,
              pid,
              WORK_SERVER,
              `Weakening ${NODE} from ${NODE_CURRENT_SECURITY} to ${POST_SECURITY}`,
            )
            // If the server has less than X% of the max money, we grow.
          } else if (NODE_CURRENT_MONEY < NODE_MAX_MONEY * 0.7) {
            const pid = ns.exec("/hacking/x-grow.js", WORK_SERVER, GROW_THREADS_TO_USE, NODE, 0)
            startWork(
              WORK_NODE_NAME,
              GROW_TIME,
              pid,
              WORK_SERVER,
              `Growing ${NODE} to ${ns.formatNumber(NODE_MAX_MONEY)}`,
            )
          } else {
            if (MONEY_REMOVE_PERCENTAGE === 0) {
              continue
            }

            ns.exec("/hacking/x-weaken.js", WORK_SERVER, COUNTER_HACK_THREADS, NODE, 0)
            const pid = ns.exec("/hacking/x-weaken.js", WORK_SERVER, COUNTER_GROW_THREADS, NODE, W2_DELAY)
            ns.exec("/hacking/x-hack.js", WORK_SERVER, HACK_THREADS_TO_USE, NODE, HACK_WAIT)
            ns.exec("/hacking/x-grow.js", WORK_SERVER, COUNTER_HACK_MONEY_DRAIN_THREADS, NODE, GROW_WAIT)

            startWork(
              WORK_NODE_NAME,
              TOTAL_WORK_TIME,
              pid,
              WORK_SERVER,
              `Hacking ${NODE} for ${ns.formatNumber(MONEY_EARNED)}`,
            )
          }
        } else {
          const timeLeft = Math.ceil(Math.max((work?.doneAt ?? 0) - Date.now(), 0) / 1000)

          logTable(ns, {
            node: NODE,
            security: C_SECURITY(NODE_CURRENT_SECURITY),
            money: ns.formatNumber(NODE_CURRENT_MONEY),
            earns: ns.formatNumber(MONEY_EARNED),
            worker: WORK_SERVER,
            threads: TOTAL_THREADS,
            maxThreads: WORKER_FREE_RAM,
            timeLeft,
          })
        }
      }
    }
    await ns.asleep(980)
  }
}
