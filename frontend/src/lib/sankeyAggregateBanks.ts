export const STORAGE_KEY = "ff3-cash-flow-sankey-aggregate-banks"

const DEFAULT = true

export function readAggregateBanks(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === null) return DEFAULT
  return stored === "true"
}

export function writeAggregateBanks(value: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(value))
}
