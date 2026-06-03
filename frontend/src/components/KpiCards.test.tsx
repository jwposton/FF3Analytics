import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { spendingRowsForTotal } from "@/test/fixtures/omniRows"

import { KpiCards } from "./KpiCards"

describe("KpiCards", () => {
  it("shows skeleton placeholders while loading", () => {
    render(<KpiCards rows={[]} isLoading isError={false} onRetry={() => {}} />)
    expect(screen.queryByText("Total spending")).toBeNull()
    expect(screen.queryByText("Unable to load transactions")).toBeNull()
  })

  it("shows error banner and Retry when isError", () => {
    const onRetry = vi.fn()
    render(
      <KpiCards rows={[]} isLoading={false} isError onRetry={onRetry} />,
    )
    expect(screen.getByText("Unable to load transactions")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("renders total and top category on success", () => {
    render(
      <KpiCards
        rows={spendingRowsForTotal}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText("Total spending")).toBeTruthy()
    expect(screen.getByText("75.50")).toBeTruthy()
    expect(screen.getByText("Food")).toBeTruthy()
    expect(screen.getByText("Top category")).toBeTruthy()
  })
})
