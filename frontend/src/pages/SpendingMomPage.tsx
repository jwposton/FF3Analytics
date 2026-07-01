import { MomVarianceReportPage } from "@/components/MomVarianceReportPage"
import { isSpendingExpense } from "@/lib/spending"

export function SpendingMomPage() {
  return (
    <MomVarianceReportPage
      filter={isSpendingExpense}
      pageTitle="Spending"
      emptyMessage="No spending in this date range"
      momTopNFamily="spending"
      trendChartTitle="MoM spending change"
      yAxisNameTrend="Δ spending"
      interactionHintTrend="Click a budget line to drill down by category."
      tabTrendLabel="Trend"
      tabCompareLabel="Compare"
      topNLabel="Budgets shown:"
    />
  )
}
