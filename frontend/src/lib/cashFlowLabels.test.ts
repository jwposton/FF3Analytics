import { describe, expect, it } from "vitest"

import { CC_PAYMENT_BUDGET_LABEL, cashFlowBudgetLabel, cashFlowCategoryLabel } from "@/lib/cashFlowLabels"
import {
  creditCardPaymentTransfer,
  creditCardPaymentTransferMissingRole,
  creditCardPaymentTransferNoBudget,
  mainCheckingWithdrawal,
} from "@/test/fixtures/omniRows"

describe("cashFlowBudgetLabel", () => {
  it("maps server Credit Card Payment budget to CC Payment display label", () => {
    expect(cashFlowBudgetLabel(creditCardPaymentTransfer)).toBe(
      CC_PAYMENT_BUDGET_LABEL,
    )
  })

  it("falls back to CC Payment when CC transfer has null budget", () => {
    expect(cashFlowBudgetLabel(creditCardPaymentTransferNoBudget)).toBe(
      CC_PAYMENT_BUDGET_LABEL,
    )
  })

  it("groups bank→CC transfers under CC Payment when destination role is missing", () => {
    expect(cashFlowBudgetLabel(creditCardPaymentTransferMissingRole)).toBe(
      CC_PAYMENT_BUDGET_LABEL,
    )
  })

  it("uses payee/destination when bank withdrawal has null budget", () => {
    const row = { ...mainCheckingWithdrawal, budget: null }
    expect(cashFlowBudgetLabel(row)).toBe("Grocery Store")
  })
})

describe("cashFlowCategoryLabel", () => {
  it("uses credit card account name for bank→CC transfers", () => {
    expect(cashFlowCategoryLabel(creditCardPaymentTransfer)).toBe("Chase VISA")
    expect(cashFlowCategoryLabel(creditCardPaymentTransferNoBudget)).toBe(
      "Chase VISA",
    )
    expect(cashFlowCategoryLabel(creditCardPaymentTransferMissingRole)).toBe(
      "Amazon Prime Rewards Visa Signature",
    )
  })
})
