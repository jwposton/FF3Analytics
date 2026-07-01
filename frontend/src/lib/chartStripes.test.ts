import { describe, expect, it } from "vitest"

import {
  categoryAxisColumnStripes,
  categoryAxisRowStripes,
  CHART_STRIPE_COLORS,
} from "./chartStripes"

describe("chartStripes", () => {
  it("exports alternating stripe colors", () => {
    expect(CHART_STRIPE_COLORS).toHaveLength(2)
    expect(CHART_STRIPE_COLORS[0]).toContain("hsla")
    expect(CHART_STRIPE_COLORS[1]).toBe("rgba(255, 255, 255, 0)")
  })

  it("enables splitArea for row and column category axes", () => {
    expect(categoryAxisRowStripes().splitArea?.show).toBe(true)
    expect(categoryAxisColumnStripes().splitArea?.areaStyle?.color).toEqual([
      ...CHART_STRIPE_COLORS,
    ])
  })
})
