import { NS } from "@ns"
import { getServerTree, ServerMap } from "./lib/servers/get-all-servers"
import { IS_MY_MACHINE } from "./lib/servers/helpers"
import { DOM } from "./lib/ui/helpers"

const terminal = DOM.getElementById("terminal")
const terminalInsert = (html: string) =>
  DOM.getElementById("terminal")?.insertAdjacentHTML("beforeend", `<li>${html}</li>`)
const terminalInput = DOM.getElementById("terminal-input")! as HTMLInputElement
const terminalEventHandlerKey = Object.keys(terminalInput)[1]

const setNavCommand = async (inputValue: string) => {
  terminalInput.value = inputValue
  ;(terminalInput as any)[terminalEventHandlerKey].onChange({ target: terminalInput })
  terminalInput.focus()
  await (terminalInput as any)[terminalEventHandlerKey].onKeyDown({ key: "Enter", preventDefault: () => 0 })
}

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  await ns.sleep(200)

  let target = ""
  const l = true
  while (l) {
    const servers = getServerTree(ns)

    const isBackdooring = Boolean(target)
    const isBackdoored = !!Array.from(terminal?.querySelectorAll("li") ?? []).find((x) =>
      x.textContent?.includes(`'${target}' succ`),
    )

    ns.print(`Backdooring: ${isBackdooring}`)
    if (!isBackdoored && isBackdooring) {
      ns.clearLog()
      ns.print(`Backdooring ${target}....`)

      await ns.sleep(2000)
      continue
    }
    if (isBackdoored) {
      ns.print(`Backdoored ${target}`)
    }
    target = ""

    const findServerToBackdoor = (servers: ServerMap, level = 0, path = ""): string | undefined => {
      for (const [host, { server, connections }] of Object.entries(servers)) {
        // Create connection string for the server
        // So we can jump to the server by clicking on the link.
        // If the backdoor is installed, we don't need to append the path as we can connect directly.
        let newPath = path
        const bdInstalled = server.backdoorInstalled
        if (bdInstalled || level === 0) {
          newPath = `connect ${host}`
        } else {
          newPath += `;connect ${host}`
        }

        const hs = server.requiredHackingSkill || 9999999

        if (hs < ns.getPlayer().skills.hacking && !IS_MY_MACHINE(host) && !bdInstalled) {
          const target = `${newPath};backdoor`
          console.log(`Found target: ${target}`)
          return target
        }

        // const files = ns.ls(host)
        // const contracts = files.filter((x) => x.endsWith(".cct")).length

        if (connections) {
          console.log(`Recursing into ${host}`)
          const r = findServerToBackdoor(connections, level + 1, newPath)
          if (r) {
            return r
          }
        }
      }
      return ""
    }

    const connectionString = findServerToBackdoor(servers)
    if (connectionString) {
      target = connectionString.split(" ").pop()?.replace(";backdoor", "") ?? ""
      console.log(`Chose: : ` + target)

      await setNavCommand(connectionString)
    }

    await ns.asleep(2000)
  }
}
