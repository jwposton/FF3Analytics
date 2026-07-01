import { useMemo } from "react"

import { DashboardTiles } from "@/components/DashboardTiles"
import { useDateRange } from "@/context/DateRangeContext"
import { useNormalizedTransactions } from "@/hooks/useNormalizedTransactions"
import {
  currentCalendarMonth,
  rollingAverageFetchRange,
} from "@/lib/momVariance"
import type { RollingWindowMonths } from "@/lib/momComparePrefs"

const ROLLING_WINDOW_MONTHS = 12 as RollingWindowMonths

export function DashboardPage() {
  const { committedRange } = useDateRange()
  const { start: rangeStart, end: rangeEnd } = committedRange
  const currentMonth = useMemo(() => currentCalendarMonth(), [])
  const [averageStart, averageEnd] = useMemo(
    () => rollingAverageFetchRange(currentMonth, ROLLING_WINDOW_MONTHS),
    [currentMonth],
  )

  const {
    isPending: isRangePending,
    isError: isRangeError,
    isSuccess: isRangeSuccess,
    data: rangeData,
    refetch: refetchRange,
  } = useNormalizedTransactions(rangeStart, rangeEnd)

  const {
    isPending: isAveragePending,
    isError: isAverageError,
    isSuccess: isAverageSuccess,
    data: averageData,
    refetch: refetchAverage,
  } = useNormalizedTransactions(averageStart, averageEnd)

  const handleRetry = () => {
    void refetchRange()
    void refetchAverage()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <DashboardTiles
        rangeRows={isRangeSuccess ? (rangeData?.data ?? []) : []}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        averageRows={isAverageSuccess ? (averageData?.data ?? []) : []}
        averageStart={averageStart}
        averageEnd={averageEnd}
        isRangeLoading={isRangePending}
        isAverageLoading={isAveragePending}
        isError={isRangeError || isAverageError}
        onRetry={handleRetry}
      />
    </div>
  )
}
