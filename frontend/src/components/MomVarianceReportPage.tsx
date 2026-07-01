import { useMemo, useState } from "react"

import { MomTrendChart } from "@/components/MomTrendChart"
import { Button } from "@/components/ui/button"
import { useDateRange } from "@/context/DateRangeContext"
import { useNormalizedTransactions } from "@/hooks/useNormalizedTransactions"
import { buildBarChartData } from "@/lib/barChart"
import {
  buildTrendDeltaSeries,
  rankTrendStacksByActivity,
  sliceTrendWindowMonths,
} from "@/lib/momVariance"
import { readMomTopN, writeMomTopN, type MomTopNFamily } from "@/lib/momTopN"
import { TOP_N_MAX, TOP_N_MIN } from "@/lib/topNConstants"
import type { OmniRow } from "@/types/NormalizedTransaction"

const OTHER_LABEL = "Other"

export type MomVarianceReportPageProps = {
  filter: (row: OmniRow) => boolean
  pageTitle: string
  emptyMessage: string
  useCashFlowLabels?: boolean
  momTopNFamily: MomTopNFamily
  trendChartTitle: string
  yAxisNameTrend: string
  interactionHintTrend: string
  tabTrendLabel: string
  tabCompareLabel: string
  topNLabel: string
}

type ActiveTab = "trend" | "compare"

function filterTrendSeriesByTopN(
  allSeries: { name: string; data: number[] }[],
  topNames: string[],
): { name: string; data: number[] }[] {
  const topSet = new Set(topNames.filter((name) => name !== OTHER_LABEL))
  const includesOther = topNames.includes(OTHER_LABEL)

  const filtered = allSeries.filter((s) => topSet.has(s.name))

  if (includesOther) {
    const pointCount = allSeries[0]?.data.length ?? 0
    const otherData = Array.from({ length: pointCount }, (_, idx) =>
      allSeries
        .filter((s) => !topSet.has(s.name))
        .reduce((sum, s) => sum + (s.data[idx] ?? 0), 0),
    )
    filtered.push({ name: OTHER_LABEL, data: otherData })
  }

  return filtered
}

export function MomVarianceReportPage({
  filter,
  pageTitle,
  emptyMessage,
  useCashFlowLabels = false,
  momTopNFamily,
  trendChartTitle,
  yAxisNameTrend,
  interactionHintTrend,
  tabTrendLabel,
  tabCompareLabel,
  topNLabel,
}: MomVarianceReportPageProps) {
  const { committedRange } = useDateRange()
  const { start: committedStart, end: committedEnd } = committedRange
  const { isPending, isError, isSuccess, data, refetch } =
    useNormalizedTransactions(committedStart, committedEnd)

  const [activeTab, setActiveTab] = useState<ActiveTab>("trend")
  const [topN, setTopN] = useState(() => readMomTopN(momTopNFamily))

  const allRows = isSuccess ? (data?.data ?? []) : []
  const sliceRows = useMemo(() => allRows.filter(filter), [allRows, filter])

  const budgetChartData = useMemo(
    () =>
      buildBarChartData(sliceRows, ["month", "budget"], {
        start: committedStart,
        end: committedEnd,
        useCashFlowLabels,
      }),
    [sliceRows, committedStart, committedEnd, useCashFlowLabels],
  )

  const trendChartData = useMemo(() => {
    const windowMonths = sliceTrendWindowMonths(budgetChartData.months)
    const { deltaMonths, series: allSeries } = buildTrendDeltaSeries(
      budgetChartData,
      windowMonths,
    )
    const { names: topNames } = rankTrendStacksByActivity(
      budgetChartData,
      windowMonths,
      topN,
    )
    const series = filterTrendSeriesByTopN(allSeries, topNames)
    return { deltaMonths, series }
  }, [budgetChartData, topN])

  const controlsDisabled = isPending || isError

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>

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
        <div className="space-y-6">
          <div
            className={`flex flex-wrap items-center gap-4 text-sm ${controlsDisabled ? "opacity-50" : ""}`}
          >
            <div
              className="inline-flex rounded-md border shadow-xs"
              role="group"
              aria-label="MoM view mode"
            >
              <Button
                type="button"
                variant={activeTab === "trend" ? "default" : "outline"}
                size="sm"
                className="rounded-r-none border-0"
                disabled={controlsDisabled}
                onClick={() => setActiveTab("trend")}
              >
                {tabTrendLabel}
              </Button>
              <Button
                type="button"
                variant={activeTab === "compare" ? "default" : "outline"}
                size="sm"
                className="rounded-l-none border-0 border-l"
                disabled={controlsDisabled}
                onClick={() => setActiveTab("compare")}
              >
                {tabCompareLabel}
              </Button>
            </div>

            <label className="flex items-center gap-2 font-medium">
              {topNLabel}
              <input
                type="range"
                min={TOP_N_MIN}
                max={TOP_N_MAX}
                value={topN}
                disabled={controlsDisabled}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  setTopN(n)
                  writeMomTopN(momTopNFamily, n)
                }}
                className="accent-primary"
                style={{ width: 120 }}
              />
              <span className="w-9 text-right font-mono tabular-nums">
                {topN}
              </span>
            </label>
          </div>

          {activeTab === "trend" ? (
            <MomTrendChart
              deltaMonths={trendChartData.deltaMonths}
              series={trendChartData.series}
              loading={isPending}
              emptyMessage={emptyMessage}
              chartTitle={trendChartTitle}
              interactionHint={interactionHintTrend}
              yAxisName={yAxisNameTrend}
            />
          ) : (
            <div className="flex min-h-[480px] items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
              Compare view coming next
            </div>
          )}
        </div>
      )}
    </div>
  )
}
