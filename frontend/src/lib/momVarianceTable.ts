import type { BarChartData } from "@/lib/barChart"
import type {
  MomCompareMode,
  RollingAverageMethod,
  RollingWindowMonths,
} from "@/lib/momComparePrefs"
import {
  aggregateOtherBaselines,
  compareDelta,
  comparePairTableMonths,
  currentVsRollingBaseline,
} from "@/lib/momVariance"

const OTHER_LABEL = "Other"
const DELTA_COLUMN_KEY = "__delta__"
const BASELINE_COLUMN_KEY = "__baseline__"

export type MomVarianceTableColumnKind = "amount" | "delta"

export type MomVarianceTableColumn = {
  key: string
  label: string
  kind: MomVarianceTableColumnKind
}

export type MomVarianceTableRow = {
  name: string
  values: Record<string, number>
}

export type MomVarianceTableData = {
  rowLabel: string
  columns: MomVarianceTableColumn[]
  rows: MomVarianceTableRow[]
}

export function aggregatedStackAmount(
  chartData: BarChartData,
  stackName: string,
  month: string,
  topNames: string[],
): number {
  const topSet = new Set(topNames.filter((name) => name !== OTHER_LABEL))
  if (stackName === OTHER_LABEL) {
    let sum = 0
    for (const stack of chartData.stacks) {
      if (!topSet.has(stack)) {
        sum += chartData.data[month]?.[stack] ?? 0
      }
    }
    return sum
  }
  return chartData.data[month]?.[stackName] ?? 0
}

function monthColumns(months: string[]): MomVarianceTableColumn[] {
  return months.map((month) => ({
    key: month,
    label: month,
    kind: "amount",
  }))
}

function buildAmountRows(
  chartData: BarChartData,
  sortedNames: string[],
  months: string[],
): MomVarianceTableRow[] {
  return sortedNames.map((name) => {
    const values: Record<string, number> = {}
    for (const month of months) {
      values[month] = aggregatedStackAmount(chartData, name, month, sortedNames)
    }
    return { name, values }
  })
}

export function buildCompareAmountTableData(
  chartData: BarChartData,
  sortedNames: string[],
  compareMode: MomCompareMode,
  options: {
    monthA: string
    monthB: string
    currentMonth: string
    rollingWindow: RollingWindowMonths
    rollingAverageMethod: RollingAverageMethod
    rowLabel?: string
  },
): MomVarianceTableData | null {
  if (sortedNames.length === 0 || chartData.months.length === 0) {
    return null
  }

  const months =
    compareMode === "month-pair"
      ? comparePairTableMonths(options.monthA, options.monthB)
      : chartData.months
  if (months.length === 0) {
    return null
  }
  const rows = buildAmountRows(chartData, sortedNames, months)

  if (compareMode === "vs-average") {
    const pairs = currentVsRollingBaseline(
      chartData,
      options.currentMonth,
      options.rollingWindow,
      options.rollingAverageMethod,
    )
    if (pairs == null) {
      return null
    }

    const aggregated = aggregateOtherBaselines(pairs, sortedNames)
    const methodLabel =
      options.rollingAverageMethod === "median" ? "median" : "avg"
    const summaryColumn: MomVarianceTableColumn = {
      key: BASELINE_COLUMN_KEY,
      label: `${options.rollingWindow}mo ${methodLabel}`,
      kind: "amount",
    }

    for (const row of rows) {
      row.values[BASELINE_COLUMN_KEY] =
        aggregated.get(row.name)?.baseline ?? 0
    }

    return {
      rowLabel: options.rowLabel ?? "Budget",
      columns: [...monthColumns(months), summaryColumn],
      rows,
    }
  }

  const deltas = compareDelta(chartData, options.monthA, options.monthB)
  const topSet = new Set(sortedNames.filter((name) => name !== OTHER_LABEL))
  let otherDelta = 0
  let hasOther = false
  for (const [stack, delta] of deltas) {
    if (!topSet.has(stack)) {
      otherDelta += delta
      hasOther = true
    }
  }

  const deltaColumn: MomVarianceTableColumn = {
    key: DELTA_COLUMN_KEY,
    label: "Δ",
    kind: "delta",
  }

  for (const row of rows) {
    if (row.name === OTHER_LABEL) {
      row.values[DELTA_COLUMN_KEY] = hasOther ? otherDelta : 0
    } else {
      row.values[DELTA_COLUMN_KEY] = deltas.get(row.name) ?? 0
    }
  }

  return {
    rowLabel: options.rowLabel ?? "Budget",
    columns: [...monthColumns(months), deltaColumn],
    rows,
  }
}

export function buildTrendDeltaTableData(
  deltaMonths: string[],
  series: { name: string; data: number[] }[],
  rowLabel = "Budget",
): MomVarianceTableData | null {
  if (deltaMonths.length === 0 || series.length === 0) {
    return null
  }

  const columns: MomVarianceTableColumn[] = deltaMonths.map((month) => ({
    key: month,
    label: month,
    kind: "delta",
  }))

  const rows: MomVarianceTableRow[] = series.map((entry) => {
    const values: Record<string, number> = {}
    deltaMonths.forEach((month, index) => {
      values[month] = entry.data[index] ?? 0
    })
    return { name: entry.name, values }
  })

  return {
    rowLabel,
    columns,
    rows,
  }
}
