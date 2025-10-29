"use client"

import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { EmpresaFilters } from "@/components/analista/empresa-filters"
import { EmpresaMetrics } from "@/components/analista/empresa-metrics"
import { EmpresaPriceChart } from "@/components/analista/empresa-price-chart"
import { EmpresaTransactionsTable } from "@/components/analista/empresa-transactions-table"

export default function EmpresaPage() {
  const { companies, transactions, users, positions, priceHistory, markets } = useData()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [selectedMarketId, setSelectedMarketId] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [dateError, setDateError] = useState<string>("")

  // Filter companies by market
  const filteredCompanies = useMemo(() => {
    if (selectedMarketId === "all") return companies.filter((c) => c.isActive)
    return companies.filter((c) => c.isActive && c.marketId === selectedMarketId)
  }, [companies, selectedMarketId])

  // Get selected company
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)

  // Filter transactions by company and date range
  const filteredTransactions = useMemo(() => {
    if (!selectedCompanyId) return []

    let filtered = transactions.filter((t) => t.companyId === selectedCompanyId)

    // Validate and apply date filters
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      // Validate date range
      if (start && end && start > end) {
        setDateError("rango de fechas inválido")
        return []
      } else {
        setDateError("")
      }

      filtered = filtered.filter((t) => {
        const txDate = new Date(t.createdAt)
        if (start && txDate < start) return false
        if (end && txDate > end) return false
        return true
      })
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [transactions, selectedCompanyId, startDate, endDate])

  // Get major holder
  const majorHolder = useMemo(() => {
    if (!selectedCompanyId) return { alias: "administracion", shares: 0 }

    const companyPositions = positions.filter((p) => p.companyId === selectedCompanyId)
    if (companyPositions.length === 0) return { alias: "administracion", shares: 0 }

    const maxPosition = companyPositions.reduce((max, p) => (p.shares > max.shares ? p : max), companyPositions[0])
    const user = users.find((u) => u.id === maxPosition.userId)

    return {
      alias: user?.alias || "desconocido",
      shares: maxPosition.shares,
    }
  }, [positions, users, selectedCompanyId])

  // Get treasury inventory
  const treasuryInventory = useMemo(() => {
    if (!selectedCompany) return 0
    const totalHeld = positions.filter((p) => p.companyId === selectedCompanyId).reduce((sum, p) => sum + p.shares, 0)
    return selectedCompany.totalShares - totalHeld
  }, [selectedCompany, positions, selectedCompanyId])

  // Get price history for chart
  const chartData = useMemo(() => {
    if (!selectedCompanyId) return []
    return priceHistory
      .filter((p) => p.companyId === selectedCompanyId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((p) => ({
        date: p.timestamp.toISOString(),
        price: p.price,
      }))
  }, [priceHistory, selectedCompanyId])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reportes por Empresa</h1>
        <p className="text-muted-foreground">Estudiar actividad y tenencia por empresa</p>
      </div>

      <EmpresaFilters
        markets={markets}
        companies={filteredCompanies}
        selectedMarketId={selectedMarketId}
        selectedCompanyId={selectedCompanyId}
        startDate={startDate}
        endDate={endDate}
        dateError={dateError}
        onMarketChange={setSelectedMarketId}
        onCompanyChange={setSelectedCompanyId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {selectedCompany && (
        <>
          <EmpresaMetrics
            majorHolder={majorHolder}
            treasuryInventory={treasuryInventory}
            currentPrice={selectedCompany.currentPrice}
          />

          <EmpresaPriceChart data={chartData} />

          <EmpresaTransactionsTable
            transactions={filteredTransactions}
            users={users}
            selectedCompanyId={selectedCompanyId}
          />
        </>
      )}
    </div>
  )
}
