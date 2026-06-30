import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { isSpendingExpense } from "@/lib/spending"
import { mainCheckingWithdrawal } from "@/test/fixtures/omniRows"

const mockUseDateRange = vi.fn()
const mockUseNormalizedTransactions = vi.fn()

vi.mock("@/context/DateRangeContext", () => ({
  useDateRange: () => mockUseDateRange(),
}))

vi.mock("@/hooks/useNormalizedTransactions", () => ({
  useNormalizedTransactions: (...args: unknown[]) =>
    mockUseNormalizedTransactions(...args),
}))

vi.mock("@/components/SankeyChart", () => ({
  SankeyChart: ({
    emptyMessage,
    loading,
    data,
  }: {
    emptyMessage: string
    loading: boolean
    data: { nodes: unknown[] }
  }) => {
    if (loading) {
      return <div data-testid="chart-loading" />
    }
    const hasData = data.nodes.length > 0
    return hasData ? (
      <div data-testid="sankey-chart" />
    ) : (
      <div data-testid="empty-message">{emptyMessage}</div>
    )
  },
}))

import { SpendingSankeyPage } from "./SpendingSankeyPage"

describe("SpendingSankeyPage", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockUseDateRange.mockReturnValue({
      committedRange: { start: "2024-01-01", end: "2024-01-31" },
    })
    mockUseNormalizedTransactions.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: [] },
      refetch: vi.fn(),
    })
  })

  it("uses isSpendingExpense filter and spending empty copy", () => {
    render(<SpendingSankeyPage />)

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Spending",
    )
    expect(screen.getByTestId("empty-message").textContent).toBe(
      "No spending in this date range",
    )
  })

  it("renders chart for spending expense rows", () => {
    const rows = [mainCheckingWithdrawal]
    expect(rows.filter(isSpendingExpense).length).toBeGreaterThan(0)

    mockUseNormalizedTransactions.mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: rows },
      refetch: vi.fn(),
    })

    render(<SpendingSankeyPage />)

    expect(screen.getByTestId("sankey-chart")).toBeTruthy()
    expect(screen.queryByTestId("empty-message")).toBeNull()
  })
})
