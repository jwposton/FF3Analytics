import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MomTrendChart } from "./MomTrendChart"

let capturedOption: Record<string, unknown> | null = null

vi.mock("echarts-for-react", () => ({
  default: ({
    option,
    "data-testid": testId,
  }: {
    option: Record<string, unknown>
    "data-testid"?: string
  }) => {
    capturedOption = option
    return <div data-testid={testId ?? "echarts-mock"} />
  },
}))

const sampleProps = {
  deltaMonths: ["2026-02", "2026-03"],
  series: [
    { name: "Groceries", data: [20, -10] },
    { name: "Transport", data: [-5, 15] },
  ],
  loading: false,
  emptyMessage: "No spending in this date range",
  chartTitle: "MoM spending change",
  yAxisName: "Δ spending",
}

describe("MomTrendChart", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    capturedOption = null
  })

  it("renders data-testid mom-trend-chart when series non-empty", () => {
    render(<MomTrendChart {...sampleProps} />)

    expect(screen.getByTestId("mom-trend-chart")).toBeTruthy()
  })

  it("omits min: 0 on yAxis for signed deltas", () => {
    render(<MomTrendChart {...sampleProps} />)

    const yAxis = capturedOption?.yAxis as Record<string, unknown>
    expect(yAxis?.min).toBeUndefined()
  })

  it("adds markLine at y=0 on first series", () => {
    render(<MomTrendChart {...sampleProps} />)

    const series = capturedOption?.series as Array<Record<string, unknown>>
    const markLine = series?.[0]?.markLine as { data?: unknown[] }
    expect(markLine?.data).toEqual([{ yAxis: 0 }])
  })

  it("uses item trigger tooltip", () => {
    render(<MomTrendChart {...sampleProps} />)

    const tooltip = capturedOption?.tooltip as Record<string, unknown>
    expect(tooltip?.trigger).toBe("item")
  })

  it("shows empty message when series is empty", () => {
    render(
      <MomTrendChart
        {...sampleProps}
        series={[]}
        deltaMonths={[]}
      />,
    )

    expect(screen.queryByTestId("mom-trend-chart")).toBeNull()
    expect(screen.getByText("No spending in this date range")).toBeTruthy()
  })
})
