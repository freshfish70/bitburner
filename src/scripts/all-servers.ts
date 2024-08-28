import { NS } from "@ns";
function scan(ns: NS, parent: string, server: string, list: string[]) {
  const children = ns.scan(server);
  for (const child of children) {
    if (parent == child) {
      continue;
    }
    list.push(child);
    scan(ns, server, child, list);
  }
}

export function list_servers(ns: NS) {
  const list: string[] = [];
  scan(ns, "", "home", list);
  return list;
}

function scan_levels(
  ns: NS,
  parent: string,
  server: string,
  list: { host: string; level: number }[],
  level: number,
) {
  const children = ns.scan(server);
  for (const child of children) {
    if (parent == child) {
      continue;
    }

    list.push({
      host: child,
      level,
    });

    scan_levels(ns, server, child, list, level + 1);
  }
}

export function list_servers_levels(ns: NS) {
  const list: { host: string; level: number }[] = [];
  scan_levels(ns, "", "home", list, 0);
  return list;
}
