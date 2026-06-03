import { createBrowserRouter } from "react-router-dom"

import { AppShell } from "@/layouts/AppShell"
import { DashboardPage } from "@/pages/DashboardPage"
import { ReportStubPage } from "@/pages/ReportStubPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "reports/transactions",
        element: (
          <ReportStubPage
            reportName="Transaction Explorer"
            deliveryPhase={4}
          />
        ),
      },
      {
        path: "reports/trends",
        element: (
          <ReportStubPage reportName="Spending Trends" deliveryPhase={5} />
        ),
      },
      {
        path: "reports/bar",
        element: (
          <ReportStubPage reportName="Bar & Drilldown" deliveryPhase={6} />
        ),
      },
      {
        path: "reports/sankey",
        element: (
          <ReportStubPage reportName="Sankey Flows" deliveryPhase={7} />
        ),
      },
    ],
  },
])
