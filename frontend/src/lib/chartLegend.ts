/** Dedicated right column for vertical legend — plot area ends before this. */
export const LEGEND_COLUMN_WIDTH = 96

/** Max visible characters in legend labels (matches column width at 11px). */
export const LEGEND_LABEL_MAX = 14

export function truncateLegendLabel(
  label: string,
  maxLen = LEGEND_LABEL_MAX,
): string {
  if (label.length <= maxLen) return label
  return `${label.slice(0, maxLen - 1)}…`
}

export function verticalLegendGridRight(_labels?: readonly string[]): number {
  return LEGEND_COLUMN_WIDTH
}

export function verticalRightLegend(labels: readonly string[]) {
  return {
    type: "scroll" as const,
    orient: "vertical" as const,
    right: 4,
    top: "middle" as const,
    width: LEGEND_COLUMN_WIDTH,
    itemWidth: 12,
    itemHeight: 10,
    itemGap: 6,
    textStyle: { fontSize: 11 },
    data: [...labels],
    formatter: (name: string) => truncateLegendLabel(name),
  }
}

/** Tighter plot insets so bars/lines leave room for the legend column on the right. */
export function chartGridWithVerticalLegend(labels: readonly string[]) {
  return {
    left: 36,
    right: verticalLegendGridRight(labels),
    bottom: 32,
    top: 16,
    containLabel: false,
  }
}
