import { NS } from "@ns"

const doc = eval("document")
const getTerminalInput = () => {
  return doc.getElementById("terminal-input") as HTMLInputElement
}

const getTerminalReactInput = () => {
  const terminalInput = getTerminalInput()
  const key = Object.keys(terminalInput)[1]
  return terminalInput[key as keyof typeof terminalInput] as unknown as {
    value: string
    onChange: (e: unknown) => void
    onKeyDown: (e: unknown) => Promise<void>
  }
}

const clickHandler = async (value: string) => {
  const terminalInput = getTerminalInput()
  terminalInput.value = value
  getTerminalReactInput().onChange({ target: terminalInput })
  terminalInput.focus()
  await getTerminalReactInput().onKeyDown({ key: "Space", preventDefault: () => 0 })
  await getTerminalReactInput().onKeyDown({ key: "Enter", preventDefault: () => 0 })
}

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
      await clickHandler(`connect darknet;buy ${program};connect home`)
    }
  }
}
