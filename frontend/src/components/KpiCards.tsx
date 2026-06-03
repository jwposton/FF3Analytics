import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatCurrency,
  spendingWithdrawalTotal,
  topCategoryBySpend,
} from "@/lib/spending"
import type { OmniRow } from "@/types/NormalizedTransaction"

type KpiCardsProps = {
  rows: OmniRow[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

export function KpiCards({ rows, isLoading, isError, onRetry }: KpiCardsProps) {
  if (isError) {
    return (
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
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[0, 1].map((key) => (
          <Card key={key}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const total = spendingWithdrawalTotal(rows)
  const top = topCategoryBySpend(rows)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total spending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[32px] font-bold leading-tight tracking-tight">
            {formatCurrency(total)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Top category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-[32px] font-bold leading-tight tracking-tight">
            {top.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(top.amount)} · {formatPercent(top.percentOfTotal)} of
            total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
