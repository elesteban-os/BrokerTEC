"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/lib/data-context"

export default function AnalistaDashboard() {
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Empresas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalCompanies}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Traders Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalTraders}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
