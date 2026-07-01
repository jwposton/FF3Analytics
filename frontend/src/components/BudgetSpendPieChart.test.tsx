import { describe, expect, it } from "vitest"

import {
  pieSegmentLabel,
  PIE_LABEL_MIN_PERCENT,
} from "@/components/BudgetSpendPieChart"

describe("pieSegmentLabel", () => {
  it("shows name and percent when slice is large enough", () => {
    expect(pieSegmentLabel("Groceries", 12.4)).toBe("Groceries\n12.4%")
  })

  it("hides label for small slices", () => {
    expect(pieSegmentLabel("Misc", 3.2)).toBe("")
  })

  it("shows label at the minimum threshold", () => {
    expect(pieSegmentLabel("Transport", PIE_LABEL_MIN_PERCENT)).toBe(
      "Transport\n5.0%",
    )
  })

  it("truncates long budget names", () => {
    expect(
      pieSegmentLabel("Very Long Budget Name Here", 10),
    ).toBe("Very Long Budget…\n10.0%")
  })
})
