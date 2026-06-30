import { SankeyReportPage } from "@/components/SankeyReportPage"
import { buildSpendingSankeyData } from "@/lib/sankey"
import { isSpendingExpense } from "@/lib/spending"

export function SpendingSankeyPage() {
  return (
    <SankeyReportPage
      filter={isSpendingExpense}
      pageTitle="Spending"
      mainChartTitle="Money flow"
      interactionHint="Click a node to drill down. Click a flow to open matching transactions in Firefly."
      emptyMessage="No spending in this date range"
      buildMain={(rows) =>
        buildSpendingSankeyData(rows, "source-budget-category")
      }
    />
  )
}
