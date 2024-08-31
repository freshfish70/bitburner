import { NS } from "@ns"
export async function main(ns: NS): Promise<void> {
  ns.tail()

  ns.rm("database/server-database.json")
  ns.run("deamon.js")
  ns.run("hacking.js", undefined, "reverse")

  ns.kill("boot.js")
}
