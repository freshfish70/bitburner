import { NS } from "@ns"
import { TOR_ROUTER_COST } from "./lib/constants/shop"
import { autoHacknet } from "./lib/hacknet/auto-hacknet"
import { autoBuyServer, getWorkServers } from "./lib/servers/auto-buy-server"
import { recursiveHack } from "./lib/servers/recursive-hack"
import { initUI } from "./lib/ui/init"

const RUN = true

const log = (ns: NS, key: string, message: string) => {
  ns.print(`  ${key.padEnd(15, " ")}: ${message}`)
}

const header = (ns: NS, name: string) => {
  ns.print(`= ${name} `.padEnd(60, "="))
}

export async function main(ns: NS) {
  initUI()

  ns.tail()
  ns.disableLog("ALL")

  let LAST_HACK_LEVEL = -1 // START ON -1 TO FORCE DIFF ON FIRST ITERATION
  // let iteration = 0

  while (RUN) {
    ns.clearLog()

    const PLAYER = ns.getPlayer()
    const CURRENT_HACK_LEVEL = PLAYER.skills.hacking
    const HAS_TOR_ROUTER = ns.hasTorRouter()
    const BLOCK_OTHER_PURCHASES = !HAS_TOR_ROUTER

    stats(ns)

    // Only run recursive hack if the player's hacking level has changed
    if (LAST_HACK_LEVEL !== CURRENT_HACK_LEVEL) {
      ns.print("Starting recursive hack")
      await recursiveHack(ns)
      ns.print("Finished recursive hack")
    }

    // Prompt to buy tor router if the player doesn't have one
    // Prioritize buying tor router over other upgrades from the start
    if (!HAS_TOR_ROUTER && PLAYER.money > TOR_ROUTER_COST) {
      ns.print("Save up to buy tor router")
      // TODO: Implement singularity to buy tor router
    }

    if (!BLOCK_OTHER_PURCHASES) {
      await autoBuyServer(ns)
      await autoHacknet(ns)
    }

    await ns.sleep(2000)
    if (CURRENT_HACK_LEVEL !== LAST_HACK_LEVEL) {
      ns.print(`Player hacking level changed from ${LAST_HACK_LEVEL} to ${CURRENT_HACK_LEVEL}`)
      LAST_HACK_LEVEL = CURRENT_HACK_LEVEL
    }
  }
}

const stats = (ns: NS) => {
  const PLAYER = ns.getPlayer()
  const HACKNET_NODES = ns.hacknet.numNodes()

  const hacknetStats = new Array(HACKNET_NODES).fill(0).map((_, i) => ns.hacknet.getNodeStats(i))

  const aggregate = hacknetStats.reduce(
    (acc, stats) => {
      acc.production += stats.production
      acc.servers += 1
      return acc
    },
    {
      production: 0,
      servers: 0,
    },
  )

  const servers = getWorkServers(ns)

  header(ns, "STATS")
  log(ns, "KARMA", JSON.stringify(PLAYER.karma))
  log(ns, "HACKNET PROD", `[${HACKNET_NODES}] ` + ns.formatNumber(aggregate.production) + "/s")
  header(ns, "WORK SERVERS")
  for (const server of servers) {
    log(ns, server.hostname, server.ram + "GB")
  }

  header(ns, "TASKS")
}
