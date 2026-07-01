import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { isSpendingExpense } from "@/lib/spending"

const mockMomVarianceReportPage = vi.fn()

vi.mock("@/components/MomVarianceReportPage", () => ({
  MomVarianceReportPage: (props: Record<string, unknown>) => {
    mockMomVarianceReportPage(props)
    return <div data-testid="mom-variance-report-page" />
  },
}))

import { SpendingMomPage } from "./SpendingMomPage"

describe("SpendingMomPage", () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    mockMomVarianceReportPage.mockClear()
  })

  it("passes isSpendingExpense filter and spending copy to MomVarianceReportPage", () => {
    render(<SpendingMomPage />)

    expect(screen.getByTestId("mom-variance-report-page")).toBeTruthy()

    const props = mockMomVarianceReportPage.mock.calls[0]?.[0] as {
      filter: (row: unknown) => boolean
      pageTitle: string
      emptyMessage: string
      momTopNFamily: string
      trendChartTitle: string
    }

    expect(props.pageTitle).toBe("Spending")
    expect(props.emptyMessage).toBe("No spending in this date range")
    expect(props.momTopNFamily).toBe("spending")
    expect(props.trendChartTitle).toBe("MoM spending change")
    expect(props.filter).toBe(isSpendingExpense)
  })
})

describe("routes", () => {
  it("registers reports/spending/mom to SpendingMomPage", async () => {
    const { router } = await import("@/routes")
    const spendingMomRoute = router.routes[0]?.children?.find(
      (route) => route.path === "reports/spending/mom",
    )
    expect(spendingMomRoute).toBeDefined()
    expect(spendingMomRoute?.path).toBe("reports/spending/mom")
  })
})
