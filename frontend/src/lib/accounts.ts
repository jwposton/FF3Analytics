export function isBankAccount(
  type: string | null,
  role: string | null,
): boolean {
  return type === "Asset account" && role !== "Credit card"
}

export function isCreditCard(
  type: string | null,
  role: string | null,
): boolean {
  return type === "Asset account" && role === "Credit card"
}
