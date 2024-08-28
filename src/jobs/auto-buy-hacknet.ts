import { NS } from "@ns"

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")

  let ownedNodes = ns.hacknet.numNodes()

  ns.print(`Owns ${ownedNodes} nodes`)
  const max = ns.hacknet.maxNumNodes()

  while (ownedNodes < max) {
    if (ns.getServerMoneyAvailable("home") > ns.hacknet.getPurchaseNodeCost()) {
      ns.print(`Purchasing node ${ownedNodes}`)
      ns.hacknet.purchaseNode()
      ownedNodes++
      ns.print(`Purchased node ${ownedNodes}`)
    } else {
      await ns.sleep(10000)
    }
  }
}
