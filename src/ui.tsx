import { NodeStats, NS } from "@ns"
import React from "lib/react"
import { formatMoney } from "lib/ui/format"

type Node = NodeStats & {
  upgradeLevel: number
  levelCost: number
  upgradeCores: number
  coreCost: number
  upgradeRam: number
  ramCost: number
}
interface NodeProps {
  stats: Node[]
}

const MyContent = ({ stats }: NodeProps) => {
  const totals = stats.pop()

  if (!totals) return null

  return (
    <div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th>NAME</th>
            <th>LEVEL</th>
            <th>LEVEL NEXT</th>
            <th>LEVEL COST</th>
            <th>CPU</th>
            <th>CPU [level]</th>
            <th>CPU [cost]</th>
            <th>RAM</th>
            <th>RAM [level]</th>
            <th>RAM [cost]</th>
            <th>TOTALS</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((node, index) => (
            <tr key={index}>
              <td>{node.name}</td>
              <td>{node.level}</td>
              <td>{node.upgradeLevel}</td>
              <td>{node.levelCost}</td>
              <td>{node.cores}</td>
              <td>{node.upgradeCores}</td>
              <td>{formatMoney(node.coreCost)}</td>
              <td>{node.ram}</td>
              <td>{node.upgradeRam}</td>
              <td>{formatMoney(node.ramCost)}</td>
              <td>{formatMoney(node.coreCost + node.ramCost + node.levelCost)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot
          style={{
            fontWeight: "bold",
          }}
        >
          <tr
            style={{
              borderTop: "1px solid #00000050",
            }}
          >
            <td>TOTAL</td>
            <td></td>
            <td></td>
            <td>{formatMoney(totals.levelCost, true)}</td>
            <td></td>
            <td></td>
            <td>{formatMoney(totals.coreCost, true)}</td>
            <td></td>
            <td></td>
            <td>{formatMoney(totals.ramCost, true)}</td>
            <td>{formatMoney(totals.levelCost + totals.coreCost + totals.ramCost, true)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

const MAX_NODES = 25

export async function main(ns: NS) {
  const e = true
  while (e) {
    ns.clearLog()
    ns.disableLog("ALL")
    ns.tail()

    let nodes = ns.hacknet.numNodes()

    const upgradeCores = 2
    const upgradeRam = 2
    const upgradeLevel = 10

    const reserve = ns.getPlayer().money * 0.3
    const newNodePrice = ns.hacknet.getPurchaseNodeCost()

    if (nodes < MAX_NODES && reserve > newNodePrice) {
      ns.hacknet.purchaseNode()
      nodes++
    }

    const all = new Array(nodes).fill(0).map((_, index) => {
      let money = ns.getPlayer().money
      const stats = ns.hacknet.getNodeStats(index)

      let coreCost = +ns.hacknet.getCoreUpgradeCost(index, upgradeCores).toFixed(0)
      let ramCost = +ns.hacknet.getRamUpgradeCost(index, upgradeRam).toFixed(0)
      let levelCost = +ns.hacknet.getLevelUpgradeCost(index, upgradeLevel).toFixed(0)

      if (coreCost == Infinity) coreCost = 0
      if (ramCost == Infinity) ramCost = 0
      if (levelCost == Infinity) levelCost = 0

      if (ramCost && ramCost <= money * 0.3) {
        ns.hacknet.upgradeRam(index, upgradeRam)
        money -= ramCost
      }

      if (coreCost && coreCost <= money * 0.3) {
        ns.hacknet.upgradeCore(index, upgradeCores)
        money -= coreCost
      }

      if (levelCost && levelCost <= money * 0.3) {
        ns.hacknet.upgradeLevel(index, upgradeLevel)
        money -= levelCost
      }

      return {
        ...stats,
        upgradeLevel,
        levelCost,
        upgradeCores,
        coreCost,
        upgradeRam,
        ramCost,
      }
    })

    const total = all.reduce((acc, node) => {
      if (Object.keys(acc).length === 0) {
        acc = { ...node, name: "TOTAL" }
      } else {
        acc.coreCost += node.coreCost
        acc.ramCost += node.ramCost
        acc.levelCost += node.levelCost
      }

      return acc
    }, {} as Node)

    all.push(total)

    ns.printRaw(<MyContent stats={all}></MyContent>)

    await ns.sleep(10000)
  }
}
