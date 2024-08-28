import { NS } from "@ns"

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")

  const flags = ns.flags([["level", ""]]) as {
    level: string
  }

  if (!flags.level) ns.toast("No level specified --level xxx", "error")
  const ownedNodes = ns.hacknet.numNodes()
  const upgradeTo = parseInt(flags.level, 10)

  ns.print(`Owns ${ownedNodes} nodes`)
  for (let i = 0; i < ownedNodes; i++) {
    ns.print(`Upgrading node ${i}`)
    const stats = ns.hacknet.getNodeStats(i)
    if (stats.level < upgradeTo) {
      ns.hacknet.upgradeLevel(i, upgradeTo - stats.level)
    }
    ns.print(`Upgraded node ${i} to level ${upgradeTo}`)
  }
}
