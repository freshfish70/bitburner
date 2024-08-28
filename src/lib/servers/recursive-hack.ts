/* eslint-disable no-empty */
import { NS } from "@ns"
import { IS_MY_MACHINE } from "./helpers"

export async function main(ns: NS) {
  ns.tail()

  const traverse = (hosts: string[], lastHost: string, level: number) => {
    if (level >= 20) return
    level++
    for (const host of hosts) {
      const server = ns.getServer(host)

      if (!server.hasAdminRights && !IS_MY_MACHINE(host)) {
        const usedTools = []
        try {
          ns.brutessh(host)
          usedTools.push("BruteSSH")
        } catch {}

        try {
          ns.ftpcrack(host)
          usedTools.push("FTPCrack")
        } catch {}

        try {
          ns.relaysmtp(host)
          usedTools.push("relaySMTP")
        } catch {}

        try {
          ns.sqlinject(host)
          usedTools.push("SQLInject")
        } catch {}

        try {
          ns.httpworm(host)
          usedTools.push("HTTPWorm")
        } catch {}

        if (ns.getServerNumPortsRequired(host) <= (server.openPortCount || 0)) {
          ns.nuke(host)
          ns.print(`NUKED => ${host}`)
        }
      }

      const s = ns.scan(host)
      const rest = s.filter((c) => c !== lastHost && !IS_MY_MACHINE(c))
      traverse(rest, host, level)
    }
  }

  const currentReach = ns.scan("home")
  traverse(currentReach, "", 0)
}

export const recursiveHack = main
