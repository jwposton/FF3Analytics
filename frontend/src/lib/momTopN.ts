import {
  TOP_N_DEFAULT,
  TOP_N_MAX,
  TOP_N_MIN,
} from "@/lib/topNConstants"

export type MomTopNFamily = "spending" | "cash-flow"

const STORAGE_KEYS: Record<MomTopNFamily, string> = {
  spending: "ff3-spending-mom-top-n",
  "cash-flow": "ff3-cash-flow-mom-top-n",
}

function clampTopN(value: number): number {
  return Math.min(TOP_N_MAX, Math.max(TOP_N_MIN, value))
}

export function readMomTopN(family: MomTopNFamily): number {
  const stored = localStorage.getItem(STORAGE_KEYS[family])
  const n = stored ? parseInt(stored, 10) : TOP_N_DEFAULT
  return Number.isFinite(n) ? clampTopN(n) : TOP_N_DEFAULT
}

export function writeMomTopN(family: MomTopNFamily, value: number): void {
  localStorage.setItem(STORAGE_KEYS[family], String(clampTopN(value)))
}
