import { NS } from "@ns"
import { list_servers } from "./lib/all-servers"
import { IS_MY_MACHINE } from "./lib/servers/helpers"
import { DOM, WINDOW } from "./lib/ui/helpers"

const TEXT_TO_FIND = "@@ALP@@"

export async function main(ns: NS) {
  ns.tail()
  ns.disableLog("ALL")
  ns.clearLog()
  ns.print(TEXT_TO_FIND)
  const p = ns
  ;((WINDOW as any).alp = () => ({
    open: false,

    toggle() {
      console.log(p.getPlayer().money)
      this.open = !this.open
    },
  })),
    eval(`window.Alpine.data("dropdown", window.alp)`)

  await ns.sleep(200)

  // Find the string in the DOM...
  const possibleTargets = DOM.querySelectorAll(".react-resizable")

  const findElement = (element: Element): Element | null => {
    if (element.textContent?.includes(TEXT_TO_FIND)) {
      return element
    } else {
      for (const child of Array.from(element.children)) {
        const found = findElement(child)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  const l = true
  while (l) {
    const s = list_servers(ns)
    for (const target of Array.from(possibleTargets)) {
      const found = findElement(target)
      if (found) {
        const secondChild = found.children[1]
        secondChild.innerHTML = `
      <table class="table-auto text-left text-white-200">
        <thead class="text-sky-500">
          <tr>
            <th class="px-1">Name</th>
            <th class="px-1">Cur Money</th>
            <th class="px-1">Max money</th>
            <th class="px-1">Security</th>
            <th class="px-1">Hack skill</th>
            <th class="px-1"></th>
          </tr>
        </thead>
        <tbody class="text-sky-300">
          ${s
            .filter((x) => !IS_MY_MACHINE(x))
            .map((server) => {
              return ns.getServer(server)
            })
            .sort((a, b) => {
              return (b.requiredHackingSkill ?? 0) - (a.requiredHackingSkill ?? 0)
            })
            .map(({ hostname, requiredHackingSkill, minDifficulty, moneyMax }) => {
              return `
              <tr class="px-1 hover:bg-gray-700">
                <td class="px-1">${hostname}</td>
                <td class="px-1 text-right">${ns.formatNumber(p.getServerMoneyAvailable(hostname), 1)}</td>
                <td class="px-1 text-right">${ns.formatNumber(moneyMax ?? 0, 1)}</td>
                <td class="px-1">${minDifficulty} / ${p.getServerSecurityLevel(hostname)}</td>
                <td class="px-1">${requiredHackingSkill ?? 0}</td>
                <td class="px-1">${""}</td>
              </tr>
              `
            })
            .join("")}
        </tbody>
      </table>
      `
      }
    }

    await ns.asleep(2000)
  }
}
