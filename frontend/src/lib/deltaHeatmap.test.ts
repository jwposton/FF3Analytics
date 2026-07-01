import { describe, expect, it } from "vitest"

import {
  deltaHeatmapCellStyle,
  deltaHeatmapTextClass,
  isDeltaHeatmapTable,
  maxAbsDeltaInTable,
} from "./deltaHeatmap"
import type { MomVarianceTableData } from "./momVarianceTable"

const trendTable: MomVarianceTableData = {
  rowLabel: "Budget",
  columns: [
    { key: "2024-02", label: "2024-02", kind: "delta" },
    { key: "2024-03", label: "2024-03", kind: "delta" },
  ],
  rows: [
    {
      name: "Groceries",
      values: { "2024-02": 50, "2024-03": -25 },
    },
  ],
}

const compareTable: MomVarianceTableData = {
  rowLabel: "Budget",
  columns: [
    { key: "2024-02", label: "2024-02", kind: "amount" },
    { key: "__delta__", label: "Δ", kind: "delta" },
  ],
  rows: [{ name: "Groceries", values: { "2024-02": 100, __delta__: 50 } }],
}

describe("deltaHeatmap", () => {
  it("detects all-delta trend tables only", () => {
    expect(isDeltaHeatmapTable(trendTable)).toBe(true)
    expect(isDeltaHeatmapTable(compareTable)).toBe(false)
  })

  it("finds max absolute delta across heatmap cells", () => {
    expect(maxAbsDeltaInTable(trendTable)).toBe(50)
  })

  it("returns stronger rgba background for larger magnitudes", () => {
    const strong = deltaHeatmapCellStyle(50, 50)
    const weak = deltaHeatmapCellStyle(10, 50)

    expect(strong?.backgroundColor).toContain("rgba(239, 68, 68")
    expect(weak?.backgroundColor).toContain("rgba(239, 68, 68")
    expect(strong?.backgroundColor).not.toBe(weak?.backgroundColor)
  })

  it("uses green background for negative deltas", () => {
    expect(deltaHeatmapCellStyle(-25, 50)?.backgroundColor).toContain(
      "rgba(34, 197, 94",
    )
  })

  it("returns semantic text classes by sign", () => {
    expect(deltaHeatmapTextClass(10)).toContain("text-red")
    expect(deltaHeatmapTextClass(-10)).toContain("text-green")
    expect(deltaHeatmapTextClass(0)).toBe("text-muted-foreground")
  })
})
