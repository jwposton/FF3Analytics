import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { BarChartData } from "@/lib/barChart"

import { SpendingBarChart } from "./SpendingBarChart"

let capturedOption: Record<string, unknown> | null = null
let capturedOnEvents: Record<string, (params: unknown) => void> | null = null

vi.mock("echarts-for-react", () => ({
  default: ({
    option,
    onEvents,
  }: {
    option: Record<string, unknown>
    onEvents?: Record<string, (params: unknown) => void>
  }) => {
    capturedOption = option
    capturedOnEvents = onEvents ?? null
    return <div data-testid="echarts-mock" />
  },
}))

const sampleChartData: BarChartData = {
  months: ["2026-01"],
  stacks: ["Groceries", "Transport"],
  data: {
    "2026-01": { Groceries: 100, Transport: 50 },
  },
}

describe("SpendingBarChart", () => {
  beforeEach(() => {
    capturedOption = null
    capturedOnEvents = null
  })

  it("enables legend interaction with triggerEvent true", () => {
    render(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={() => {}}
      />,
    )

    const legend = capturedOption?.legend as Record<string, unknown>
    expect(legend?.orient).toBe("vertical")
    expect(legend?.right).toBe(4)
    expect(legend?.triggerEvent).toBe(true)
    expect(legend?.selectedMode).not.toBe(false)
  })

  it("reserves fixed right margin when legend labels are long", () => {
    const longLabelChart: BarChartData = {
      months: ["2026-01"],
      stacks: ["Whole Foods Market Downtown Location"],
      data: {
        "2026-01": { "Whole Foods Market Downtown Location": 100 },
      },
    }

    render(
      <SpendingBarChart
        chartData={longLabelChart}
        loading={false}
        emptyMessage="No data"
        onSelect={() => {}}
      />,
    )

    const grid = capturedOption?.grid as Record<string, unknown>
    expect(grid?.right).toBe(96)
    const legend = capturedOption?.legend as Record<string, unknown>
    expect(legend?.formatter).toBeTypeOf("function")
    expect(
      (legend.formatter as (name: string) => string)(
        "Whole Foods Market Downtown Location",
      ).endsWith("…"),
    ).toBe(true)
  })

  it("registers legendselectchanged handler for legend drill", () => {
    render(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={() => {}}
      />,
    )

    expect(capturedOnEvents?.legendselectchanged).toBeTypeOf("function")
  })

  it("calls onSelect when legend item is selected via legendselectchanged", () => {
    const onSelect = vi.fn()
    render(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={onSelect}
      />,
    )

    capturedOnEvents?.legendselectchanged?.({ name: "Groceries" })

    expect(onSelect).toHaveBeenCalledWith("Groceries")
  })

  it("calls onSelect when bar segment is clicked", () => {
    const onSelect = vi.fn()
    render(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={onSelect}
      />,
    )

    capturedOnEvents?.click?.({ seriesName: "Groceries" })

    expect(onSelect).toHaveBeenCalledWith("Groceries")
  })

  it("keeps the same onEvents object reference on rerender with same props", () => {
    const onSelect = vi.fn()
    const { rerender } = render(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={onSelect}
      />,
    )

    const firstOnEvents = capturedOnEvents

    rerender(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={onSelect}
      />,
    )

    expect(capturedOnEvents).toBe(firstOnEvents)
  })

  it("renders chartTitle and yAxisName props", () => {
    render(
      <SpendingBarChart
        chartData={sampleChartData}
        loading={false}
        emptyMessage="No data"
        onSelect={() => {}}
        chartTitle="Cash outflow by month"
        yAxisName="Cash outflow"
      />,
    )

    expect(screen.getByText("Cash outflow by month")).toBeTruthy()
    const yAxis = capturedOption?.yAxis as Record<string, unknown>
    expect(yAxis?.name).toBe("Cash outflow")
  })
})
