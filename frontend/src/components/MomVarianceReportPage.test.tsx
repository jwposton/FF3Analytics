import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { creditCardPaymentTransfer } from "@/test/fixtures/omniRows"

import { MomVarianceReportPage } from "./MomVarianceReportPage"

const mockUseDateRange = vi.fn()
const mockUseNormalizedTransactions = vi.fn()

vi.mock("@/context/DateRangeContext", () => ({
  useDateRange: () => mockUseDateRange(),
}))

vi.mock("@/hooks/useNormalizedTransactions", () => ({
  useNormalizedTransactions: (...args: unknown[]) =>
    mockUseNormalizedTransactions(...args),
}))

vi.mock("@/components/MomTrendChart", () => ({
  MomTrendChart: ({
    chartTitle,
    loading,
    series,
  }: {
    chartTitle: string
    loading: boolean
    series: { name: string; data: number[] }[]
  }) =>
    loading ? (
      <div data-testid="mom-trend-loading" />
    ) : (
      <div data-testid="mom-trend-chart-mock">
        <span>{chartTitle}</span>
        <span data-testid="series-count">{series.length}</span>
      </div>
    ),
}))

vi.mock("@/components/MomCompareChart", () => ({
  MomCompareChart: ({
    chartTitle,
    loading,
    sortedNames,
    emptyMessage,
  }: {
    chartTitle: string
    loading: boolean
    sortedNames: string[]
    emptyMessage: string
  }) =>
    loading ? (
      <div data-testid="mom-compare-loading" />
    ) : sortedNames.length === 0 ? (
      <div data-testid="mom-compare-empty">{emptyMessage}</div>
    ) : (
      <div data-testid="mom-compare-chart-mock">
        <span>{chartTitle}</span>
        <span data-testid="compare-names-count">{sortedNames.length}</span>
      </div>
    ),
}))

const pageProps = {
  pageTitle: "Spending",
  emptyMessage: "No spending in this date range",
  compareEmptyMessage:
    "Select a range spanning at least two months to compare months",
  momTopNFamily: "spending" as const,
  trendChartTitle: "MoM spending change",
  compareChartTitle: "Month-over-month spending change",
  yAxisNameTrend: "Δ spending",
  yAxisNameCompare: "Δ spending",
  interactionHintTrend: "Click a budget line to drill down by category.",
  interactionHintCompare: "Click a bar to drill down by category.",
  tabTrendLabel: "Trend",
  tabCompareLabel: "Compare",
  topNLabel: "Budgets shown:",
}

const alwaysTrue = () => true

describe("MomVarianceReportPage", () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  beforeEach(() => {
    mockUseDateRange.mockReturnValue({
      committedRange: { start: "2024-01-01", end: "2024-03-31" },
    })
    mockUseNormalizedTransactions.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: [creditCardPaymentTransfer] },
      refetch: vi.fn(),
    })
  })

  it("renders Trend tab active with MomTrendChart", () => {
    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    expect(screen.getByRole("button", { name: "Trend" })).toBeTruthy()
    expect(screen.getByTestId("mom-trend-chart-mock")).toBeTruthy()
    expect(screen.getByText("MoM spending change")).toBeTruthy()
  })

  it("renders MomCompareChart when Compare tab selected", () => {
    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    fireEvent.click(screen.getByRole("button", { name: "Compare" }))

    expect(screen.getByTestId("mom-compare-chart-mock")).toBeTruthy()
    expect(screen.getByText("Month-over-month spending change")).toBeTruthy()
    expect(screen.queryByTestId("mom-trend-chart-mock")).toBeNull()
  })

  it("shows month selectors on Compare tab only", () => {
    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    expect(screen.queryByText("Month A")).toBeNull()
    expect(screen.queryByText("Month B")).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Compare" }))

    expect(screen.getByText("Month A")).toBeTruthy()
    expect(screen.getByText("Month B")).toBeTruthy()
  })

  it("applies defaultMonthPair on mount (Month B latest, Month A prior)", () => {
    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    fireEvent.click(screen.getByRole("button", { name: "Compare" }))

    const selects = screen.getAllByRole("combobox")
    expect(selects).toHaveLength(2)
    expect((selects[0] as HTMLSelectElement).value).toBe("2024-02")
    expect((selects[1] as HTMLSelectElement).value).toBe("2024-03")
  })

  it("shows error banner when fetch fails", () => {
    mockUseNormalizedTransactions.mockReturnValue({
      isPending: false,
      isError: true,
      isSuccess: false,
      data: undefined,
      refetch: vi.fn(),
    })

    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    expect(screen.getByRole("alert")).toBeTruthy()
    expect(screen.getByText("Unable to load transactions")).toBeTruthy()
  })

  it("renders Top-N slider with Budgets shown label", () => {
    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    expect(screen.getByText("Budgets shown:")).toBeTruthy()
    const slider = screen.getByRole("slider")
    expect(slider.getAttribute("min")).toBe("10")
    expect(slider.getAttribute("max")).toBe("25")
  })

  it("shows compare empty copy when range has fewer than two months", () => {
    mockUseDateRange.mockReturnValue({
      committedRange: { start: "2024-03-01", end: "2024-03-31" },
    })

    render(<MomVarianceReportPage filter={alwaysTrue} {...pageProps} />)

    fireEvent.click(screen.getByRole("button", { name: "Compare" }))

    expect(
      screen.getByText(
        "Select a range spanning at least two months to compare months",
      ),
    ).toBeTruthy()
  })
})
