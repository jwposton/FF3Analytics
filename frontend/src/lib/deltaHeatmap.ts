import type { CSSProperties } from "react"

import type { MomVarianceTableData } from "@/lib/momVarianceTable"

const INCREASE_RGB = [239, 68, 68] as const
const DECREASE_RGB = [34, 197, 94] as const

export function isDeltaHeatmapTable(tableData: MomVarianceTableData): boolean {
  return (
    tableData.columns.length > 0 &&
    tableData.columns.every((column) => column.kind === "delta")
  )
}

export function maxAbsDeltaInTable(tableData: MomVarianceTableData): number {
  let max = 0
  for (const row of tableData.rows) {
    for (const column of tableData.columns) {
      if (column.kind !== "delta") continue
      max = Math.max(max, Math.abs(row.values[column.key] ?? 0))
    }
  }
  return max
}

export function deltaHeatmapCellStyle(
  value: number,
  maxAbs: number,
): CSSProperties | undefined {
  if (value === 0 || maxAbs === 0) return undefined

  const intensity = Math.min(1, Math.abs(value) / maxAbs)
  const alpha = 0.14 + intensity * 0.36
  const [r, g, b] = value > 0 ? INCREASE_RGB : DECREASE_RGB

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
  }
}

export function deltaHeatmapTextClass(value: number): string | undefined {
  if (value === 0) return "text-muted-foreground"
  return value > 0
    ? "font-semibold text-red-700 dark:text-red-300"
    : "font-semibold text-green-700 dark:text-green-300"
}
