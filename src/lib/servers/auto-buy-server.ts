import { NS } from "@ns"

const DATABASE_NAME = "server-database.json"

const writeDatabase = (ns: NS, file: string, data: object) => {
  ns.write("/database/" + file, JSON.stringify(data), "w")
}

const readDatabase = <T>(ns: NS, file: string, initialDatabase: T) => {
  if (!ns.fileExists("/database/" + file)) return initialDatabase
  const database = JSON.parse(ns.read("/database/" + file)) as T

  // TODO: Should merge recursively so that we don't lose any data
  for (const key in initialDatabase) {
    if (database[key] === undefined) {
      database[key] = initialDatabase[key]
    }
  }

  return database
}

type ServerDatabase = {
  servers: {
    hostname: string
    ram: number
    purchased: boolean
  }[]
}

const RAM = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]
const MAX = RAM[10]
const MAX_SERVERS = 2

const generateServers = new Array(25).fill(0).map((_, i) => ({
  hostname: "pserv-" + i,
  ram: RAM[0],
  purchased: false,
}))

const DEFAULT_SERVER_DATABASE: ServerDatabase = {
  servers: generateServers,
}

export async function main(ns: NS) {
  const database = readDatabase<ServerDatabase>(ns, DATABASE_NAME, DEFAULT_SERVER_DATABASE)
  const serverCount = database.servers.filter((x) => x.purchased).length
  const canBuyMore = serverCount < MAX_SERVERS
  const moneyAtHome = ns.getServerMoneyAvailable("home")

  let changes = 0

  // Continuously try to purchase servers until we've reached the maximum amount of servers
  if (canBuyMore) {
    const hasMoneyForServer = moneyAtHome > ns.getPurchasedServerCost(RAM[0])
    const server = database.servers.find((x) => !x.purchased)
    if (server && hasMoneyForServer) {
      const hostname = ns.purchaseServer(server.hostname, server.ram)
      if (hostname) {
        server.purchased = true
        ns.print("Purchased server: " + hostname + " with " + server.ram + "GB of RAM")
        ns.scp(["/hacking/x-weaken.js", "/hacking/x-grow.js", "/hacking/x-hack.js"], hostname)
        changes++
      }
    }
  }

  if (!canBuyMore) {
    for (const server of database.servers) {
      const CURRENT_RAM_INDEX = RAM.indexOf(server.ram)
      const NEXT_RAM_INDEX = Math.min(CURRENT_RAM_INDEX + 1, RAM.length - 1)

      if (NEXT_RAM_INDEX >= RAM.length - 1) {
        continue
      }

      const NEW_RAM = RAM[NEXT_RAM_INDEX]
      if (NEW_RAM > MAX) {
        continue
      }

      const UPGRADE_COST = ns.getPurchasedServerUpgradeCost(server.hostname, NEW_RAM)
      const CURRENT_SPEND_LIMIT = ns.getServerMoneyAvailable("home") * 0.1

      // If the ram on the server is the same as the current max ram, then we don't need to upgrade it
      // and price will be Infinity or <= 0

      if (UPGRADE_COST < CURRENT_SPEND_LIMIT) {
        const bought = ns.upgradePurchasedServer(server.hostname, NEW_RAM)
        if (bought) {
          ns.print("Upgrading server: " + server.hostname + " with " + NEW_RAM + "GB of RAM")
          server.ram = NEW_RAM
          changes++
        }
      }
    }
  }

  if (changes > 0) {
    writeDatabase(ns, DATABASE_NAME, database)
  }
}

export const getWorkServers = (ns: NS) => {
  const database = readDatabase<ServerDatabase>(ns, DATABASE_NAME, DEFAULT_SERVER_DATABASE)
  return database.servers.filter((x) => x.purchased)
}

export const autoBuyServer = main
