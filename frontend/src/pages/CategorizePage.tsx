import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDateRange } from "@/context/DateRangeContext"
import { useCategorizeMeta } from "@/hooks/useCategorizeMeta"
import { useCategorizeQueue } from "@/hooks/useCategorizeQueue"
import {
  applyCategorization,
  suggestCategorizations,
  type PendingRow,
  type SuggestionPayload,
} from "@/lib/categorizeApi"
import { cn } from "@/lib/utils"

type CardState = {
  suggestion?: SuggestionPayload
  categoryId: string
  budgetId: string
  error?: string
}

function confidenceBadgeClass(confidence: number): string {
  if (confidence >= 0.8) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
  }
  if (confidence >= 0.5) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
  }
  return "bg-muted text-muted-foreground"
}

function selectClassName(): string {
  return "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-2 focus-visible:outline-hidden"
}

export function CategorizePage() {
  const { committedRange } = useDateRange()
  const { data: meta } = useCategorizeMeta()
  const {
    data: queueData,
    isPending,
    isError,
    refetch,
  } = useCategorizeQueue(committedRange.start, committedRange.end)

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [cardState, setCardState] = useState<Record<string, CardState>>({})
  const [suggesting, setSuggesting] = useState(false)
  const [suggestProgress, setSuggestProgress] = useState({ done: 0, total: 0 })
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const visibleRows = useMemo(() => {
    const rows = queueData?.data ?? []
    return rows.filter((row) => !dismissedIds.has(row.journal_id))
  }, [queueData?.data, dismissedIds])

  const openrouterConfigured = meta?.openrouter_configured ?? false

  async function handleSuggest() {
    if (!openrouterConfigured || visibleRows.length === 0) return
    setSuggesting(true)
    setSuggestProgress({ done: 0, total: visibleRows.length })
    try {
      const result = await suggestCategorizations({
        start: committedRange.start,
        end: committedRange.end,
        journal_ids: visibleRows.map((r) => r.journal_id),
      })
      const next: Record<string, CardState> = { ...cardState }
      for (const item of result.data) {
        const categories = meta?.categories ?? []
        const budgets = meta?.budgets ?? []
        const categoryId =
          item.suggestion != null
            ? (categories.find((c) => c.name === item.suggestion?.category)?.id ??
              "")
            : ""
        const budgetId =
          item.suggestion?.budget != null
            ? (budgets.find((b) => b.name === item.suggestion?.budget)?.id ?? "")
            : ""
        next[item.journal_id] = {
          suggestion: item.suggestion ?? undefined,
          categoryId,
          budgetId,
          error: item.error,
        }
      }
      setCardState(next)
      setSuggestProgress({ done: result.data.length, total: visibleRows.length })
    } finally {
      setSuggesting(false)
    }
  }

  async function handleApprove(row: PendingRow) {
    const state = cardState[row.journal_id]
    if (!state?.categoryId) return
    setApprovingId(row.journal_id)
    try {
      await applyCategorization(row.journal_id, {
        category_id: state.categoryId,
        transaction_journal_id: row.transaction_journal_id,
        budget_id: state.budgetId || null,
      })
      setDismissedIds((prev) => new Set(prev).add(row.journal_id))
    } finally {
      setApprovingId(null)
    }
  }

  function handleSkip(journalId: string) {
    setDismissedIds((prev) => new Set(prev).add(journalId))
  }

  function updateCategory(journalId: string, categoryId: string) {
    setCardState((prev) => ({
      ...prev,
      [journalId]: { ...prev[journalId], categoryId },
    }))
  }

  function updateBudget(journalId: string, budgetId: string) {
    setCardState((prev) => ({
      ...prev,
      [journalId]: { ...prev[journalId], budgetId },
    }))
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorize</h1>
          <p className="text-sm text-muted-foreground">
            {visibleRows.length} uncategorized transaction
            {visibleRows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {suggesting && suggestProgress.total > 0 ? (
            <span className="text-sm text-muted-foreground">
              {suggestProgress.done} of {suggestProgress.total}
            </span>
          ) : null}
          {openrouterConfigured ? (
            <Button
              type="button"
              disabled={suggesting || visibleRows.length === 0}
              onClick={() => {
                void handleSuggest()
              }}
            >
              {suggesting ? "Suggesting…" : "Suggest categories"}
            </Button>
          ) : null}
        </div>
      </div>

      {!openrouterConfigured && meta != null ? (
        <Card className="border-muted bg-muted/30">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <strong className="text-foreground">AI suggestions unavailable.</strong>{" "}
            Configure <code className="text-xs">OPENROUTER_API_KEY</code> on the
            server to enable Suggest.
          </CardContent>
        </Card>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium">Could not load queue.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void refetch()
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {isPending ? (
        <div className="space-y-6">
          {[0, 1].map((key) => (
            <Card key={key}>
              <CardHeader>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!isPending && !isError && visibleRows.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold">No uncategorized transactions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All withdrawals and deposits in this date range have categories. Try
            widening the date range.
          </p>
        </div>
      ) : null}

      {!isPending && !isError && visibleRows.length > 0 ? (
        <div className="space-y-6">
          {visibleRows.map((row) => {
            const state = cardState[row.journal_id]
            const categories = meta?.categories ?? []
            const budgets = meta?.budgets ?? []
            return (
              <Card key={row.journal_id}>
                <CardHeader className="space-y-1 pb-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{row.date}</span>
                    <span className="font-medium">{row.amount}</span>
                  </div>
                  <p className="truncate text-sm font-medium" title={row.description}>
                    {row.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.source_name} → {row.destination_name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state?.suggestion?.rationale ? (
                    <p className="text-sm text-muted-foreground">
                      {state.suggestion.rationale}
                    </p>
                  ) : null}
                  {state?.error ? (
                    <p className="text-sm text-destructive">
                      {state.error.includes("allowlist")
                        ? "Category not recognized. Pick from the dropdown."
                        : "Suggestion failed for this transaction."}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-end gap-4">
                    <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium">
                      Category
                      <select
                        className={selectClassName()}
                        value={state?.categoryId ?? ""}
                        onChange={(e) => {
                          updateCategory(row.journal_id, e.target.value)
                        }}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs font-medium">
                      Budget
                      <select
                        className={selectClassName()}
                        value={state?.budgetId ?? ""}
                        onChange={(e) => {
                          updateBudget(row.journal_id, e.target.value)
                        }}
                      >
                        <option value="">None</option>
                        {budgets.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {state?.suggestion != null ? (
                      <Badge
                        className={cn(
                          "shrink-0",
                          confidenceBadgeClass(state.suggestion.confidence),
                        )}
                      >
                        {Math.round(state.suggestion.confidence * 100)}%
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={!state?.categoryId || approvingId === row.journal_id}
                      onClick={() => {
                        void handleApprove(row)
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        handleSkip(row.journal_id)
                      }}
                    >
                      Skip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
