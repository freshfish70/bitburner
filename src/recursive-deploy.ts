import { NS } from "@ns"
import { list_servers } from "./lib/all-servers"

const HOME_SERVER = "home"
export async function main(ns: NS) {
  const args = ns.flags([["script", ""]])
  const script = (args.script as string)?.split(".")[0]
  if (!script) {
    ns.toast("Require a script: --script script", "error")
    return
  }

  const fullPath = `/${script}.js`

  if (!ns.fileExists(fullPath)) {
    return ns.toast(`Script ${script} does not exists`, "error")
  }

  ns.tail()
  ns.disableLog("ALL")
  const servers = list_servers(ns)
    .filter((s: string) => ns.hasRootAccess(s))
    .concat([HOME_SERVER])
  for (const server of servers) {
    ns.scp(fullPath, server, HOME_SERVER)

    if (server !== HOME_SERVER) {
      ns.killall(server, true)
    }

    const threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(fullPath))
    if (server === HOME_SERVER) {
      ns.scriptKill(fullPath, HOME_SERVER)
    }

    if (!threads || isNaN(threads)) continue
    ns.exec(fullPath, server, threads)
    ns.print(`${server} runs with ${threads}`)
  }
}
