import { BudgetLineReportPage } from "@/components/BudgetLineReportPage"
import { isSpendingExpense } from "@/lib/spending"

export function SpendingLinePage() {
  return (
    <BudgetLineReportPage
      filter={isSpendingExpense}
      pageTitle="Spending"
      lineChartTitle="Spending trends by month"
      emptyMessage="No spending in this date range"
      yAxisName="Spending"
    />
  )
}
