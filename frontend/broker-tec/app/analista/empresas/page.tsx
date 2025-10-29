"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useData } from "@/lib/data-context"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    if (!selectedCompanyId) return null

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-ES").format(value)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reportes por Empresa</h1>
        <p className="text-muted-foreground">Estudiar actividad y tenencia por empresa</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Mercado</Label>
              <Select value={selectedMarketId} onValueChange={setSelectedMarketId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mercado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los mercados</SelectItem>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.ticker} - {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {dateError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{dateError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedCompany && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Mayor Tenedor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{majorHolder?.alias}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatNumber(majorHolder?.shares || 0)} acciones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Inventario de Tesorería</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatNumber(treasuryInventory)}</p>
                <p className="text-sm text-muted-foreground mt-1">acciones disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Precio Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedCompany.currentPrice)}</p>
                <p className="text-sm text-muted-foreground mt-1">por acción</p>
              </CardContent>
            </Card>
          </div>

          {/* Price Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Precio vs Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    price: {
                      label: "Precio",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                        className="text-xs"
                      />
                      <YAxis
                        domain={["dataMin - 5", "dataMax + 5"]}
                        tickFormatter={(value) => `$${value}`}
                        className="text-xs"
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            }}
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="black"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alias</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => {
                      const user = users.find((u) => u.id === tx.userId)
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{user?.alias || "desconocido"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                tx.type === "buy"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : tx.type === "sell"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              }`}
                            >
                              {tx.type === "buy" ? "Compra" : tx.type === "sell" ? "Venta" : "Liquidación"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{formatNumber(tx.shares)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(tx.price)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(tx.total)}</TableCell>
                          <TableCell>
                            {new Date(tx.createdAt).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {selectedCompanyId ? "No hay transacciones en el rango seleccionado" : "Selecciona una empresa"}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
