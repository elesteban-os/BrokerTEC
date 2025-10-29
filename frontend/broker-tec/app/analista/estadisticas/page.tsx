"use client"

import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Building2, TrendingUp } from "lucide-react"

type ViewLevel = "market" | "company"

export default function EstadisticasPage() {
  const { markets, companies, positions, users } = useData()
  const [viewLevel, setViewLevel] = useState<ViewLevel>("market")
  const [error, setError] = useState("")

  // Calculate distribution by market
  const marketDistribution = useMemo(() => {
    if (positions.length === 0) {
      setError("sin posiciones para calcular")
      return []
    }
    setError("")

    const distribution = markets.map((market) => {
      const marketCompanies = companies.filter((c) => c.marketId === market.id)
      const marketCompanyIds = marketCompanies.map((c) => c.id)

      let traderShares = 0
      let adminShares = 0
      let totalShares = 0

      marketCompanies.forEach((company) => {
        const companyPositions = positions.filter((p) => p.companyId === company.id)
        const companyTotalShares = companyPositions.reduce((sum, p) => sum + p.shares, 0)

        companyPositions.forEach((position) => {
          const user = users.find((u) => u.id === position.userId)
          if (user?.role === "trader") {
            traderShares += position.shares
          } else {
            adminShares += position.shares
          }
        })

        totalShares += companyTotalShares
      })

      const traderPercent = totalShares > 0 ? (traderShares / totalShares) * 100 : 0
      const adminPercent = totalShares > 0 ? (adminShares / totalShares) * 100 : 0

      return {
        name: market.name,
        traderPercent: Number(traderPercent.toFixed(2)),
        adminPercent: Number(adminPercent.toFixed(2)),
        traderShares,
        adminShares,
        totalShares,
      }
    })

    return distribution
  }, [markets, companies, positions, users])

  // Calculate distribution by company
  const companyDistribution = useMemo(() => {
    if (positions.length === 0) {
      setError("sin posiciones para calcular")
      return []
    }
    setError("")

    const distribution = companies.map((company) => {
      const companyPositions = positions.filter((p) => p.companyId === company.id)

      let traderShares = 0
      let adminShares = 0

      companyPositions.forEach((position) => {
        const user = users.find((u) => u.id === position.userId)
        if (user?.role === "trader") {
          traderShares += position.shares
        } else {
          adminShares += position.shares
        }
      })

      const totalShares = traderShares + adminShares
      const traderPercent = totalShares > 0 ? (traderShares / totalShares) * 100 : 0
      const adminPercent = totalShares > 0 ? (adminShares / totalShares) * 100 : 0

      return {
        name: company.ticker,
        fullName: company.name,
        traderPercent: Number(traderPercent.toFixed(2)),
        adminPercent: Number(adminPercent.toFixed(2)),
        traderShares,
        adminShares,
        totalShares,
      }
    })

    return distribution.filter((d) => d.totalShares > 0)
  }, [companies, positions, users])

  const currentData = viewLevel === "market" ? marketDistribution : companyDistribution

  const chartData = currentData.map((item) => ({
    name: item.name,
    Traders: item.traderPercent,
    Administración: item.adminPercent,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Estadísticas (Mercado)</h1>
        <p className="text-muted-foreground">Distribución de tenencia por mercado y empresa</p>
      </div>

      {/* View Level Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Nivel de Vista</CardTitle>
          <CardDescription>Cambia entre vista por mercado o por empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={viewLevel === "market" ? "default" : "outline"}
              onClick={() => setViewLevel("market")}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Por Mercado
            </Button>
            <Button
              variant={viewLevel === "company" ? "default" : "outline"}
              onClick={() => setViewLevel("company")}
              className="flex-1"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Por Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      )}

      {!error && currentData.length > 0 && (
        <>
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Tenencia (%)</CardTitle>
              <CardDescription>
                Porcentaje de acciones en traders vs. administración por{" "}
                {viewLevel === "market" ? "mercado" : "empresa"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Legend />
                  <Bar dataKey="Traders" fill="rgba(1, 63, 96)" />
                  <Bar dataKey="Administración" fill="black" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tabla de Distribución</CardTitle>
              <CardDescription>
                Detalles de tenencia por {viewLevel === "market" ? "mercado" : "empresa"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{viewLevel === "market" ? "Mercado" : "Empresa"}</TableHead>
                    <TableHead className="text-right">Total Acciones</TableHead>
                    <TableHead className="text-right">Traders</TableHead>
                    <TableHead className="text-right">Administración</TableHead>
                    <TableHead>Distribución</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {viewLevel === "company" && "fullName" in item && (
                            <div className="text-sm text-muted-foreground">{item.fullName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{item.totalShares.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono">{item.traderShares.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.traderPercent.toFixed(2)}%</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-mono">{item.adminShares.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{item.adminPercent.toFixed(2)}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-20">Traders:</span>
                            <Progress value={item.traderPercent} className="flex-1" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-20">Admin:</span>
                            <Progress value={item.adminPercent} className="flex-1 [&>div]:bg-muted-foreground" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
