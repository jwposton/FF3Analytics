import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { MomVarianceDataTable } from "./MomVarianceDataTable"

const sampleTable = {
  rowLabel: "Budget",
  columns: [
    { key: "2024-01", label: "2024-01", kind: "amount" as const },
    { key: "2024-02", label: "2024-02", kind: "amount" as const },
    { key: "__delta__", label: "Δ", kind: "delta" as const },
  ],
  rows: [
    {
      name: "Groceries",
      values: {
        "2024-01": 100,
        "2024-02": 150,
        __delta__: 50,
      },
    },
  ],
}

describe("MomVarianceDataTable", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders amount and signed delta cells", () => {
    render(<MomVarianceDataTable tableData={sampleTable} />)

    expect(screen.getByText("Monthly detail")).toBeTruthy()
    expect(screen.getByText("Groceries")).toBeTruthy()
    expect(screen.getByText("100.00")).toBeTruthy()
    expect(screen.getByText("150.00")).toBeTruthy()
    expect(screen.getByText("+50.00")).toBeTruthy()
  })

  it("applies heatmap backgrounds on all-delta trend tables", () => {
    const trendTable = {
      rowLabel: "Budget",
      columns: [
        { key: "2024-02", label: "2024-02", kind: "delta" as const },
        { key: "2024-03", label: "2024-03", kind: "delta" as const },
      ],
      rows: [
        {
          name: "Groceries",
          values: { "2024-02": 50, "2024-03": -25 },
        },
      ],
    }

    render(<MomVarianceDataTable tableData={trendTable} title="MoM change" />)

    const positiveCell = screen.getByText("+50.00")
    const negativeCell = screen.getByText("-25.00")

    expect(positiveCell.style.backgroundColor).toContain("239, 68, 68")
    expect(negativeCell.style.backgroundColor).toContain("34, 197, 94")
    expect(positiveCell.className).toContain("text-red")
    expect(negativeCell.className).toContain("text-green")
  })

  it("calls onRowSelect when a row is clicked", () => {
    const onRowSelect = vi.fn()
    render(
      <MomVarianceDataTable tableData={sampleTable} onRowSelect={onRowSelect} />,
    )

    fireEvent.click(screen.getByText("Groceries"))

    expect(onRowSelect).toHaveBeenCalledWith("Groceries")
  })

  it("renders empty state when table data is null", () => {
    render(
      <MomVarianceDataTable
        tableData={null}
        emptyMessage="Nothing to show"
      />,
    )

    expect(screen.getByTestId("mom-variance-table-empty")).toBeTruthy()
    expect(screen.getByText("Nothing to show")).toBeTruthy()
  })
})
