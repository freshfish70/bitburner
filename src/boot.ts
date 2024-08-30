import { NS } from "@ns"
export async function main(ns: NS): Promise<void> {
  ns.tail()
  ns.clearLog()

  ns.rm("database/server-database2.json")

  ns.run("deamon.js")

  ns.closeTail(ns.pid)
  ns.kill("boot.js")
}
