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
//
const GAMES = [
  "slash when his guard",
  "close the brackets",
  "type it backward",
  "say something nice about the guard",
  "enter the code",
  "match the symbols",
  "remember all the mines",
  "cut the wires",
]

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
    const header = DOM.querySelectorAll(TASK_HEADER_TAG)
    const game = Array.from(header).find((h) => {
      const text = h.textContent || ""
      return GAMES.find((g) => text.toLowerCase().includes(g.toLowerCase()))
    })

    if (!game) {
      await ns.asleep(1000)
      continue
    }

    console.log(game.textContent)
    console.log(game.parentElement)

    await ns.asleep(1000)
  }
}
