import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useNormalizedTransactions } from "./useNormalizedTransactions"

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useNormalizedTransactions", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("does not fetch when start is empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")

    renderHook(() => useNormalizedTransactions("", "2024-06-01"), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  it("fetches with start and end query params", async () => {
    const payload = {
      data: [{ date: "2024-01-15", amount: "10.00", type: "withdrawal" }],
      firefly_base_url: "http://firefly.local",
      meta: { count: 1, start: "2024-01-01", end: "2024-01-31" },
    }
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 }),
    )

    const { result } = renderHook(
      () => useNormalizedTransactions("2024-01-01", "2024-01-31"),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/normalized_transactions?start=2024-01-01&end=2024-01-31",
    )
    expect(result.current.data?.data).toHaveLength(1)
  })
})
