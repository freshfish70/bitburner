import { NS } from "@ns"
import { list_servers } from "./lib/all-servers"
import { IS_MY_MACHINE } from "./lib/servers/helpers"
import { DOM, WINDOW } from "./lib/ui/helpers"

// const findElement = (element: Element): Element | null => {
//   if (element.textContent?.includes(TEXT_TO_FIND)) {
//     return element
//   } else {
//     for (const child of Array.from(element.children)) {
//       const found = findElement(child)
//       if (found) {
//         return found
//       }
//     }
//   }
//   return null
// }

const TASK_HEADER_TAG = `h4`

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()

  await ns.sleep(200)

  // Find the string in the DOM...
  const possibleTargets = DOM.querySelectorAll(".react-resizable")

  const l = true
  while (l) {
    ns.asleep(1000)
  }
}
