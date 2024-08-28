import { NS, Player, Server } from "@ns"
import React from "lib/react"
import { FC } from "react"
import { getServerTree, ServerMap } from "./lib/servers/get-all-servers"
import { IS_MY_MACHINE } from "./lib/servers/helpers"

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

type ServerEntryProps = {
  player: Player
  server: Server
  contracts: number
  path: string
  backdoorPath: string
  level: number
}

const CLASSES_HACKED = `text-teal-300`
const CLASSES_UNHACKED = `text-orange-300`

const ServerEntry: FC<ServerEntryProps> = (props) => {
  const { server, player } = props

  const nodeClasses = (server.hasAdminRights ? CLASSES_HACKED : CLASSES_UNHACKED) + ` hover:underline cursor-pointer`

  let canBackdoor = false
  if (
    server.hasAdminRights &&
    !server.backdoorInstalled &&
    (server.requiredHackingSkill || Infinity) <= player.skills.hacking
  ) {
    canBackdoor = true
  }

  const serverLevel = server.requiredHackingSkill
  const hackLevel = player.skills.hacking

  let hackLevelClass = `text-green-300`
  if (serverLevel && hackLevel < serverLevel) {
    if (hackLevel * 1.1 >= serverLevel) {
      hackLevelClass = `text-orange-200`
    } else if (hackLevel * 1.2 >= serverLevel) {
      hackLevelClass = `text-orange-400`
    } else {
      hackLevelClass = `text-red-500`
    }
  }

  const isOwnMachine = IS_MY_MACHINE(server.hostname)

  const contracts = new Array(props.contracts).fill("📜").join(" ")

  return (
    <span>
      <a className={nodeClasses} onClick={() => clickHandler(props.path)}>
        {props.server.hostname}
      </a>
      <span className={hackLevelClass}>[{props.server.requiredHackingSkill}]</span>
      {canBackdoor && !isOwnMachine && (
        <a className={`text-green-500 hover:underline cursor-pointer`} onClick={() => clickHandler(props.backdoorPath)}>
          (backdoor)
        </a>
      )}
      {contracts}
    </span>
  )
}
const NODE = "├╴"
const LAST_NODE = "└╴"
const PATH_NODE = "│"

export async function main(ns: NS) {
  ns.disableLog("ALL")
  // Check if there exists a script tag with id tailwindcss, if not, add it.

  const allServers = getServerTree(ns)
  const player = ns.getPlayer()

  const renderServerTree = (servers: ServerMap, level = 0, path = "", pathNodesAt: number[] = [0]) => {
    return (
      <>
        {Object.entries(servers).map(([host, { server, connections }], idx) => {
          const isRoot = host === "home"
          const isTopParent = level === 1
          const isLast = idx === Object.keys(servers).length - 1 && !isRoot
          const hasConnection = Boolean(connections && Object.keys(connections).length > 1)

          // Create connection string for the server
          // So we can jump to the server by clicking on the link.
          // If the backdoor is installed, we don't need to append the path as we can connect directly.
          let newPath = path
          if (server.backdoorInstalled || level === 0) {
            newPath = "connect " + host
          } else {
            newPath += `;connect ${host}`
          }

          let node = isRoot ? "" : NODE
          if (isLast && !isRoot) {
            node = LAST_NODE
          }

          const pathNodes = Array.from({ length: level }, (_, i) => {
            const hasPathNode = pathNodesAt.find((x) => x === i) !== undefined
            if (i === level - 1) {
              return node
            }
            return hasPathNode ? PATH_NODE : " "
          })

          if (level > 1) {
            if (isLast) {
              pathNodesAt = pathNodesAt.filter((x) => x !== level - 1)
            }
            if (hasConnection) {
              pathNodesAt.push(level)
            }
          }

          const files = ns.ls(host)
          const contracts = files.filter((x) => x.endsWith(".cct")).length

          return (
            <div key={host}>
              {!isTopParent && pathNodes}
              {isTopParent && node}
              <ServerEntry
                server={server}
                player={player}
                level={level}
                path={newPath}
                contracts={contracts}
                backdoorPath={`${newPath};backdoor`}
              />
              {connections && renderServerTree(connections, level + 1, newPath, [...pathNodesAt])}
            </div>
          )
        })}
      </>
    )
  }

  ns.tprintRaw(
    <div
      style={{
        whiteSpace: "pre",
        font: "14px monospace",
      }}
    >
      {renderServerTree(allServers)}
    </div>,
  )
}
