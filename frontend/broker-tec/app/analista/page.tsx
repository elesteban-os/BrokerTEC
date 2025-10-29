"use client"

import { useData } from "@/lib/data-context"
import { StatsCards } from "@/components/analista/stats-cards"

export default function AnalistaDashboardPage() {
  const { companies, transactions, users } = useData()

  const totalCompanies = companies.filter((c) => c.isActive).length
  const totalTransactions = transactions.length
  const totalTraders = users.filter((u) => u.role === "trader" && u.status === "active").length

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel del Analista</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <StatsCards totalCompanies={totalCompanies} totalTransactions={totalTransactions} totalTraders={totalTraders} />
    </div>
  )
}
