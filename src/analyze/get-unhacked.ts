import { NS } from "@ns"
import { list_servers_levels } from "../lib/all-servers"

export async function main(ns: NS): Promise<void> {
  ns.tail()
  ns.disableLog("ALL")
  const possibleTargets = []
  for (const server of list_servers_levels(ns)) {
    const serverInfo = ns.getServer(server.host)
    const serverLevel = ns.getServerRequiredHackingLevel(server.host)
    if (!serverInfo.hasAdminRights) {
      possibleTargets.push({
        server: server.host,
        serverLevel,
        ports: serverInfo.numOpenPortsRequired,
        level: server.level,
      })
    }
  }

  for (const { server, serverLevel, ports, level } of possibleTargets) {
    const silentPadding = "  ".repeat(level)
    ns.print(`${silentPadding}${server} => ${serverLevel} : $${ports}`)
  }
}
