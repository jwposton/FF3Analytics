import { useMemo } from "react"
import type { ReactNode } from "react"

import { SankeyChart } from "@/components/SankeyChart"
import { Button } from "@/components/ui/button"
import { useDateRange } from "@/context/DateRangeContext"
import { useNormalizedTransactions } from "@/hooks/useNormalizedTransactions"
import type { SankeyData } from "@/lib/sankey"
import { sankeyChartHeight } from "@/lib/sankey"
import type { OmniRow } from "@/types/NormalizedTransaction"

export type SankeyReportPageProps = {
  filter: (row: OmniRow) => boolean
  pageTitle: string
  mainChartTitle: string
  interactionHint: string
  emptyMessage: string
  buildMain: (rows: OmniRow[]) => SankeyData
  controls?: ReactNode
  enableDrilldown?: boolean
}

export function SankeyReportPage({
  filter,
  pageTitle,
  mainChartTitle,
  interactionHint,
  emptyMessage,
  buildMain,
  controls,
  enableDrilldown: _enableDrilldown = false,
}: SankeyReportPageProps) {
  const { committedRange } = useDateRange()
  const { start: committedStart, end: committedEnd } = committedRange
  const { isPending, isError, isSuccess, data, refetch } =
    useNormalizedTransactions(committedStart, committedEnd)

  const allRows = isSuccess ? (data?.data ?? []) : []

  const sliceRows = useMemo(() => allRows.filter(filter), [allRows, filter])

  const mainData = useMemo(
    () => buildMain(sliceRows),
    [sliceRows, buildMain],
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>

      {controls}

      {isError ? (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
          role="alert"
        >
          <h2 className="text-sm font-semibold text-destructive">
            Unable to load transactions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Check that the backend is running and Firefly credentials are
            configured.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void refetch()
            }}
          >
            Retry
          </Button>
        </div>
      ) : (
        <SankeyChart
          data={mainData}
          loading={isPending}
          emptyMessage={emptyMessage}
          height={sankeyChartHeight(mainData.nodes.length)}
          chartTitle={mainChartTitle}
          interactionHint={interactionHint}
        />
      )}
    </div>
  )
}
