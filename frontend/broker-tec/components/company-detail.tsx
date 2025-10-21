"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ArrowLeft } from "lucide-react"

interface HistoricalPrice {
  date: string
  price: number
}

interface CompanyDetailData {
  name: string
  ticker: string
  currentPrice: number
  marketCap: number
  totalShares: number
  availableShares: number
  majorHolder: string
  historicalPrices: HistoricalPrice[]
}

export function CompanyDetail() {
  // Mock data for company details
  const companyData: CompanyDetailData = {
    name: "Apple Inc.",
    ticker: "AAPL",
    currentPrice: 178.25,
    marketCap: 2800000000000,
    totalShares: 15700000000,
    availableShares: 1250000000,
    majorHolder: "vanguard_group",
    historicalPrices: [
      { date: "2024-01-15", price: 172.5 },
      { date: "2024-01-16", price: 174.2 },
      { date: "2024-01-17", price: 175.8 },
      { date: "2024-01-18", price: 176.9 },
      { date: "2024-01-19", price: 178.25 },
    ],
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`
    }
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    }
    return formatCurrency(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-ES").format(value)
  }

  const handleBack = () => {
    console.log("Navigate back to dashboard")
    // TODO: Implement navigation logic
  }

  const handleOperate = () => {
    console.log("Navigate to operations view")
    // TODO: Implement navigation to operations view
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{companyData.name}</h1>
                <p className="text-sm text-muted-foreground">{companyData.ticker}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Current Price */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Precio Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(companyData.currentPrice)}</p>
              </CardContent>
            </Card>

            {/* Market Cap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Capitalización Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{formatMarketCap(companyData.marketCap)}</p>
              </CardContent>
            </Card>

            {/* Total Shares */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Cantidad Total de Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{formatNumber(companyData.totalShares)}</p>
              </CardContent>
            </Card>

            {/* Available Shares */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Acciones Disponibles (Tesorería)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{formatNumber(companyData.availableShares)}</p>
              </CardContent>
            </Card>

            {/* Major Holder */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Mayor Tenedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {companyData.majorHolder.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{companyData.majorHolder}</p>
                    <p className="text-sm text-muted-foreground">Alias del inversor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Historical Prices and Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Historical Prices Table */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyData.historicalPrices.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {new Date(item.date).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(item.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Price Chart */}
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
                    <LineChart data={companyData.historicalPrices} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                              })
                            }}
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Operate Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleOperate} size="lg" className="h-12 px-8 text-base font-semibold">
              Operar con {companyData.ticker}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
