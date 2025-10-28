"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface HistoricalPrice {
  precio: number
  fecha_hora: string
}

interface ApiCompanyDetail {
  id_empresa: number
  nombre: string
  ticker: string
  precio_actual: number
  cantidad_acciones: number
  capitalizacion: number
  habilitado: boolean
  mercado: {
    id_mercado: number
    nombre: string
    habilitado: boolean
  }
  historico_precios: HistoricalPrice[]
}

export function CompanyDetail() {
  const router = useRouter()
  const { id } = useParams()
  const [companyData, setCompanyData] = useState<ApiCompanyDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------------------------------------
  // CARGAR DETALLE DE LA EMPRESA DESDE LA API
  // -----------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Sesión no válida. Por favor, inicia sesión nuevamente.")
      setIsLoading(false)
      setTimeout(() => router.push("/"), 2000)
      return
    }

    const fetchCompanyDetail = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:3000/api/trader/empresas/${id}?dias=30`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const msg = await response.text()
          throw new Error(msg || "Error al obtener los datos de la empresa.")
        }

        const json = await response.json()
        if (json.success && json.data) {
          setCompanyData(json.data)
        } else {
          throw new Error(json.message || "Datos de empresa no disponibles.")
        }
      } catch (err: any) {
        console.error(" Error al cargar detalle de empresa:", err)
        setError(err.message || "Error al cargar los datos de la empresa.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyDetail()
  }, [id, router])

  // -----------------------------------------------------------
  // FORMATOS
  // -----------------------------------------------------------
  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "$0.00"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return formatCurrency(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-ES").format(value)
  }

  // -----------------------------------------------------------
  // HANDLERS
  // -----------------------------------------------------------
  const handleBack = () => {
    router.push("/trader")
  }

  const handleOperate = () => {
    if (!companyData) return
    router.push(`/trader/trade/${companyData.id_empresa}`)
  }

  // -----------------------------------------------------------
  // ESTADOS DE CARGA / ERROR
  // -----------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xl font-semibold text-foreground">Cargando datos de la empresa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 border-red-500 shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">Error de carga</CardTitle>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
          <Button onClick={handleBack} className="bg-red-500 hover:bg-red-600 w-full">
            Volver al panel
          </Button>
        </Card>
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted-foreground">
        No hay datos disponibles para esta empresa.
      </div>
    )
  }

  // -----------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // -----------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button onClick={handleBack} variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{companyData.nombre}</h1>
              <p className="text-sm text-muted-foreground">{companyData.ticker}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Precio Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(companyData.precio_actual)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Capitalización</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatMarketCap(companyData.capitalizacion)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Acciones Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatNumber(companyData.cantidad_acciones)}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Histórico */}
          {companyData.historico_precios && companyData.historico_precios.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
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
                      {companyData.historico_precios.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(item.fecha_hora).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.precio)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Precio vs Tiempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      precio: { label: "Precio", color: "hsl(var(--primary))" },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={companyData.historico_precios}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="fecha_hora"
                          tickFormatter={(v) => new Date(v).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                          className="text-xs"
                        />
                        <YAxis
                          domain={["dataMin - 5", "dataMax + 5"]}
                          tickFormatter={(v) => `$${v}`}
                          className="text-xs"
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(v) =>
                                new Date(v).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              }
                              formatter={(v) => formatCurrency(Number(v))}
                            />
                          }
                        />
                        <Line type="monotone" dataKey="precio" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-6">Sin histórico disponible</p>
          )}

          {/* Botón de operar */}
          <div className="w-full">
            <Button onClick={() => router.push(`/trader/trade/${companyData.id_empresa}`)}
             >
              Operar
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
