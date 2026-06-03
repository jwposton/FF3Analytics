type ReportStubPageProps = {
  reportName: string
  deliveryPhase: 4 | 5 | 6 | 7
}

const stubMessages: Record<ReportStubPageProps["deliveryPhase"], string> = {
  4: "Coming soon — Transaction Explorer arrives in Phase 4.",
  5: "Coming soon — Spending Trends arrives in Phase 5.",
  6: "Coming soon — Bar & Drilldown arrives in Phase 6.",
  7: "Coming soon — Sankey Flows arrives in Phase 7.",
}

export function ReportStubPage({
  reportName,
  deliveryPhase,
}: ReportStubPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{reportName}</h1>
      <p className="max-w-prose text-muted-foreground">
        {stubMessages[deliveryPhase]}
      </p>
    </div>
  )
}
