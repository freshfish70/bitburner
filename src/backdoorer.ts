import { NS } from "@ns"
import { getServerTree, ServerMap } from "./lib/servers/get-all-servers"
import { IS_MY_MACHINE } from "./lib/servers/helpers"
import { executeCommandInTerminal, getTerminal } from "./lib/ui/terminal"

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
    const terminal = getTerminal()
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
          return `${newPath};backdoor`
        }

        if (connections) {
          const path = findServerToBackdoor(connections, level + 1, newPath)
          if (path) {
            return path
          }
        }
      }
      return ""
    }

    const connectionString = findServerToBackdoor(servers)
    if (connectionString) {
      target = connectionString.split(" ").pop()?.replace(";backdoor", "") ?? ""
      await executeCommandInTerminal(connectionString)
    }

    await ns.asleep(2000)
  }
}
