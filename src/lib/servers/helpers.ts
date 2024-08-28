import { OWNED_MACHINE_NAMESPACES } from "../constants/servers"

export const IS_MY_MACHINE = (name: string) => OWNED_MACHINE_NAMESPACES.some((n) => name.includes(n))
