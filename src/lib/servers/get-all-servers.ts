import { NS, Server } from "@ns"

export type ServerMap = {
  [server: string]: {
    server: Server
    connections?: ServerMap
  }
}

/** Get a tree of all servers in the game
 * that the player has access to.
 * It starts from the home server and recursively scans all servers.
 */
export const getServerTree = (ns: NS): ServerMap => {
  const traverse = (parent: string, hosts: string[], level: number) => {
    const servers: ServerMap = {}
    if (level >= 12) return servers
    level++

    for (const host of hosts) {
      const s = ns.scan(host).filter((h) => h !== parent)
      servers[host] = {
        server: ns.getServer(host),
        connections: s.length === 0 ? undefined : traverse(host, s, level),
      }
    }

    return servers
  }

  const serverMap: ServerMap = {
    home: {
      server: ns.getServer("home"),
      connections: traverse("home", ns.scan(), 0),
    },
  }

  return serverMap
}
