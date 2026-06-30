import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { isTrendCashOutflow } from "@/lib/spending"

vi.mock("@/components/BudgetLineReportPage", () => ({
  BudgetLineReportPage: ({
    filter,
    pageTitle,
    emptyMessage,
    lineChartTitle,
    yAxisName,
  }: {
    filter: (row: unknown) => boolean
    pageTitle: string
    emptyMessage: string
    lineChartTitle: string
    yAxisName: string
  }) => (
    <div
      data-testid="budget-line-report"
      data-filter={filter === isTrendCashOutflow ? "cash-outflow" : "other"}
      data-page-title={pageTitle}
      data-empty-message={emptyMessage}
      data-line-chart-title={lineChartTitle}
      data-y-axis-name={yAxisName}
    />
  ),
}))

import { CashFlowLinePage } from "./CashFlowLinePage"

describe("CashFlowLinePage", () => {
  it("uses BudgetLineReportPage with isTrendCashOutflow filter", () => {
    const { getByTestId } = render(<CashFlowLinePage />)
    const el = getByTestId("budget-line-report")

    expect(el.getAttribute("data-filter")).toBe("cash-outflow")
  })

  it("shows No cash outflow in this date range empty message", () => {
    const { getByTestId } = render(<CashFlowLinePage />)
    const el = getByTestId("budget-line-report")

    expect(el.getAttribute("data-empty-message")).toBe(
      "No cash outflow in this date range",
    )
  })

  it("uses Cash Flow page title and cash flow line chart copy", () => {
    const { getByTestId } = render(<CashFlowLinePage />)
    const el = getByTestId("budget-line-report")

    expect(el.getAttribute("data-page-title")).toBe("Cash Flow")
    expect(el.getAttribute("data-line-chart-title")).toBe(
      "Cash flow trends by month",
    )
    expect(el.getAttribute("data-y-axis-name")).toBe("Cash outflow")
  })
})
