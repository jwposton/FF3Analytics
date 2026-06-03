import { KpiCards } from "@/components/KpiCards"
import { useDateRange } from "@/context/DateRangeContext"
import { useNormalizedTransactions } from "@/hooks/useNormalizedTransactions"

export function DashboardPage() {
  const { committedRange } = useDateRange()
  const { isPending, isError, isSuccess, data, refetch } =
    useNormalizedTransactions(committedRange.start, committedRange.end)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <KpiCards
        rows={isSuccess ? (data?.data ?? []) : []}
        isLoading={isPending}
        isError={isError}
        onRetry={() => {
          void refetch()
        }}
      />
    </div>
  )
}
