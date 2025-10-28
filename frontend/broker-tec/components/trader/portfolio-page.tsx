"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Briefcase, TrendingUp, TrendingDown } from "lucide-react"

interface Position {
  id: string
  company: string
  ticker: string
  market: string
  quantity: number
  avgCost: number
  currentPrice: number
  currentValue: number
}

export function PortfolioPage() {
  // Mock data
  const positions: Position[] = [
    {
      id: "1",
      company: "Apple Inc.",
      ticker: "AAPL",
      market: "NASDAQ",
      quantity: 50,
      avgCost: 150.25,
      currentPrice: 175.5,
      currentValue: 8775,
    },
    {
      id: "2",
      company: "Microsoft Corporation",
      ticker: "MSFT",
      market: "NASDAQ",
      quantity: 30,
      avgCost: 320.0,
      currentPrice: 340.75,
      currentValue: 10222.5,
    },
    {
      id: "3",
      company: "Alphabet Inc.",
      ticker: "GOOGL",
      market: "NASDAQ",
      quantity: 25,
      avgCost: 125.8,
      currentPrice: 138.2,
      currentValue: 3455,
    },
    {
      id: "4",
      company: "Amazon.com Inc.",
      ticker: "AMZN",
      market: "NASDAQ",
      quantity: 40,
      avgCost: 145.5,
      currentPrice: 152.3,
      currentValue: 6092,
    },
    {
      id: "5",
      company: "NVIDIA Corporation",
      ticker: "NVDA",
      market: "NASDAQ",
      quantity: 60,
      avgCost: 480.0,
      currentPrice: 520.75,
      currentValue: 31245,
    },
  ]

  const walletBalance = 15750.5
  const totalPortfolioValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0)
  const totalValue = totalPortfolioValue + walletBalance
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const calculateProfitLoss = (position: Position) => {
    const profitLoss = (position.currentPrice - position.avgCost) * position.quantity
    const profitLossPercentage = ((position.currentPrice - position.avgCost) / position.avgCost) * 100
    return { profitLoss, profitLossPercentage }
  }

  const handleBackToDashboard = () => {
    router.back()
    // TODO: Implement navigation
  }

  const handleBuyMore = (ticker: string) => {
    console.log("Comprar más de:", ticker)
    // TODO: Implement navigation to trade page
  }

  const handleSellPartial = (ticker: string) => {
    console.log("Vender parcialmente:", ticker)
    // TODO: Implement navigation to trade page
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">Mi Portafolio</span>
              <p className="text-sm text-muted-foreground">Trader: fernanda1</p>
            </div>
          </div>
          <Button onClick={handleBackToDashboard} variant="outline" className="h-10 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor del Portafolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPortfolioValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Efectivo Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(walletBalance)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Positions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Posiciones Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Mercado</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo Promedio</TableHead>
                      <TableHead className="text-right">Precio Actual</TableHead>
                      <TableHead className="text-right">Valor Actual</TableHead>
                      <TableHead className="text-right">Ganancia/Pérdida</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => {
                      const { profitLoss, profitLossPercentage } = calculateProfitLoss(position)
                      const isProfit = profitLoss >= 0

                      return (
                        <TableRow key={position.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-foreground">{position.company}</p>
                              <p className="text-sm text-muted-foreground">{position.ticker}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {position.market}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{position.quantity}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(position.avgCost)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(position.currentPrice)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(position.currentValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`font-semibold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                              >
                                {isProfit ? "+" : ""}
                                {formatCurrency(profitLoss)}
                              </span>
                              <div
                                className={`flex items-center gap-1 text-xs ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                              >
                                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>
                                  {isProfit ? "+" : ""}
                                  {profitLossPercentage.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBuyMore(position.ticker)}
                                className="h-8 text-xs"
                              >
                                Comprar más
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSellPartial(position.ticker)}
                                className="h-8 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Vender
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {/* Totals Row */}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={5} className="text-right">
                        Total (Portafolio + Billetera)
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">{formatCurrency(totalValue)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}