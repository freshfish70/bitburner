import { NS } from "@ns"
import { list_servers } from "../lib/all-servers"

export async function main(ns: NS): Promise<void> {
  ns.tail()
  ns.disableLog("ALL")
  for (const server of list_servers(ns)) {
    const serverInfo = ns.getServer(server)
    if (serverInfo.hasAdminRights) {
      if (!serverInfo.backdoorInstalled) {
        ns.print(`Missing backdoor on ${server}`)
      }
    }
  }
}
