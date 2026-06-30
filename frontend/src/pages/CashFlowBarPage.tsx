import { BudgetBarReportPage } from "@/components/BudgetBarReportPage"
import { isCashFlowOutflow } from "@/lib/spending"

export function CashFlowBarPage() {
  return (
    <BudgetBarReportPage
      filter={isCashFlowOutflow}
      useCashFlowLabels
      pageTitle="Cash Flow"
      mainChartTitle="Cash flow by month"
      emptyMessage="No cash outflow in this date range"
      yAxisName="Cash outflow"
    />
  )
}
