import { NS } from "@ns"

const RAM = 8
export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")

  const servers = ns.getPurchasedServers()

  const currentMoney = ns.getServerMoneyAvailable("home")
  const maxMoneyOnEach = +Math.ceil(currentMoney / servers.length).toFixed(0)

  for (const server of servers) {
    const ramCost = ns.getPurchasedServerUpgradeCost(server, RAM)
    if (ramCost > 0 && ramCost < maxMoneyOnEach) {
      ns.print(`Upgrade cost for ${server} is ${ramCost}`)
      ns.upgradePurchasedServer(server, RAM)
      ns.print(`Upgrade ${server} to ${RAM}GB`)
    }
  }
}
