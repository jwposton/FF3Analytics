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

type BudgetSpendPieChartProps = {
  slices: BudgetSpendSlice[]
  loading: boolean
  emptyMessage: string
  chartTitle?: string
}

function tooltipFormatter(params: unknown): string {
  const item = Array.isArray(params) ? params[0] : params
  if (!item || typeof item !== "object") return ""
  const record = item as {
    name?: string
    value?: unknown
    percent?: number
  }
  const value = typeof record.value === "number" ? record.value : Number(record.value)
  const pct =
    typeof record.percent === "number"
      ? record.percent.toFixed(1)
      : "0.0"
  return `${record.name ?? ""}\n${formatCurrency(value)} (${pct}%)`
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
      legend: {
        type: "scroll",
        orient: "vertical",
        right: 8,
        top: "middle",
        textStyle: { fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["42%", "68%"],
          center: ["38%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: "hsl(var(--background))",
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              formatter: (params: { name?: string; percent?: number }) =>
                `${params.name ?? ""}\n${(params.percent ?? 0).toFixed(1)}%`,
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
          <Skeleton className="h-[320px] w-full" />
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
          <div className="flex h-[320px] items-center justify-center text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: 320, width: "100%" }}
            notMerge
            lazyUpdate
            data-testid="budget-spend-pie-chart"
          />
        )}
      </CardContent>
    </Card>
  )
}
