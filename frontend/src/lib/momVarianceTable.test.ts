import { describe, expect, it } from "vitest"

import type { BarChartData } from "@/lib/barChart"
import {
  aggregatedStackAmount,
  buildCompareAmountTableData,
  buildTrendDeltaTableData,
} from "@/lib/momVarianceTable"

function makeChartData(
  months: string[],
  stacks: string[],
  data: Record<string, Record<string, number>>,
): BarChartData {
  return { months, stacks, data }
}

describe("aggregatedStackAmount", () => {
  it("returns stack amount for a named row", () => {
    const chart = makeChartData(
      ["2024-01"],
      ["Groceries", "Transport"],
      { "2024-01": { Groceries: 100, Transport: 40 } },
    )
    expect(
      aggregatedStackAmount(chart, "Groceries", "2024-01", ["Groceries"]),
    ).toBe(100)
  })

  it("sums excluded stacks into Other", () => {
    const chart = makeChartData(
      ["2024-01"],
      ["Groceries", "Transport", "Dining"],
      {
        "2024-01": { Groceries: 100, Transport: 40, Dining: 25 },
      },
    )
    expect(
      aggregatedStackAmount(chart, "Other", "2024-01", [
        "Groceries",
        "Other",
      ]),
    ).toBe(65)
  })
})

describe("buildCompareAmountTableData", () => {
  const chart = makeChartData(
    ["2024-01", "2024-02", "2024-03"],
    ["Groceries", "Transport"],
    {
      "2024-01": { Groceries: 100, Transport: 40 },
      "2024-02": { Groceries: 120, Transport: 50 },
      "2024-03": { Groceries: 150, Transport: 60 },
    },
  )

  it("builds month columns with delta summary in month-pair mode", () => {
    const table = buildCompareAmountTableData(
      chart,
      ["Groceries", "Transport"],
      "month-pair",
      {
        monthA: "2024-01",
        monthB: "2024-03",
        currentMonth: "2024-03",
        rollingWindow: 3,
        rollingAverageMethod: "mean",
      },
    )

    expect(table?.columns.map((column) => column.label)).toEqual([
      "2024-01",
      "2024-03",
      "Δ",
    ])
    expect(table?.rows[0]).toEqual({
      name: "Groceries",
      values: {
        "2024-01": 100,
        "2024-03": 150,
        __delta__: 50,
      },
    })
    expect(table?.rows[1]?.values.__delta__).toBe(20)
  })

  it("builds rolling baseline summary in vs-average mode", () => {
    const table = buildCompareAmountTableData(
      chart,
      ["Groceries"],
      "vs-average",
      {
        monthA: "2024-02",
        monthB: "2024-03",
        currentMonth: "2024-03",
        rollingWindow: 2,
        rollingAverageMethod: "mean",
      },
    )

    expect(table?.columns.at(-1)?.label).toBe("2mo avg")
    expect(table?.rows[0]?.values.__baseline__).toBe(110)
    expect(table?.rows[0]?.values["2024-03"]).toBe(150)
  })

  it("returns null when there are no rows", () => {
    expect(
      buildCompareAmountTableData(chart, [], "month-pair", {
        monthA: "2024-02",
        monthB: "2024-03",
        currentMonth: "2024-03",
        rollingWindow: 3,
        rollingAverageMethod: "mean",
      }),
    ).toBeNull()
  })
})

describe("buildTrendDeltaTableData", () => {
  it("maps series data to delta columns", () => {
    const table = buildTrendDeltaTableData(
      ["2024-02", "2024-03"],
      [{ name: "Groceries", data: [20, 30] }],
    )

    expect(table?.columns).toEqual([
      { key: "2024-02", label: "2024-02", kind: "delta" },
      { key: "2024-03", label: "2024-03", kind: "delta" },
    ])
    expect(table?.rows[0]).toEqual({
      name: "Groceries",
      values: { "2024-02": 20, "2024-03": 30 },
    })
  })
})
