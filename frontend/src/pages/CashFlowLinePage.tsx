import { BudgetLineReportPage } from "@/components/BudgetLineReportPage"
import { isTrendCashOutflow } from "@/lib/spending"

export function CashFlowLinePage() {
  return (
    <BudgetLineReportPage
      filter={isTrendCashOutflow}
      pageTitle="Cash Flow"
      lineChartTitle="Cash flow trends by month"
      emptyMessage="No cash outflow in this date range"
      yAxisName="Cash outflow"
    />
  )
}
