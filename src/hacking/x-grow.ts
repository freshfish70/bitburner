import { NS } from "@ns"

export async function main(ns: NS): Promise<void> {
  const [target, waitTime] = ns.args

  const w = isNaN(+waitTime) ? 0 : +waitTime
  await ns.sleep(w)

  await ns.grow(target.toString())
}
