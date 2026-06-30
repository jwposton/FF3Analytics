import { BudgetLineReportPage } from "@/components/BudgetLineReportPage"
import { isCashFlowOutflow } from "@/lib/spending"

export function CashFlowLinePage() {
  return (
    <BudgetLineReportPage
      filter={isCashFlowOutflow}
      useCashFlowLabels
      pageTitle="Cash Flow"
      lineChartTitle="Cash flow trends by month"
      emptyMessage="No cash outflow in this date range"
      yAxisName="Cash outflow"
    />
  )
}
