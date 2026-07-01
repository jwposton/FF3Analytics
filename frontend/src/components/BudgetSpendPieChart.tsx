import { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CHART_COLORS } from "@/lib/chartColors"
import { formatCurrency } from "@/lib/spending"

export type BudgetSpendSlice = {
  name: string
  value: number
}

/** Segments below this share hide exterior labels (tooltip still shows detail). */
export const PIE_LABEL_MIN_PERCENT = 5

type BudgetSpendPieChartProps = {
  slices: BudgetSpendSlice[]
  loading: boolean
  emptyMessage: string
  chartTitle?: string
}

const CHART_HEIGHT = 480
const CHART_OPTS = { renderer: "canvas" as const }

function tooltipFormatter(params: unknown): string {
  const item = Array.isArray(params) ? params[0] : params
  if (!item || typeof item !== "object") return ""
  const record = item as {
    name?: string
    value?: unknown
    percent?: number
  }
  const value =
    typeof record.value === "number" ? record.value : Number(record.value)
  const pct =
    typeof record.percent === "number" ? record.percent.toFixed(1) : "0.0"
  return `${record.name ?? ""}\n${formatCurrency(value)} (${pct}%)`
}

export function pieSegmentLabel(
  name: string,
  percent: number,
  minPercent = PIE_LABEL_MIN_PERCENT,
): string {
  if (percent < minPercent) return ""
  const shortName = name.length > 18 ? `${name.slice(0, 16)}…` : name
  return `${shortName}\n${percent.toFixed(1)}%`
}

export function BudgetSpendPieChart({
  slices,
  loading,
  emptyMessage,
  chartTitle = "Spending by budget",
}: BudgetSpendPieChartProps) {
  const isEmpty = !loading && slices.length === 0

  const option = useMemo((): EChartsOption => {
    return {
      tooltip: {
        trigger: "item",
        formatter: tooltipFormatter,
      },
      series: [
        {
          type: "pie",
          radius: "74%",
          center: ["50%", "52%"],
          minAngle: 2,
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: "hsl(var(--background))",
            borderWidth: 1,
          },
          label: {
            show: true,
            fontSize: 11,
            color: "hsl(240 5% 34%)",
            lineHeight: 14,
            formatter: (params: { name?: string; percent?: number }) =>
              pieSegmentLabel(
                params.name ?? "",
                params.percent ?? 0,
              ),
          },
          labelLine: {
            length: 12,
            length2: 10,
            smooth: true,
            lineStyle: { color: "hsl(240 5% 65%)" },
          },
          labelLayout: {
            hideOverlap: true,
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            itemStyle: {
              shadowBlur: 8,
              shadowColor: "rgba(0, 0, 0, 0.12)",
            },
          },
          data: slices.map((slice, idx) => ({
            name: slice.name,
            value: slice.value,
            itemStyle: { color: CHART_COLORS[idx % CHART_COLORS.length] },
          })),
        },
      ],
    }
  }, [slices])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[480px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[480px] items-center justify-center text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ReactECharts
            option={option}
            opts={CHART_OPTS}
            style={{ height: CHART_HEIGHT, width: "100%" }}
            notMerge
            lazyUpdate
            data-testid="budget-spend-pie-chart"
          />
        )}
      </CardContent>
    </Card>
  )
}
