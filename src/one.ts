import { NS } from "@ns"

export async function main(ns: NS): Promise<void> {
  ns.tail()

  const server = ns.getPurchasedServers()
  for (const s of server) {
    // ns.print(`Deleting server ${s}`)
    // ns.deleteServer(s)
  }
}
