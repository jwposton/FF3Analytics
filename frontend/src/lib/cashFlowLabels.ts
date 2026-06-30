import type { OmniRow } from "@/types/NormalizedTransaction"

import {
  isBankAccount,
  isCreditCard,
  isSpendingBankAccount,
  normalizeAccountType,
} from "@/lib/accounts"

const UNCategorized_LABEL = "Uncategorized"

/** Display label for bank → credit card payment flows (matches FireflyReports reference). */
export const CC_PAYMENT_BUDGET_LABEL = "CC Payment"

const SERVER_CC_PAYMENT_BUDGET = "Credit Card Payment"

/** Bank → credit card payment (role present or asset destination that is not checking/savings). */
export function isCreditCardPaymentFlow(row: OmniRow): boolean {
  if (row.budget === SERVER_CC_PAYMENT_BUDGET) return true

  if (row.type !== "transfer") return false
  if (!isBankAccount(row.source_type, row.source_role)) return false

  if (isCreditCard(row.destination_type, row.destination_role)) return true

  return (
    normalizeAccountType(row.destination_type) === "Asset account" &&
    !isSpendingBankAccount(row.destination_type, row.destination_role)
  )
}

/** @deprecated Use isCreditCardPaymentFlow */
export function isBankToCreditCardTransfer(row: OmniRow): boolean {
  return isCreditCardPaymentFlow(row)
}

export function cashFlowBudgetLabel(row: OmniRow): string {
  if (isCreditCardPaymentFlow(row)) return CC_PAYMENT_BUDGET_LABEL

  const destVal = (row.destination_account ?? "").trim()
  const budget = row.budget
  if (budget != null && budget !== "") {
    if (budget === SERVER_CC_PAYMENT_BUDGET) return CC_PAYMENT_BUDGET_LABEL
    return budget
  }
  return destVal || UNCategorized_LABEL
}

export function cashFlowCategoryLabel(row: OmniRow): string {
  if (isCreditCardPaymentFlow(row)) {
    return (row.destination_account ?? "").trim() || UNCategorized_LABEL
  }

  const destVal = (row.destination_account ?? "").trim()
  const category = row.category
  if (category != null && category !== "") return category
  return destVal || UNCategorized_LABEL
}
