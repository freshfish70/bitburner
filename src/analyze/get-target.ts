import { NS } from "@ns"
import { list_servers } from "../lib/all-servers"
import { IS_MY_MACHINE } from "/lib/servers/helpers"

export async function main(ns: NS): Promise<void> {
  // const server = list_servers(ns);
  //
  const currentLevel = ns.getHackingLevel()

  ns.tail()
  ns.disableLog("ALL")

  const possibleTargets = []
  for (const server of list_servers(ns)) {
    if (IS_MY_MACHINE(server)) continue

    const serverLevel = ns.getServerRequiredHackingLevel(server)
    const targetLevel = currentLevel / 2
    if (serverLevel > targetLevel) continue
    const money = ns.getServerMaxMoney(server)
    possibleTargets.push({ server, serverLevel, money })
  }

  // sort by money
  possibleTargets.sort((a, b) => b.money - a.money)

  for (const { server, serverLevel } of possibleTargets) {
    ns.print(`${server} => ${serverLevel}  $${ns.formatNumber(ns.getServerMaxMoney(server))}`)
  }
}
