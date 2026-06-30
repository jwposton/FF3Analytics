import { describe, expect, it } from "vitest"

import type { OmniRow } from "@/types/NormalizedTransaction"
import {
  creditCardPaymentTransfer,
  creditCardWithdrawal,
  mainCheckingWithdrawal,
} from "@/test/fixtures/omniRows"
import { buildBarChartData } from "@/lib/barChart"
import { isSpendingExpense, isTrendCashOutflow } from "@/lib/spending"

function makeRow(overrides: Partial<OmniRow> & Pick<OmniRow, "date">): OmniRow {
  return { ...mainCheckingWithdrawal, ...overrides }
}

describe("buildBarChartData", () => {
  it("month: zero-fills months with no rows", () => {
    const rows = [makeRow({ date: "2026-01-15", budget: "Essentials" })]
    const result = buildBarChartData(rows, ["month", "budget"], {
      start: "2026-01-01",
      end: "2026-03-31",
    })
    expect(result.months).toEqual(["2026-01", "2026-02", "2026-03"])
    expect(result.data["2026-02"]?.["Essentials"]).toBe(0)
  })

  it("sort: stacks ordered descending by range total", () => {
    const rows = [
      makeRow({ date: "2026-01-10", budget: "Small", amount: "10.00" }),
      makeRow({ date: "2026-01-11", budget: "Large", amount: "100.00" }),
      makeRow({ date: "2026-02-01", budget: "Small", amount: "20.00" }),
    ]
    const result = buildBarChartData(rows, ["month", "budget"], {
      start: "2026-01-01",
      end: "2026-02-28",
    })
    expect(result.stacks).toEqual(["Large", "Small"])
  })

  it("drill: filters category stacks to selected budget", () => {
    const rows = [
      makeRow({
        date: "2026-01-10",
        budget: "Essentials",
        category: "Food",
        amount: "50.00",
      }),
      makeRow({
        date: "2026-01-11",
        budget: "Essentials",
        category: "Transport",
        amount: "30.00",
      }),
      makeRow({
        date: "2026-01-12",
        budget: "Fun",
        category: "Entertainment",
        amount: "200.00",
      }),
    ]
    const result = buildBarChartData(rows, ["month", "category"], {
      start: "2026-01-01",
      end: "2026-01-31",
      filter: { budget: "Essentials" },
    })
    expect(result.stacks).toContain("Food")
    expect(result.stacks).toContain("Transport")
    expect(result.stacks).not.toContain("Entertainment")
    expect(result.data["2026-01"]?.["Food"]).toBeCloseTo(50, 2)
    expect(result.data["2026-01"]?.["Transport"]).toBeCloseTo(30, 2)
  })

  it("uncategorized: null budget maps to Uncategorized stack", () => {
    const rows = [creditCardWithdrawal]
    const result = buildBarChartData(rows, ["month", "budget"], {
      start: "2024-01-01",
      end: "2024-01-31",
    })
    expect(result.stacks).toEqual(["Uncategorized"])
    expect(result.data["2024-01"]?.["Uncategorized"]).toBeCloseTo(100, 2)
  })

  it("slice: transfer rows do not contribute when caller pre-filters spending", () => {
    const rows = [
      makeRow({ date: "2026-01-10", budget: "Essentials", amount: "75.50" }),
      creditCardPaymentTransfer,
      { ...creditCardPaymentTransfer, date: "2026-01-15" },
    ].filter(isSpendingExpense)
    const result = buildBarChartData(rows, ["month", "budget"], {
      start: "2026-01-01",
      end: "2026-01-31",
    })
    expect(result.data["2026-01"]?.["Essentials"]).toBeCloseTo(75.5, 2)
    expect(result.stacks).toEqual(["Essentials"])
  })

  it("slice: cash-outflow pre-filtered rows produce non-empty stacks", () => {
    const rows = [
      creditCardPaymentTransfer,
      { ...creditCardPaymentTransfer, date: "2026-02-01", amount: "150.00" },
      mainCheckingWithdrawal,
    ].filter(isTrendCashOutflow)
    const result = buildBarChartData(rows, ["month", "budget"], {
      start: "2024-01-01",
      end: "2026-02-28",
    })
    expect(result.stacks.length).toBeGreaterThan(0)
    expect(result.data["2024-01"]?.["Credit Card Payment"]).toBeCloseTo(200, 2)
    expect(result.data["2026-02"]?.["Credit Card Payment"]).toBeCloseTo(150, 2)
  })

  it("uncategorized: empty category label maps to Uncategorized", () => {
    const rows = [
      makeRow({
        date: "2026-01-10",
        budget: "Essentials",
        category: "",
        amount: "25.00",
      }),
    ]
    const result = buildBarChartData(rows, ["month", "category"], {
      start: "2026-01-01",
      end: "2026-01-31",
    })
    expect(result.stacks).toEqual(["Uncategorized"])
    expect(result.data["2026-01"]?.["Uncategorized"]).toBeCloseTo(25, 2)
  })
})
