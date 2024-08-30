import { NS } from "@ns"
import { list_servers_2 } from "./lib/all-servers"
export async function main(ns: NS): Promise<void> {
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  ns.enums.CityName

  ns.print("= Citites =========")
  Object.keys(ns.enums.CityName).forEach((key) => {
    ns.print(`= ${key}`)
  })

  ns.print("= Companies =========")
  Object.keys(ns.enums.CompanyName).forEach((key) => {
    ns.print(`= ${key}`)
  })

  ns.enums.LocationName

  ns.print("= Locations =========")
  Object.keys(ns.enums.LocationName).forEach((key) => {
    ns.print(`= ${key}`)
  })

  const s = list_servers_2(ns)
  for (const iterator of s) {
    ns.print(iterator)
  }
}
