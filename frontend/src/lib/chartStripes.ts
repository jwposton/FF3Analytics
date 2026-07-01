/** Alternating band colors for ECharts category-axis splitArea. */
export const CHART_STRIPE_COLORS = [
  "hsla(240, 5%, 96%, 0.9)",
  "rgba(255, 255, 255, 0)",
] as const

export function categoryAxisRowStripes() {
  return {
    splitArea: {
      show: true,
      areaStyle: {
        color: [...CHART_STRIPE_COLORS],
      },
    },
  }
}

export function categoryAxisColumnStripes() {
  return categoryAxisRowStripes()
}
