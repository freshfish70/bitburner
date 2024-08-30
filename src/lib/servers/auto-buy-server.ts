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
  initialRam: number
  currentMaxRam: number
  servers: string[]
}

const DEFAULT_SERVER_DATABASE: ServerDatabase = {
  initialRam: 8,
  currentMaxRam: 8,
  servers: [],
}

const RAM = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072]

const MAX = RAM[6]

export async function main(ns: NS) {
  const database = readDatabase<ServerDatabase>(ns, DATABASE_NAME, DEFAULT_SERVER_DATABASE)
  const serverCount = database.servers.length
  const canBuyMore = 2 > serverCount
  const moneyAtHome = ns.getServerMoneyAvailable("home")
  const hasMoneyForServer = moneyAtHome > ns.getPurchasedServerCost(database.initialRam)

  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers
  // Check if we have enough money to purchase a server
  if (canBuyMore && hasMoneyForServer) {
    // If we have enough money, then:
    //  1. Purchase the server
    //  2. Copy our hacking script onto the newly-purchased server
    //  3. Run our hacking script on the newly-purchased server with 3 threads
    //  4. Increment our iterator to indicate that we've bought a new server
    const hostname = ns.purchaseServer("pserv-" + serverCount + 1, database.initialRam)
    database.servers.push(hostname)

    ns.print("Purchased server: " + hostname + " with " + database.initialRam + "GB of RAM")
  }

  if (!canBuyMore && database.currentMaxRam <= MAX) {
    if (database.initialRam == database.currentMaxRam) {
      // Must allways double the ram
      database.currentMaxRam = database.currentMaxRam * 2
    }
    // Start upgrading servers...
    const allIsSameLevel = []
    for (const server of database.servers) {
      const upgradeCost = ns.getPurchasedServerUpgradeCost(server, database.currentMaxRam)

      // If the ram on the server is the same as the current max ram, then we don't need to upgrade it
      // and price will be Infinity or <= 0
      if (upgradeCost < 1 || upgradeCost == Infinity) {
        allIsSameLevel.push(true)
        continue
      }

      if (upgradeCost < ns.getServerMoneyAvailable("home") * 0.1) {
        ns.upgradePurchasedServer(server, database.currentMaxRam)
        ns.print("Upgrading server: " + server + " with " + database.currentMaxRam + "GB of RAM")
        allIsSameLevel.push(true)
      } else {
        allIsSameLevel.push(false)
      }
    }

    // If all servers are at the same level, then double the ram
    // for the next upgrade
    if (allIsSameLevel.every((x) => x)) {
      database.currentMaxRam = database.currentMaxRam * 2
    }
  }

  //Make the script wait for a second before looping again.
  //Removing this line will cause an infinite loop and crash the game.
  writeDatabase(ns, DATABASE_NAME, database)
  await ns.sleep(200)
}

export const autoBuyServer = main
