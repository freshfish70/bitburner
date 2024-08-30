import { NS } from "@ns"
import { list_servers } from "./lib/all-servers"
import { solveContract } from "./lib/contracts/contract-solver"

const LOOP = true

const getContractsOnServer = (ns: NS, server: string) => {
  const filesOnServer = ns.ls(server)
  return filesOnServer.filter((file) => file.endsWith(".cct"))
}

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")
  do {
    const all_servers = list_servers(ns)

    for (const server of all_servers) {
      const contracts = getContractsOnServer(ns, server)

      if (contracts.length === 0) {
        continue
      }

      for (const contract of contracts) {
        solveContract(ns, {
          server,
          fileName: contract,
          data: ns.codingcontract.getData(contract, server),
          type: ns.codingcontract.getContractType(contract, server),
        })
        await ns.sleep(1000)
      }
    }

    ns.print("Waiting for new contracts...")
    await ns.sleep(10000)
  } while (LOOP)
}
