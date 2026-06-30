import { describe, expect, it } from "vitest"

import { isBankAccount, isCreditCard } from "@/lib/accounts"

describe("accounts:", () => {
  it("classifies Credit card role as credit card, not bank", () => {
    expect(isCreditCard("Asset account", "Credit card")).toBe(true)
    expect(isBankAccount("Asset account", "Credit card")).toBe(false)
  })

  it("classifies Asset account with null role as bank", () => {
    expect(isBankAccount("Asset account", null)).toBe(true)
    expect(isCreditCard("Asset account", null)).toBe(false)
  })
})
