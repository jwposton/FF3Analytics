import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { spendingRowsForTotal } from "@/test/fixtures/omniRows"

import { DashboardTiles } from "./DashboardTiles"

vi.mock("@/components/BudgetSpendPieChart", () => ({
  BudgetSpendPieChart: ({ chartTitle }: { chartTitle?: string }) => (
    <div data-testid="budget-spend-pie-chart">{chartTitle}</div>
  ),
}))

vi.mock("@/components/BudgetCurrentVsAverageChart", () => ({
  BudgetCurrentVsAverageChart: ({ chartTitle }: { chartTitle?: string }) => (
    <div data-testid="budget-current-vs-average-chart">{chartTitle}</div>
  ),
}))

describe("DashboardTiles", () => {
  afterEach(() => {
    cleanup()
  })

  it("shows skeleton placeholders while loading", () => {
    render(
      <DashboardTiles
        rangeRows={[]}
        rangeStart="2024-01-01"
        rangeEnd="2024-01-31"
        averageRows={[]}
        averageStart="2023-01-01"
        averageEnd="2024-01-31"
        isRangeLoading
        isAverageLoading
        isError={false}
        onRetry={() => {}}
      />,
    )
    expect(screen.queryByText("Total spending")).toBeNull()
    expect(screen.queryByText("Unable to load transactions")).toBeNull()
  })

  it("shows error banner and Retry when isError", () => {
    const onRetry = vi.fn()
    render(
      <DashboardTiles
        rangeRows={[]}
        rangeStart="2024-01-01"
        rangeEnd="2024-01-31"
        averageRows={[]}
        averageStart="2023-01-01"
        averageEnd="2024-01-31"
        isRangeLoading={false}
        isAverageLoading={false}
        isError
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText("Unable to load transactions")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("renders KPIs and chart tiles on success", () => {
    render(
      <DashboardTiles
        rangeRows={spendingRowsForTotal}
        rangeStart="2024-01-01"
        rangeEnd="2024-01-31"
        averageRows={spendingRowsForTotal}
        averageStart="2023-01-01"
        averageEnd="2024-01-31"
        isRangeLoading={false}
        isAverageLoading={false}
        isError={false}
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText("Total spending")).toBeTruthy()
    expect(screen.getByText("75.50")).toBeTruthy()
    expect(screen.getByText("Food")).toBeTruthy()
    expect(screen.getByText("Top category")).toBeTruthy()
    expect(screen.getByTestId("budget-spend-pie-chart")).toBeTruthy()
    expect(screen.getByTestId("budget-current-vs-average-chart")).toBeTruthy()
  })
})
