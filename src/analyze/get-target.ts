import { NS } from "@ns"
import { list_servers } from "../lib/all-servers"
import { IS_MY_MACHINE } from "/lib/servers/helpers"

export async function main(ns: NS): Promise<void> {
  // const server = list_servers(ns);
  //
  const currentLevel = ns.getHackingLevel()

  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  const possibleTargets = []
  for (const server of list_servers(ns)) {
    if (IS_MY_MACHINE(server)) continue

    const serverLevel = ns.getServerRequiredHackingLevel(server)
    const targetLevel = currentLevel / 2
    const money = ns.getServerMaxMoney(server)
    if (serverLevel > targetLevel || money <= 10) continue
    const minSec = ns.getServerMinSecurityLevel(server)
    possibleTargets.push({ server, serverLevel, money, minSec })
  }

  // sort by money
  possibleTargets.sort((a, b) => b.money - a.money)

  for (const { server, serverLevel, money, minSec } of possibleTargets) {
    const maxMoney = ns.formatNumber(money)
    const hackLevel = serverLevel.toString().padStart(4, " ")
    const msec = minSec.toString().padStart(2, " ")

    ns.print(`${server.padEnd(25, " ")}: [${hackLevel}]  ${msec}  =>  $${maxMoney}`)
  }
}

export const getSingleTarget = (ns: NS): string => {
  const currentLevel = ns.getHackingLevel()

  const possibleTargets = []
  for (const server of list_servers(ns)) {
    if (IS_MY_MACHINE(server)) continue

    const serverLevel = ns.getServerRequiredHackingLevel(server)
    const targetLevel = currentLevel / 2
    const money = ns.getServerMaxMoney(server)
    const minSec = ns.getServerMinSecurityLevel(server)

    if (minSec > 20 || serverLevel > targetLevel || money <= 10) continue
    possibleTargets.push({ server, serverLevel, money, minSec })
  }

  // sort by money
  return possibleTargets.sort((a, b) => b.money - a.money)[0]?.server
}
