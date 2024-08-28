import { DOM } from "./helpers"

export const initUI = () => {
  addAlpineJS()
  addTailwindCSS()
}

const ALPINE_ID = `x-alpinejs`
const addAlpineJS = () => {
  if (DOM.getElementById(ALPINE_ID)) return

  DOM.addEventListener("alpine:init", () => {
    console.log("Alpine initialized!")
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
  })

  const script = document.createElement("script")
  script.src = "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
  script.defer = true
  script.id = ALPINE_ID
  DOM.head.appendChild(script)
}

const TAILWIND_ID = `x-tailwindcss`
const addTailwindCSS = () => {
  if (DOM.getElementById(TAILWIND_ID)) return
  const script = DOM.createElement("script")
  script.id = TAILWIND_ID
  script.src = "https://cdn.tailwindcss.com"
  DOM.head.appendChild(script)
}
