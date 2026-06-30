import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  readBudgetLineShowTotal,
  STORAGE_KEY,
  writeBudgetLineShowTotal,
} from "@/lib/budgetLineShowTotal"

describe("budgetLineShowTotal", () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
      removeItem: (key: string) => {
        storage.delete(key)
      },
      clear: () => {
        storage.clear()
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("defaults to true when localStorage is empty", () => {
    expect(readBudgetLineShowTotal()).toBe(true)
  })

  it("persists false under ff3-budget-line-show-total", () => {
    writeBudgetLineShowTotal(false)
    expect(storage.get(STORAGE_KEY)).toBe("false")
    expect(readBudgetLineShowTotal()).toBe(false)
  })

  it("persists true under ff3-budget-line-show-total", () => {
    writeBudgetLineShowTotal(true)
    expect(storage.get(STORAGE_KEY)).toBe("true")
    expect(readBudgetLineShowTotal()).toBe(true)
  })

  it("falls back to true for invalid stored values", () => {
    storage.set(STORAGE_KEY, "invalid")
    expect(readBudgetLineShowTotal()).toBe(true)
  })
})
