import { DOM } from "./helpers"

export const getTerminal = () => {
  return DOM.getElementById("terminal") as HTMLInputElement
}

export const getTerminalInput = () => {
  return DOM.getElementById("terminal-input") as HTMLInputElement
}

export const getTerminalReactInput = () => {
  const terminalInput = getTerminalInput()
  const key = Object.keys(terminalInput)[1]
  return terminalInput[key as keyof typeof terminalInput] as unknown as {
    value: string
    onChange: (e: unknown) => void
    onKeyDown: (e: unknown) => Promise<void>
  }
}

export const executeCommandInTerminal = async (value: string) => {
  const terminalInput = getTerminalInput()
  terminalInput.value = value
  getTerminalReactInput().onChange({ target: terminalInput })
  terminalInput.focus()
  await getTerminalReactInput().onKeyDown({ key: "Space", preventDefault: () => 0 })
  await getTerminalReactInput().onKeyDown({ key: "Enter", preventDefault: () => 0 })
}
