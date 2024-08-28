import { NS } from "@ns"

const TARGET = "iron-gym"
const WORK_SERVERS = ["home"]

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

let pid = 0
let host = ""
let task = ""
let iterations = 0

const loader = [".", "..", "...", "...."]
let loaderIndex = 0

const loopWork = (ns: NS) => {
  const iterationChars = iterations.toString().length
  const pad = "".padStart(iterationChars + 2, " ")
  if (ns.isRunning(pid, host)) {
    ns.print(`[${iterations}] | Running ${loader[loaderIndex]}`)
    ns.print(`${pad} | ${task}`)
  } else {
    ns.print(`[${iterations}] | Done`)
    ns.print(`.`)
  }
  loaderIndex = (loaderIndex + 1) % loader.length
  iterations--
}

const startWork = (_ms: number, _pid: number, _host: string, _task: string) => {
  iterations = Math.ceil(_ms / 1000) + 1
  pid = _pid
  host = _host
  task = _task
}

export async function main(ns: NS): Promise<void> {
  // const target = "silver-helix"
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  const log = (msg: string) => {
    if (!DEBUG) return
    ns.print(msg)
  }

  const PLAYER_HACK_LEVEL = ns.getHackingLevel()

  const TARGETS = [TARGET]

  const T = true
  while (T) {
    ns.clearLog()
    for (const node of TARGETS) {
      log(`Analyzing ${node}`)

      const NODE_CURRENT_MONEY = Math.max(ns.getServerMoneyAvailable(node), 1)
      const NODE_MAX_MONEY = ns.getServerMaxMoney(node)
      const NODE_MONEY_DIFFERENCE = NODE_MAX_MONEY - NODE_CURRENT_MONEY

      const NODE_MIN_SECURITY = ns.getServerMinSecurityLevel(node)
      const NODE_CURRENT_SECURITY = ns.getServerSecurityLevel(node)
      const NODE_SECURITY_DIFFERENCE = NODE_CURRENT_SECURITY - NODE_MIN_SECURITY

      const HACK_TIME = Math.ceil(ns.getHackTime(node))
      const GROW_TIME = Math.ceil(ns.getGrowTime(node))
      const WEAKEN_TIME = Math.ceil(ns.getWeakenTime(node))

      for (const WORK_SERVER of WORK_SERVERS) {
        const WORKER = ns.getServer(WORK_SERVER)
        const WORKER_RAM = WORKER.maxRam
        const WORKER_USED_RAM = WORKER.ramUsed

        const WORKER_FREE_RAM = WORKER_RAM - WORKER_USED_RAM
        const WORKER_CPU_CORES = WORKER.cpuCores || 1

        const MAX_HACK_THREADS = Math.floor(WORKER_FREE_RAM / HACK_RAM)
        const MAX_GROW_THREADS = Math.floor(WORKER_FREE_RAM / GROW_RAM)
        const MAX_WEAKEN_THREADS = Math.floor(WORKER_FREE_RAM / WEAKEN_RAM)

        log(`= WORKER ===========================================`)
        log(` Hack [T]        : ${MAX_HACK_THREADS}`)
        log(` Grow [T]        : ${MAX_GROW_THREADS}`)
        log(` Weaken [T]      : ${MAX_WEAKEN_THREADS}`)
        log(` CPU Cores       : ${WORKER_CPU_CORES}`)
        log(`= NODE =============================================`)
        log(` Security        : ${NODE_CURRENT_SECURITY}`)
        log(` Money           : ${ns.formatNumber(NODE_CURRENT_MONEY)}`)
        log(` Max Money       : ${ns.formatNumber(NODE_MAX_MONEY)}`)

        log(`= WEAKEN ===========================================`)
        const WEAKEN_REDUCTION = ns.weakenAnalyze(1, WORKER_CPU_CORES)
        const WEAKEN_THREADS_TO_USE = getThreadsToUse(NODE_SECURITY_DIFFERENCE, WEAKEN_REDUCTION, MAX_WEAKEN_THREADS)
        const CALCULATED_SECURITY_LEVEL = WEAKEN_REDUCTION * WEAKEN_THREADS_TO_USE
        const POST_SECURITY = Math.ceil(NODE_CURRENT_SECURITY - CALCULATED_SECURITY_LEVEL)
        log(` Weaken Time     : ${WEAKEN_TIME}`)
        log(` Weaken Threads  : ${WEAKEN_THREADS_TO_USE}`)
        log(` Min Security    : ${NODE_MIN_SECURITY}`)
        log(` Post Security   : ${POST_SECURITY}`)

        log(`= GROW =============================================`)
        const GROWTH_MULTIPLIER = NODE_MAX_MONEY / NODE_CURRENT_MONEY
        const REQUIRED_GROWTH_THREADS = Math.ceil(ns.growthAnalyze(node, GROWTH_MULTIPLIER, WORKER_CPU_CORES))
        const GROW_THREADS_TO_USE = Math.min(REQUIRED_GROWTH_THREADS, MAX_GROW_THREADS)
        log(` Multiplier      : ${GROWTH_MULTIPLIER}`)
        log(` Grow Time       : ${GROW_TIME}`)
        log(` Grow calc       : ${REQUIRED_GROWTH_THREADS}`)
        log(` Grow Threads    : ${GROW_THREADS_TO_USE}`)
        log(` Max money       : ${ns.formatNumber(NODE_MAX_MONEY)}`)
        log(` Post Money      : ${ns.formatNumber(NODE_CURRENT_MONEY * GROWTH_MULTIPLIER)}`)

        const MONEY_REMOVE_PERCENTAGE = ns.hackAnalyze(node)
        const P = 0.9

        const MAX_PERCENTAGE = MONEY_REMOVE_PERCENTAGE * MAX_HACK_THREADS
        const HACK_THREADS_TO_USE = Math.min(Math.ceil(P / MONEY_REMOVE_PERCENTAGE), MAX_HACK_THREADS)

        const HACK_T_CALC = ns.hackAnalyzeThreads(node, NODE_CURRENT_MONEY * P)
        const MONEY_EARNED = MONEY_REMOVE_PERCENTAGE * HACK_THREADS_TO_USE * NODE_CURRENT_MONEY

        log(`= HACK ============================================`)
        //====================
        log(` Percentage      : ${MONEY_REMOVE_PERCENTAGE}`)
        log(` Percentage max  : ${MAX_PERCENTAGE}`)
        log(` Hack threads    : ${HACK_THREADS_TO_USE}`)
        log(` Hack threads X  : ${HACK_T_CALC}`)
        log(` Earning money   : ${ns.formatNumber(MONEY_EARNED)}`)
        //====================

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
        ns.print(`= HWGW =============================================`)
        ns.print(` WPT             : ${WEAKEN_REDUCTION}`)
        ns.print(` HWT             : ${HW_THREADS2}`)
        ns.print(` GWT             : ${GW_THREADS}`)
        ns.print(` Sec inc H       : ${SECURITY_INCREASE_BY_HACK}`)
        ns.print(` Sec inc G       : ${SECURITY_INCREASE_BY_GROW}`)
        ns.print(` Hack Threads    : ${HACK_THREADS_TO_USE}`)
        ns.print(` Counter hack    : ${COUNTER_HACK_THREADS}`)
        ns.print(` Grow money      : ${COUNTER_HACK_MONEY_DRAIN_THREADS}`)
        ns.print(` Counter grow    : ${COUNTER_GROW_THREADS}`)
        ns.print(` Total Threads   : ${TOTAL_THREADS}`)

        const W1_TIME = WEAKEN_TIME + 300 // Should complete second
        const HACK_WAIT = W1_TIME - HACK_TIME - 300 // Should complete first
        const GROW_WAIT = W1_TIME - GROW_TIME + 100 // Should complete third
        const W2_DELAY = 1000 // Should complete last

        const TOTAL_WORK_TIME = W1_TIME + W2_DELAY + 100

        // startWork(HACK_TIME, pid, "home", `Hacking ${node} for ${ns.formatNumber(MONEY_EARNED)}`)

        ns.print(`= TIMER ============================================`)

        const s = (time: number, delay: number, w: string, total: number) => {
          // const _time = Math.ceil(time / 1000)
          // const _delay = Math.ceil(delay / 1000)
          // const _total = Math.ceil(total / 1000)
          const runTime = time + delay

          // const S = "|"
          // const N = "="
          // const O = " "

          const rtString = `[${w} ${runTime.toFixed(2)}s]`
          return `${rtString} `

          // const deilayStr = `${O.repeat(_delay)}${S}`
          // const timeStr = `${N.repeat(_time)}${S}`
          // const base = `[${w}] ${deilayStr}${timeStr}`.padEnd(_total + 9, " ")
          // return `${base} `
        }

        log(s(W1_TIME, 0, "W", TOTAL_WORK_TIME))
        log(s(W1_TIME, W2_DELAY, "W", TOTAL_WORK_TIME))
        log(s(GROW_TIME, GROW_WAIT, "G", TOTAL_WORK_TIME))
        log(s(HACK_TIME, HACK_WAIT, "H", TOTAL_WORK_TIME))
        if (iterations < 0 && !ns.isRunning(pid, host)) {
          log(`.`)
          log(`.`)
          // Offset MIN_SECURITY by 5 to have some buffer.
          if (NODE_CURRENT_SECURITY > NODE_MIN_SECURITY + 2) {
            const pid = ns.exec("/hacking/x-weaken.js", "home", WEAKEN_THREADS_TO_USE, node, 0)
            startWork(WEAKEN_TIME, pid, "home", `Weakening ${node} from ${NODE_CURRENT_SECURITY} to ${POST_SECURITY}`)
            // If the server has less than X% of the max money, we grow.
          } else if (NODE_CURRENT_MONEY < NODE_MAX_MONEY * 0.7) {
            const pid = ns.exec("/hacking/x-grow.js", "home", GROW_THREADS_TO_USE, node, 0)
            startWork(GROW_TIME, pid, "home", `Growing ${node} to ${ns.formatNumber(NODE_MAX_MONEY)}`)
          } else {
            if (MONEY_REMOVE_PERCENTAGE === 0) {
              continue
            }

            ns.exec("/hacking/x-weaken.js", "home", COUNTER_HACK_THREADS, node, 0)
            const pid = ns.exec("/hacking/x-weaken.js", "home", COUNTER_GROW_THREADS, node, W2_DELAY)
            ns.exec("/hacking/x-hack.js", "home", HACK_THREADS_TO_USE, node, HACK_WAIT)
            ns.exec("/hacking/x-grow.js", "home", COUNTER_HACK_MONEY_DRAIN_THREADS, node, GROW_WAIT)

            startWork(TOTAL_WORK_TIME, pid, "home", `Hacking ${node} for ${ns.formatNumber(MONEY_EARNED)}`)
          }
        } else {
          ns.print(`= WORK =============================================`)
          loopWork(ns)
        }
      }

      // const HACK_THREADS = ns.hackAnalyzeThreads(target, SERVER_CURRENT_MONEY)

      // const targetServer = ns.getServer(target)
    }
    await ns.sleep(1000)
  }
}
// const targetServer = ns.getServer(target)

// await weakenAnalyze(ns, targetServer.hostname)
// await growAnalyzis(ns, targetServer.hostname)
// await hackAnalyze(ns, targetServer)

// ns.getServer(target)

// ns.print(JSON.stringify(getTargetStats(ns, target), null, 2))

// seclevel(ns, target)
// moneyLevel(ns, target)
//
// const server = ns.getServer(target)
// server.hackDifficulty
//
// const hackTime = getHackTime(ns, target)
// const weakenTime = getWeakenTime(ns, target)
// const growTime = getGrowTime(ns, target)
//
// const offset = 100
// const growDelay = weakenTime - growTime + offset + 10
// const hackDelay = weakenTime - hackTime + 20
//
// ns.weakenAnalyze(2, 1)
//
// const a = [
//   {
//     script: "x-hack.js",
//     delay: hackDelay,
//     threads: 1,
//     pid: 1,
//   },
//   {
//     script: "x-weaken.js",
//     threads: 4,
//     delay: offset,
//     pid: 2,
//   },
//   {
//     script: "x-grow.js",
//     threads: 2,
//     delay: growDelay,
//     pid: 3,
//   },
//   {
//     script: "x-weaken.js",
//     threads: 4,
//     delay: offset * 3 + 30,
//     pid: 4,
//   },
// ]
//
// ns.tprint(JSON.stringify(i(ns, target), null, 2))
// for (let index = 0; index < a.length; index++) {
//   const element = a[index]
//   ns.exec(element.script, "home", element.threads, element.delay, target, element.pid)
// }
// await ns.sleep(a.reduce((acc, cur) => acc + cur.delay, 0) + 3000)
// ns.tprint("DONE")
// ns.tprint(JSON.stringify(i(ns, target), null, 2))
