export const STORAGE_KEY = "ff3-spending-sankey-top-n"

const MIN = 5
const MAX = 25
const DEFAULT = 15

export function readSankeyTopN(): number {
  const stored = localStorage.getItem(STORAGE_KEY)
  const n = stored ? parseInt(stored, 10) : DEFAULT
  return Number.isFinite(n) ? Math.min(MAX, Math.max(MIN, n)) : DEFAULT
}

export function writeSankeyTopN(value: number): void {
  localStorage.setItem(STORAGE_KEY, String(Math.min(MAX, Math.max(MIN, value))))
}
