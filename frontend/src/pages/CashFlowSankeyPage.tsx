import { useState } from "react"

import { SankeyReportPage } from "@/components/SankeyReportPage"
import {
  buildCashFlowSankeyData,
  isCashMovementRow,
} from "@/lib/sankey"
import {
  readAggregateBanks,
  writeAggregateBanks,
} from "@/lib/sankeyAggregateBanks"

export function CashFlowSankeyPage() {
  const [aggregateBanks, setAggregateBanks] = useState(readAggregateBanks)

  return (
    <SankeyReportPage
      filter={isCashMovementRow}
      pageTitle="Cash Flow"
      mainChartTitle="Cash flow"
      interactionHint="Click a flow to open matching transactions in Firefly."
      emptyMessage="No cash movement in this date range"
      buildMain={(rows) => buildCashFlowSankeyData(rows, aggregateBanks)}
      enableDrilldown={false}
      controls={
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={aggregateBanks}
              aria-label="Aggregate bank accounts"
              onChange={(e) => {
                const next = e.target.checked
                setAggregateBanks(next)
                writeAggregateBanks(next)
              }}
              className="accent-primary"
            />
            Aggregate bank accounts
          </label>
        </div>
      }
    />
  )
}
