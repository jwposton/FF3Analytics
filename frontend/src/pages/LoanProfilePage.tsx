import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLoan } from "@/hooks/useLoans"
import { saveLoanProfile, type LoanProfile } from "@/lib/loanApi"

function emptyProfile(): LoanProfile {
  return {
    version: 1,
    enabled: true,
    match: {
      description_contains: "",
      expected_amount: "0.00",
      amount_tolerance: "0.50",
      max_per_month: 1,
    },
    split: {
      escrow_amount: "0.00",
      components: [
        {
          role: "principal",
          type: "transfer",
          destination_account_id: "",
          destination_account: "",
        },
        {
          role: "interest",
          type: "withdrawal",
          destination_account_id: "",
          destination_account: "",
        },
      ],
    },
  }
}

export function LoanProfilePage() {
  const { accountId } = useParams<{ accountId: string }>()
  const navigate = useNavigate()
  const { data, isPending, isError } = useLoan(accountId)
  const [profile, setProfile] = useState<LoanProfile>(emptyProfile())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data?.profile) {
      setProfile(data.profile)
    } else if (data && accountId) {
      const next = emptyProfile()
      next.split.components[0].destination_account_id = accountId
      next.split.components[0].destination_account = data.name ?? ""
      setProfile(next)
    }
  }, [data, accountId])

  async function handleSave() {
    if (!accountId) return
    setSaving(true)
    setError(null)
    try {
      await saveLoanProfile(accountId, profile)
      navigate("/manage/loans")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (isPending) return <Skeleton className="h-64 w-full max-w-2xl" />
  if (isError || !data) {
    return <p className="text-destructive text-sm">Failed to load loan profile.</p>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-muted-foreground text-sm">Loan profile editor</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match fingerprint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1 text-sm">
            <span>Description contains</span>
            <input
              className="border-input w-full rounded-md border px-3 py-2"
              value={profile.match.description_contains}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  match: { ...profile.match, description_contains: e.target.value },
                })
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Expected amount</span>
            <input
              className="border-input w-full rounded-md border px-3 py-2"
              value={profile.match.expected_amount}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  match: { ...profile.match, expected_amount: e.target.value },
                })
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Amount tolerance</span>
            <input
              className="border-input w-full rounded-md border px-3 py-2"
              value={profile.match.amount_tolerance ?? "0.50"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  match: { ...profile.match, amount_tolerance: e.target.value },
                })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.enabled}
              onChange={(e) =>
                setProfile({ ...profile, enabled: e.target.checked })
              }
            />
            Enabled
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Split destinations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1 text-sm">
            <span>Escrow amount</span>
            <input
              className="border-input w-full rounded-md border px-3 py-2"
              value={profile.split.escrow_amount}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  split: { ...profile.split, escrow_amount: e.target.value },
                })
              }
            />
          </label>
          {profile.split.components.map((comp, idx) => (
            <div key={comp.role} className="space-y-1 text-sm">
              <span className="font-medium capitalize">{comp.role}</span>
              <input
                className="border-input w-full rounded-md border px-3 py-2"
                placeholder="Destination account name"
                value={comp.destination_account}
                onChange={(e) => {
                  const components = [...profile.split.components]
                  components[idx] = {
                    ...components[idx],
                    destination_account: e.target.value,
                  }
                  setProfile({
                    ...profile,
                    split: { ...profile.split, components },
                  })
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {data.interest != null && (
        <p className="text-muted-foreground text-xs">
          Firefly interest rate: {data.interest}%
        </p>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          Save profile
        </Button>
        <Button asChild variant="outline">
          <Link to="/manage/loans">Cancel</Link>
        </Button>
      </div>
    </div>
  )
}
