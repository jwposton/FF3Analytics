import { Button } from "@/components/ui/button"
import type { TrendViewMode } from "@/lib/trendsViewMode"

type TrendsControlsProps = {
  viewMode: TrendViewMode
  topN: number
  onViewModeChange: (mode: TrendViewMode) => void
  onTopNChange: (n: number) => void
  disabled?: boolean
}

export function TrendsControls({
  viewMode,
  topN,
  onViewModeChange,
  onTopNChange,
  disabled = false,
}: TrendsControlsProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 ${disabled ? "opacity-50" : ""}`}
    >
      <div
        className="inline-flex rounded-md border shadow-xs"
        role="group"
        aria-label="Chart view mode"
      >
        <Button
          type="button"
          variant={viewMode === "total" ? "default" : "outline"}
          size="sm"
          className="rounded-r-none border-0"
          disabled={disabled}
          onClick={() => onViewModeChange("total")}
        >
          Total
        </Button>
        <Button
          type="button"
          variant={viewMode === "category" ? "default" : "outline"}
          size="sm"
          className="rounded-l-none border-0 border-l"
          disabled={disabled}
          onClick={() => onViewModeChange("category")}
        >
          By category
        </Button>
      </div>

      {viewMode === "category" ? (
        <label className="flex min-w-[12rem] flex-1 items-center gap-3 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Top categories: {topN}</span>
          <input
            type="range"
            min={3}
            max={15}
            value={topN}
            disabled={disabled}
            aria-label="Number of top categories to show"
            className="h-2 w-full min-w-[8rem] cursor-pointer accent-primary disabled:cursor-not-allowed"
            onChange={(e) => onTopNChange(Number(e.target.value))}
          />
        </label>
      ) : null}
    </div>
  )
}
