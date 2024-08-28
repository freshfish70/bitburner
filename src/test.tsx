import { NS } from "@ns"
import React from "lib/react"

export async function main(ns: NS): Promise<void> {
  const args = ns.args

  ns.tail()
  // ns.disableLog("ALL")

  ns.codingcontract.attempt(1, "foo")
}
