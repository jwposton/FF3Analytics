import { isSpendingWithdrawal } from "@/lib/spending"
import type { OmniRow } from "@/types/NormalizedTransaction"

export const PAGE_SIZE = 50

export type SortKey =
  | "date"
  | "amount"
  | "type"
  | "category"
  | "budget"
  | "source_account"
  | "destination_account"

export type SortDir = "asc" | "desc"

export type FilterState = {
  categories: string[]
  budget: string | null
  account: string | null
  search: string
}

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  budget: null,
  account: null,
  search: "",
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.categories.length > 0 ||
    filters.budget != null ||
    filters.account != null ||
    filters.search.trim() !== ""
  )
}

function distinctField(
  rows: OmniRow[],
  field: "category" | "budget" | "source_account",
): string[] {
  const values = new Set<string>()
  for (const row of rows) {
    const value = row[field]
    if (value != null && value !== "") {
      values.add(value)
    }
  }
  return [...values].sort((a, b) => a.localeCompare(b))
}

export function distinctCategories(rows: OmniRow[]): string[] {
  return distinctField(rows, "category")
}

export function distinctBudgets(rows: OmniRow[]): string[] {
  return distinctField(rows, "budget")
}

export function distinctSourceAccounts(rows: OmniRow[]): string[] {
  return distinctField(rows, "source_account")
}

export function applyFilters(
  rows: OmniRow[],
  filters: FilterState,
): OmniRow[] {
  let result = rows

  if (filters.categories.length > 0) {
    result = result.filter(
      (row) =>
        row.category != null && filters.categories.includes(row.category),
    )
  }

  if (filters.budget != null) {
    result = result.filter((row) => row.budget === filters.budget)
  }

  if (filters.account != null) {
    result = result.filter((row) => row.source_account === filters.account)
  }

  const search = filters.search.trim().toLowerCase()
  if (search !== "") {
    result = result.filter((row) => {
      const haystack = [
        row.category,
        row.budget,
        row.source_account,
        row.destination_account,
        row.amount,
        row.date,
      ]
        .filter((v) => v != null && v !== "")
        .map((v) => String(v).toLowerCase())
      return haystack.some((field) => field.includes(search))
    })
  }

  return result
}

export function applyDefaultTypeScope(
  rows: OmniRow[],
  showAllTypes: boolean,
): OmniRow[] {
  if (showAllTypes) return rows
  return rows.filter(
    (row) => isSpendingWithdrawal(row) && row.type !== "transfer",
  )
}

function compareValues(
  a: OmniRow,
  b: OmniRow,
  key: SortKey,
  dir: SortDir,
): number {
  const sign = dir === "asc" ? 1 : -1

  if (key === "amount") {
    const av = a.amount != null ? parseFloat(a.amount) : 0
    const bv = b.amount != null ? parseFloat(b.amount) : 0
    return (av - bv) * sign
  }

  if (key === "date") {
    const av = a.date ?? ""
    const bv = b.date ?? ""
    return av.localeCompare(bv) * sign
  }

  const av = String(a[key] ?? "")
  const bv = String(b[key] ?? "")
  return av.localeCompare(bv) * sign
}

export function sortRows(
  rows: OmniRow[],
  sortKey: SortKey,
  sortDir: SortDir,
): OmniRow[] {
  return [...rows].sort((a, b) => compareValues(a, b, sortKey, sortDir))
}

export function paginateRows(
  rows: OmniRow[],
  pageIndex: number,
  pageSize: number = PAGE_SIZE,
): { pageRows: OmniRow[]; totalPages: number } {
  if (rows.length === 0) {
    return { pageRows: [], totalPages: 0 }
  }
  const totalPages = Math.ceil(rows.length / pageSize)
  const safeIndex = Math.min(Math.max(0, pageIndex), totalPages - 1)
  const start = safeIndex * pageSize
  return {
    pageRows: rows.slice(start, start + pageSize),
    totalPages,
  }
}
