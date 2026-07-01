import { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import type { EChartsOption } from "echarts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { compareChartHeight } from "@/components/MomCompareChart"
import type { CurrentVsBaseline } from "@/lib/momVariance"
import { formatCurrency } from "@/lib/spending"

const CURRENT_COLOR = "#60A5FA"
const AVERAGE_COLOR = "#94A3B8"

type BudgetCurrentVsAverageChartProps = {
  sortedNames: string[]
  values: Map<string, CurrentVsBaseline>
  loading: boolean
  emptyMessage: string
  chartTitle?: string
  currentSeriesLabel?: string
  averageSeriesLabel?: string
  yAxisName?: string
}

function tooltipValue(value: unknown): number {
  if (typeof value === "number") return value
  if (Array.isArray(value)) {
    const last = value[value.length - 1]
    return typeof last === "number" ? last : Number(last)
  }
  return Number(value)
}

function itemTooltipFormatter(params: unknown): string {
  const item = Array.isArray(params) ? params[0] : params
  if (!item || typeof item !== "object") return ""
  const record = item as {
    seriesName?: string
    name?: string
    value?: unknown
  }
  return `${record.name ?? ""}\n${record.seriesName}: ${formatCurrency(tooltipValue(record.value))}`
}

export function BudgetCurrentVsAverageChart({
  sortedNames,
  values,
  loading,
  emptyMessage,
  chartTitle = "Current month vs 12-month average",
  currentSeriesLabel = "Current month",
  averageSeriesLabel = "12-mo average",
  yAxisName = "Spending",
}: BudgetCurrentVsAverageChartProps) {
  const isEmpty = !loading && sortedNames.length === 0
  const chartHeight = compareChartHeight(sortedNames.length)

  const option = useMemo((): EChartsOption => {
    return {
      tooltip: {
        trigger: "item",
        formatter: itemTooltipFormatter,
      },
      legend: {
        top: 0,
        data: [currentSeriesLabel, averageSeriesLabel],
      },
      grid: { left: 110, right: 40, top: 36, bottom: 30 },
      xAxis: {
        type: "value",
        name: yAxisName,
        min: 0,
        axisLabel: {
          formatter: (value: number) => formatCurrency(value),
        },
        splitLine: {
          lineStyle: { type: "dashed", color: "hsl(240 5% 90%)" },
        },
      },
      yAxis: {
        type: "category",
        data: sortedNames,
        inverse: true,
      },
      series: [
        {
          name: currentSeriesLabel,
          type: "bar",
          data: sortedNames.map((name) => values.get(name)?.current ?? 0),
          itemStyle: { color: CURRENT_COLOR },
          label: {
            show: true,
            position: "right",
            fontSize: 10,
            formatter: (params: { value?: unknown }) =>
              formatCurrency(tooltipValue(params.value)),
          },
        },
        {
          name: averageSeriesLabel,
          type: "bar",
          data: sortedNames.map((name) => values.get(name)?.baseline ?? 0),
          itemStyle: { color: AVERAGE_COLOR },
          label: {
            show: true,
            position: "right",
            fontSize: 10,
            formatter: (params: { value?: unknown }) =>
              formatCurrency(tooltipValue(params.value)),
          },
        },
      ],
    }
  }, [
    sortedNames,
    values,
    currentSeriesLabel,
    averageSeriesLabel,
    yAxisName,
  ])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
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
          <div
            className="flex items-center justify-center text-center text-sm text-muted-foreground"
            style={{ minHeight: 480 }}
          >
            {emptyMessage}
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: chartHeight, width: "100%" }}
            notMerge
            lazyUpdate
            data-testid="budget-current-vs-average-chart"
          />
        )}
      </CardContent>
    </Card>
  )
}
