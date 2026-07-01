import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { readMomTopN, writeMomTopN } from "@/lib/momTopN"

describe("momTopN:", () => {
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

  it('readMomTopN("spending") defaults to 15 when empty', () => {
    expect(readMomTopN("spending")).toBe(15)
  })

  it('writeMomTopN("cash-flow", 30) clamps to 25 on read', () => {
    writeMomTopN("cash-flow", 30)
    expect(readMomTopN("cash-flow")).toBe(25)
  })

  it('writeMomTopN("spending", 5) clamps to 10 on read', () => {
    writeMomTopN("spending", 5)
    expect(readMomTopN("spending")).toBe(10)
  })

  it("uses separate storage keys per family", () => {
    writeMomTopN("spending", 12)
    writeMomTopN("cash-flow", 20)
    expect(readMomTopN("spending")).toBe(12)
    expect(readMomTopN("cash-flow")).toBe(20)
  })

  it("uses ff3-spending-mom-top-n and ff3-cash-flow-mom-top-n keys", () => {
    writeMomTopN("spending", 14)
    writeMomTopN("cash-flow", 16)
    expect(storage.get("ff3-spending-mom-top-n")).toBe("14")
    expect(storage.get("ff3-cash-flow-mom-top-n")).toBe("16")
  })
})
