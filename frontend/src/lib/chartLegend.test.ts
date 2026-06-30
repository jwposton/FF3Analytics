import { describe, expect, it } from "vitest"

import {
  chartGridWithVerticalLegend,
  LEGEND_COLUMN_WIDTH,
  truncateLegendLabel,
  verticalLegendGridRight,
} from "@/lib/chartLegend"

describe("verticalLegendGridRight", () => {
  it("uses fixed margin matching legend column width", () => {
    expect(verticalLegendGridRight(["Food", "Transport"])).toBe(
      LEGEND_COLUMN_WIDTH,
    )
    expect(
      verticalLegendGridRight(["Whole Foods Market Downtown"]),
    ).toBe(LEGEND_COLUMN_WIDTH)
  })
})

describe("truncateLegendLabel", () => {
  it("shortens long labels with ellipsis", () => {
    const long = "Citi®/AAdvantage® Platinum Select® World Elite Mastercard®-2765"
    expect(truncateLegendLabel(long).length).toBeLessThanOrEqual(14)
    expect(truncateLegendLabel(long).endsWith("…")).toBe(true)
  })

  it("leaves short labels unchanged", () => {
    expect(truncateLegendLabel("CC Payment")).toBe("CC Payment")
  })
})

describe("chartGridWithVerticalLegend", () => {
  it("sets right inset from legend column width", () => {
    const grid = chartGridWithVerticalLegend(["Short"])
    expect(grid.right).toBe(LEGEND_COLUMN_WIDTH)
    expect(grid.left).toBe(36)
  })
})
