import { NS } from "@ns"
import { executeCommandInTerminal } from "./lib/ui/terminal"

const PROGRAMS = {
  "BruteSSH.exe": 500000,
  "FTPCrack.exe": 1500000,
  "relaySMTP.exe": 5000000,
  "HTTPWorm.exe": 30000000,
  "SQLInject.exe": 25000000,
  "ServerProfiler.exe": 500000,
  "DeepscanV1.exe": 500000,
  "DeepscanV2.exe": 25000000,
  "AutoLink.exe": 1000000,
  "Formulas.exe": 5000000000,
} as const

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")

  const money = ns.getServerMoneyAvailable("home")

  for (const program in PROGRAMS) {
    const price = PROGRAMS[program as keyof typeof PROGRAMS]
    if (!ns.fileExists(program, "home")) {
      if (money < price) {
        ns.tprint(`Not enough money to buy ${program} | ${ns.formatNumber(money)} < ${ns.formatNumber(price)}`)
        continue
      }
      ns.tprint(`Buying ${program}`)
      await executeCommandInTerminal(`connect darknet;buy ${program};connect home`)
    }
  }
}
