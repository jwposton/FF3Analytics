import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { STORAGE_KEY } from "@/lib/dateRange"

import { DateRangeProvider, useDateRange } from "./DateRangeContext"

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <DateRangeProvider>{children}</DateRangeProvider>
    </MemoryRouter>
  )
}

describe("DateRangeContext", () => {
  it("setDraftRange does not change committedRange until applyRange", () => {
    localStorage.removeItem(STORAGE_KEY)

    const { result } = renderHook(() => useDateRange(), { wrapper })

    const committedBefore = { ...result.current.committedRange }

    act(() => {
      result.current.setDraftRange("2024-01-01", "2024-01-31")
    })

    expect(result.current.draftRange).toEqual({
      start: "2024-01-01",
      end: "2024-01-31",
    })
    expect(result.current.committedRange).toEqual(committedBefore)

    act(() => {
      result.current.applyRange("2024-01-01", "2024-01-31")
    })

    expect(result.current.committedRange).toEqual({
      start: "2024-01-01",
      end: "2024-01-31",
    })
    expect(result.current.draftRange).toEqual(result.current.committedRange)
  })
})
