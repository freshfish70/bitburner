// else /** @param {NS} ns **/

import { NS } from "../NetscriptDefinitions";

// Used for importing targets from other scripts
// import { FileHandler } from "/data/file-handler.js";

export async function main(ns: NS) {
    //Logs are nice to know whats going on
    ns.disableLog('sleep');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerMaxMoney');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getHackingLevel');
    // If you do not want an open tail window with information what this script is doing on every start, you can remove/comment the tail line below.
    ns.tail();

    // Used for importing targets from other scripts
    // const FILEHANDLER_SERVERS = new FileHandler(ns, "/database/servers.txt");
    // const FILEHANDLER_TARGET = new FileHandler(ns, "/database/target.txt");

    const RAM_PER_THREAD = ns.getScriptRam("/shared/weaken.js");

    // So many weaken threads are needed to counter one hack/grow thread.
    let WEAKEN_PER_THREAD = ns.weakenAnalyze(1);
    let HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    let GW_THREADS = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;

    const RESERVED_HOME_RAM = 50; //GB - change if you want to reserve more of you home ram
    const SLEEP_ITERATION = 1; // ms - reduce if you need to go even faster, or raise if you get lag spikes
    const PAUSE_ITERATION = 10 // seconds - Pause after the script did touch every server and every target - how often should it run again

    // This will be used to make sure that every batch goes through and is not blocked my "script already running with same arguments"
    let randomArgument = 1;

    while (true) {
        // read (new) targets - if you do not use fileHandlers like i do, just throw in an array of targets or a function or anything really. 
        // If desperate or no clue, use the commented lines instead and change target to your highest/best target you currently have
        const TARGETS = ['']
        //const TARGETS = ["n00dles","foodnstuff","sigma-cosmetics","joesguns","hong-fang-tea","harakiri-sushi","iron-gym","darkweb","home","zer0","CSEC","nectar-net","max-hardware","neo-net","silver-helix","phantasy","omega-net","computek","netlink","johnson-ortho","the-hub","crush-fitness","avmnite-02h","catalyst","I.I.I.I","summit-uni","syscore","rothman-uni","zb-institute","lexo-corp","rho-construction","millenium-fitness","alpha-ent","aevum-police","aerocorp","snap-fitness","galactic-cyber","global-pharm","omnia","deltaone","unitalife","solaris","defcomm","icarus","univ-energy","zeus-med","taiyang-digital","zb-def","infocomm","nova-med","titan-labs","applied-energetics","microdyne","run4theh111z","stormtech","helios","vitalife","fulcrumtech","4sigma","kuai-gong",".","omnitek","b-and-a","powerhouse-fitness","nwo","clarkinc","blade","ecorp","megacorp","fulcrumassets","The-Cave"];

        // The best server we know for our current state. Or just a random one you can tackle. 
        const PRIME_TARGET = ''
        //const PRIME_TARGET = "foodnstuff";

        // For this manager we only use home + purchased servers. Other servers have almost no RAM.
        let servers = ns.getPurchasedServers();
        servers = servers.concat("home");

        // If we are so early in the game that we can't even effectively farm ALL servers...
        const GOOD_HACK_LEVEL = 750;
        let earlyGameCheck = false;
        if (ns.getHackingLevel() < GOOD_HACK_LEVEL && ns.serverExists(PRIME_TARGET) && ns.hasRootAccess(PRIME_TARGET) && ns.getServerMaxMoney(PRIME_TARGET) > 1)
            earlyGameCheck = true;

        for (let target of TARGETS) {
            // ...we stick with THE BEST one. Adjust the criteria to your liking.
            if (earlyGameCheck)
                target = PRIME_TARGET;

            if (!ns.serverExists(target) || !ns.hasRootAccess(target) || ns.getServerMaxMoney(target) < 1)
                continue;

            const S_MAX_MONEY = ns.getServerMaxMoney(target);
            const S_MIN_SEC_LEVEL = ns.getServerMinSecurityLevel(target);
            let currentSecLevel = ns.getServerSecurityLevel(target);
            let availableMoney = Math.max(1, ns.getServerMoneyAvailable(target));
            let growthCalculated = false;
            let requiredGrowThreads = 0;
            let batchDelay = 0;

            for (let server of servers) {
                if (!ns.serverExists(server) || !ns.hasRootAccess(server))
                    continue;
                //Calculate possible threads - If "home", we want some spare some RAM
                let threadsToUse = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - (server == "home" ? RESERVED_HOME_RAM : 0)) / RAM_PER_THREAD);

                if (threadsToUse < 1) continue;

                // Home multi-core support
                let S_CORES = 1;
                if (server == "home") {
                    S_CORES = ns.getServer("home").cpuCores;
                    HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
                    GW_THREADS = ns.growthAnalyzeSecurity(1, target, S_CORES) / WEAKEN_PER_THREAD;
                }
                WEAKEN_PER_THREAD = ns.weakenAnalyze(1, S_CORES);

                // Weaken the server down to minimum sec level
                if (currentSecLevel > S_MIN_SEC_LEVEL) {
                    const REDUCED_SEC_LEVEL = WEAKEN_PER_THREAD * threadsToUse;
                    // Only use needed threads
                    if (currentSecLevel - REDUCED_SEC_LEVEL < S_MIN_SEC_LEVEL) {
                        threadsToUse = Math.ceil((currentSecLevel - S_MIN_SEC_LEVEL) / WEAKEN_PER_THREAD);
                        currentSecLevel = S_MIN_SEC_LEVEL;
                    }
                    else
                        currentSecLevel -= REDUCED_SEC_LEVEL;
                    ns.exec("/shared/weaken.js", server, threadsToUse, target, 0, randomArgument++);
                }
                // Grow the server to the maximum money
                else if (availableMoney < S_MAX_MONEY && (requiredGrowThreads != 0 || !growthCalculated)) {
                    if (!growthCalculated) {
                        requiredGrowThreads = Math.ceil(ns.growthAnalyze(target, S_MAX_MONEY / availableMoney, S_CORES));
                        growthCalculated = true;
                    }
                    // Do not use more than needed
                    threadsToUse = Math.min(requiredGrowThreads, threadsToUse)
                    // Save still needed threads, if any, for this iteration    
                    requiredGrowThreads -= threadsToUse;

                    // Factor in the raise in security level.
                    currentSecLevel += ns.growthAnalyzeSecurity(threadsToUse, target, S_CORES);
                    ns.exec("/shared/grow.js", server, threadsToUse, target, 0, randomArgument++);
                }
                // Fully prepped - Let's do batching
                else {
                    
                   const HACK_MONEY_PERCENTAGE = ns.hackAnalyze(target);
                    if (HACK_MONEY_PERCENTAGE == 0) continue;

                    // Thread calculation
                    let hackThreads = Math.ceil(threadsToUse / 8);
                    let growThreads, weakenThreads, weakenThreads2, goLower = false;
          const r = true
                    while (r) {
                        // Do not use more threads than needed for emptying a target 
                        if (HACK_MONEY_PERCENTAGE * hackThreads > 1)
                        hackThreads = Math.ceil(1 / HACK_MONEY_PERCENTAGE);

                        // Calculate grow threads and weaken threads for the hackThreads amount
                        growThreads = Math.ceil(ns.growthAnalyze(target, 1 / (1 - Math.min(0.99, HACK_MONEY_PERCENTAGE * hackThreads)), S_CORES));
                        weakenThreads = Math.ceil(HW_THREADS * hackThreads);
                        weakenThreads2 = Math.max(1, Math.ceil(GW_THREADS * growThreads)); // GW_THREADS could be 0
                        // How much percent of threads would this take?
                        const threadUsage = (hackThreads + growThreads + weakenThreads + weakenThreads2) / threadsToUse;

                        // If too much, reduce and calculate again, or stop if we cant go lower.
                        if (threadUsage > 1) {
                            if (hackThreads > 1) {
                                hackThreads--;
                                goLower = true;
                            }
                            else break;
                        }
                        // If we have enough free processes, lets raise hackThreads and calculate again
                        else if (Math.floor((1 - threadUsage) * hackThreads) > 1) {
                            hackThreads += Math.floor((1 - threadUsage) * hackThreads / 2);
                            if (goLower) break; //This is to prevent a softlock going up and down 1 thread.                                
                        }
                        else
                            // This is perfect. Get out with perfect thread amounts.
                            break;
                        await ns.sleep(1);
                    }

                    const THREAD_DELAY = 100; //ms
                    ns.exec("/shared/weaken.js", server, weakenThreads, target, batchDelay, randomArgument);
                    ns.exec("/shared/weaken.js", server, weakenThreads2, target, batchDelay + THREAD_DELAY * 2, randomArgument);
                    ns.exec("/shared/grow.js", server, growThreads, target, batchDelay + THREAD_DELAY + ns.getWeakenTime(target) - ns.getGrowTime(target), randomArgument);
                    ns.exec("/shared/hack.js", server, hackThreads, target, batchDelay - THREAD_DELAY + ns.getWeakenTime(target) - ns.getHackTime(target), randomArgument++);
                    // If we would fire the next HWGW without this batchDelay, they might intersect
                    batchDelay += 4 * THREAD_DELAY;
                }
                await ns.sleep(SLEEP_ITERATION);
            }
            await ns.sleep(SLEEP_ITERATION);
        }
        await ns.sleep(PAUSE_ITERATION * 1000);
    }
}
