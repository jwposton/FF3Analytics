import { useEffect, useMemo, useState } from "react"

import { MomCompareChart } from "@/components/MomCompareChart"
import { MomTrendChart } from "@/components/MomTrendChart"
import { Button } from "@/components/ui/button"
import { useDateRange } from "@/context/DateRangeContext"
import { useNormalizedTransactions } from "@/hooks/useNormalizedTransactions"
import { buildBarChartData } from "@/lib/barChart"
import {
  aggregateOtherDeltas,
  buildTrendDeltaSeries,
  compareDelta,
  defaultMonthPair,
  rankStacksByAbsDelta,
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
  compareEmptyMessage: string
  useCashFlowLabels?: boolean
  momTopNFamily: MomTopNFamily
  trendChartTitle: string
  compareChartTitle: string
  yAxisNameTrend: string
  yAxisNameCompare: string
  interactionHintTrend: string
  interactionHintCompare: string
  tabTrendLabel: string
  tabCompareLabel: string
  topNLabel: string
  monthALabel?: string
  monthBLabel?: string
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
  compareEmptyMessage,
  useCashFlowLabels = false,
  momTopNFamily,
  trendChartTitle,
  compareChartTitle,
  yAxisNameTrend,
  yAxisNameCompare,
  interactionHintTrend,
  interactionHintCompare,
  tabTrendLabel,
  tabCompareLabel,
  topNLabel,
  monthALabel = "Month A",
  monthBLabel = "Month B",
}: MomVarianceReportPageProps) {
  const { committedRange } = useDateRange()
  const { start: committedStart, end: committedEnd } = committedRange
  const { isPending, isError, isSuccess, data, refetch } =
    useNormalizedTransactions(committedStart, committedEnd)

  const [activeTab, setActiveTab] = useState<ActiveTab>("trend")
  const [topN, setTopN] = useState(() => readMomTopN(momTopNFamily))
  const [monthA, setMonthA] = useState("")
  const [monthB, setMonthB] = useState("")

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

  const months = budgetChartData.months
  const monthsSelectable = months.length >= 2

  useEffect(() => {
    const pair = defaultMonthPair(months)
    setMonthA(pair.monthA)
    setMonthB(pair.monthB)
  }, [committedStart, committedEnd, months])

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

  const compareChartData = useMemo(() => {
    if (!monthsSelectable || !monthA || !monthB) {
      return { sortedNames: [] as string[], deltas: new Map<string, number>() }
    }

    const rawDeltas = compareDelta(budgetChartData, monthA, monthB)
    const { names: topNames } = rankStacksByAbsDelta(rawDeltas, topN)
    const aggregated = aggregateOtherDeltas(rawDeltas, topNames)
    const sortedNames = topNames.filter((name) => aggregated.has(name))

    return { sortedNames, deltas: aggregated }
  }, [budgetChartData, monthA, monthB, topN, monthsSelectable])

  const compareDisplayMessage = monthsSelectable
    ? emptyMessage
    : compareEmptyMessage

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

            {activeTab === "compare" ? (
              <>
                <label className="flex items-center gap-2 font-medium">
                  {monthALabel}
                  <select
                    className="min-w-[140px] rounded-md border border-input bg-background px-2 py-1"
                    value={monthA}
                    disabled={controlsDisabled || !monthsSelectable}
                    onChange={(e) => setMonthA(e.target.value)}
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 font-medium">
                  {monthBLabel}
                  <select
                    className="min-w-[140px] rounded-md border border-input bg-background px-2 py-1"
                    value={monthB}
                    disabled={controlsDisabled || !monthsSelectable}
                    onChange={(e) => setMonthB(e.target.value)}
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}

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
            <MomCompareChart
              sortedNames={compareChartData.sortedNames}
              deltas={compareChartData.deltas}
              loading={isPending}
              emptyMessage={compareDisplayMessage}
              chartTitle={compareChartTitle}
              interactionHint={interactionHintCompare}
              yAxisName={yAxisNameCompare}
            />
          )}
        </div>
      )}
    </div>
  )
}
