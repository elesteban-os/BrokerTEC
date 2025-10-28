"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Briefcase, TrendingUp, TrendingDown } from "lucide-react"

interface Position {
  id_posicion: number
  empresa: {
    id_empresa: number
    nombre: string
    ticker: string
  }
  cantidad_acciones: number
  costo_promedio: number
  precio_actual: number
  valor_invertido: number
  valor_actual_total: number
  ganancia_perdida: number
  porcentaje_ganancia_perdida: number
}

interface PortfolioData {
  posiciones: Position[]
  resumen: {
    total_posiciones: number
    total_invertido: number
    valor_actual_total: number
    ganancia_perdida_total: number
    porcentaje_ganancia_perdida: number
  }
}

interface WalletData {
  saldo: number
}

export function PortfolioPage() {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

  // -------------------------------
  // Cargar datos del backend
  // -------------------------------
  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      if (!token) throw new Error("No se encontró token de sesión")

      // Obtener portafolio
      const resPortfolio = await fetch("http://localhost:3000/api/trader/portafolio", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataPortfolio = await resPortfolio.json()
      if (!dataPortfolio.success) throw new Error(dataPortfolio.message)
      setPortfolio(dataPortfolio.data)

      // Obtener wallet para sumar el total
      const resWallet = await fetch("http://localhost:3000/api/trader/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataWallet = await resWallet.json()
      if (!dataWallet.success) throw new Error(dataWallet.message)
      setWallet({ saldo: dataWallet.data.saldo })
    } catch (err: any) {
      console.error("Error al cargar portafolio:", err)
      setError(err.message || "Error al cargar el portafolio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  // -------------------------------
  // Utilidades
  // -------------------------------
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)

  const handleBackToDashboard = () => router.push("/trader")
  const handleBuyMore = (id_empresa: number) => router.push(`/trader/trade/${id_empresa}`)
  const handleSellPartial = (id_empresa: number) => router.push(`/trader/trade/${id_empresa}`)

  // -------------------------------
  // Estados de carga o error
  // -------------------------------
  if (loading) return <div className="p-10 text-center text-muted-foreground">Cargando portafolio...</div>

  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
         {error}
      </div>
    )

  if (!portfolio) return <div className="p-10 text-center text-muted-foreground">No se encontraron datos.</div>

  const walletBalance = wallet?.saldo ?? 0
  const totalPortfolioValue = portfolio.resumen.valor_actual_total
  const totalValue = totalPortfolioValue + walletBalance

  // -------------------------------
  // Render principal
  // -------------------------------
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
            </div>
          </div>
          <Button onClick={handleBackToDashboard} variant="outline" className="h-10 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Valor del Portafolio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalPortfolioValue)}
                </p>
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

          {/* Tabla de posiciones */}
          <Card>
            <CardHeader>
              <CardTitle>Posiciones Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              {portfolio.posiciones.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  No tienes posiciones activas en este momento.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Costo Promedio</TableHead>
                        <TableHead className="text-right">Precio Actual</TableHead>
                        <TableHead className="text-right">Valor Actual</TableHead>
                        <TableHead className="text-right">Ganancia/Pérdida</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolio.posiciones.map((pos) => {
                        const isProfit = pos.ganancia_perdida >= 0
                        return (
                          <TableRow key={pos.id_posicion}>
                            <TableCell>
                              <div>
                                <p className="font-semibold text-foreground">{pos.empresa.nombre}</p>
                                <p className="text-sm text-muted-foreground">{pos.empresa.ticker}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{pos.cantidad_acciones}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(pos.costo_promedio)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(pos.precio_actual)}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(pos.valor_actual_total)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <span
                                  className={`font-semibold ${
                                    isProfit
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {isProfit ? "+" : ""}
                                  {formatCurrency(pos.ganancia_perdida)}
                                </span>
                                <div
                                  className={`flex items-center gap-1 text-xs ${
                                    isProfit
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {isProfit ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  <span>
                                    {isProfit ? "+" : ""}
                                    {pos.porcentaje_ganancia_perdida.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBuyMore(pos.empresa.id_empresa)}
                                  className="h-8 text-xs"
                                >
                                  Comprar más
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSellPartial(pos.empresa.id_empresa)}
                                  className="h-8 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Vender
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={4} className="text-right">
                          Total (Cartera + Billetera)
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">{formatCurrency(totalValue)}</TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
