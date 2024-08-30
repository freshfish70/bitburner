import { NS } from "@ns"
import { TOR_ROUTER_COST } from "./lib/constants/shop"
import { autoHacknet } from "./lib/hacknet/auto-hacknet"
import { autoBuyServer } from "./lib/servers/auto-buy-server"
import { recursiveHack } from "./lib/servers/recursive-hack"
import { initUI } from "./lib/ui/init"

const RUN = true
export async function main(ns: NS) {
  initUI()

  ns.tail()
  ns.disableLog("ALL")

  let LAST_HACK_LEVEL = -1 // START ON -1 TO FORCE DIFF ON FIRST ITERATION

  while (RUN) {
    ns.clearLog()

    const PLAYER = ns.getPlayer()
    const CURRENT_HACK_LEVEL = PLAYER.skills.hacking
    const HAS_TOR_ROUTER = ns.hasTorRouter()
    const BLOCK_OTHER_PURCHASES = !HAS_TOR_ROUTER

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

    ns.print("Waiting for next iteration...")
    await ns.sleep(2000)

    if (CURRENT_HACK_LEVEL !== LAST_HACK_LEVEL) {
      ns.print(`Player hacking level changed from ${LAST_HACK_LEVEL} to ${CURRENT_HACK_LEVEL}`)
      LAST_HACK_LEVEL = CURRENT_HACK_LEVEL
    }
  }
}
