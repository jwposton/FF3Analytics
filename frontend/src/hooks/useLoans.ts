import { useQuery } from "@tanstack/react-query"

import { fetchLoan, fetchLoans } from "@/lib/loanApi"

export function useLoans() {
  return useQuery({
    queryKey: ["loans"],
    queryFn: fetchLoans,
    staleTime: 1000 * 60 * 2,
  })
}

export function useLoan(accountId: string | undefined) {
  return useQuery({
    queryKey: ["loan", accountId],
    queryFn: () => fetchLoan(accountId!),
    enabled: Boolean(accountId),
    staleTime: 1000 * 60 * 2,
  })
}
