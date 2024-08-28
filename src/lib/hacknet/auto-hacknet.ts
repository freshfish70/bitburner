import { NS } from "@ns"

const MAX_NODES = 15
const MAX_CORES = 8

const upgradeCores = 2
const upgradeRam = 2
const upgradeLevel = 10
export const autoHacknet = async (ns: NS): Promise<void> => {
  let nodes = ns.hacknet.numNodes()

  const reserve = ns.getPlayer().money * 0.3
  const newNodePrice = ns.hacknet.getPurchaseNodeCost()

  if (nodes < MAX_NODES && reserve > newNodePrice) {
    ns.hacknet.purchaseNode()
    ns.print(`Purchased node hacknet node [${nodes}]`)
    nodes++
  }

  // Try to upgrade the nodes with the lowest total level first.
  // To try ensure that the nodes are balanced in terms of level, cores, and ram.
  const nodeSortedByTotalLevel = new Array(nodes)
    .fill(0)
    .map((_, index) => {
      const n = ns.hacknet.getNodeStats(index)
      return n.level + n.cores + n.ram
    })
    .sort((a, b) => a - b)

  tryBuyResource(ns, nodeSortedByTotalLevel, "LEVEL")
  tryBuyResource(ns, nodeSortedByTotalLevel, "RAM")
  tryBuyResource(ns, nodeSortedByTotalLevel, "CPU")
}

const tryBuyResource = async (ns: NS, nodes: number[], resource: "RAM" | "CPU" | "LEVEL"): Promise<void> => {
  for (let index = 0; index < nodes.length; index++) {
    let money = ns.getServerMoneyAvailable("home")
    const node = ns.hacknet.getNodeStats(index)

    if (resource === "RAM") {
      let ramCost = +ns.hacknet.getRamUpgradeCost(index, upgradeRam).toFixed(0)
      if (ramCost == Infinity) ramCost = 0
      if (ramCost && ramCost <= money * 0.2) {
        ns.hacknet.upgradeRam(index, upgradeRam)
        money -= ramCost
      }
    }

    if (resource === "CPU") {
      if (node.cores >= MAX_CORES) continue
      let coreCost = +ns.hacknet.getCoreUpgradeCost(index, upgradeCores).toFixed(0)
      if (coreCost == Infinity) coreCost = 0

      if (coreCost && coreCost <= money * 0.1) {
        ns.hacknet.upgradeCore(index, upgradeCores)
        money -= coreCost
      }
    }

    if (resource === "LEVEL") {
      let levelCost = +ns.hacknet.getLevelUpgradeCost(index, upgradeLevel).toFixed(0)
      if (levelCost == Infinity) levelCost = 0

      if (levelCost && levelCost <= money * 0.3) {
        ns.hacknet.upgradeLevel(index, upgradeLevel)
        money -= levelCost
      }
    }
  }
}
