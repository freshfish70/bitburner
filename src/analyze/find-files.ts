import { NS } from "@ns"
import { list_servers_levels } from "../lib/all-servers"

export async function main(ns: NS): Promise<void> {
  ns.tail()
  ns.disableLog("ALL")

  const flags = ns.flags([["filter", ""]]) as {
    filter: string
  }

  for (const server of list_servers_levels(ns)) {
    if (server.host.includes("pserv") || server.host.includes("home")) continue
    let files = ns.ls(server.host)

    if (flags.filter) {
      const filter = new RegExp(flags.filter)
      files = files.filter((f) => filter.test(f))
    }
    const silentPadding = "  ".repeat(server.level)
    ns.print(`${silentPadding}: ${server.host} => ${files.join(", ")}`)
  }
}
