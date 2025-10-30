"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Wallet,
  Briefcase,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  BarChart2,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { fetchTopCompanies, ApiMarket, ApiCompany } from "@/lib/trader-api"

export function TraderDashboard() {
  const [userAlias, setUserAlias] = useState("Cargando...")
  const [markets, setMarkets] = useState<ApiMarket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // ----------------------------------------------------
  // CARGA INICIAL
  // ----------------------------------------------------
  useEffect(() => {
    const alias = localStorage.getItem("user_alias")
    const token = localStorage.getItem("access_token")

    if (!alias || !token) {
      setError("Sesión no válida. Por favor, inicia sesión de nuevo.")
      setIsLoading(false)
      setTimeout(() => router.push("/"), 2000)
      return
    }

    setUserAlias(alias)
    loadMarkets(token)
  }, [router])

  // ----------------------------------------------------
  // CARGAR MERCADOS CON SUS TOP EMPRESAS
  // ----------------------------------------------------
  const loadMarkets = async (token: string) => {
    try {
      setIsLoading(true)
      const data = await fetchTopCompanies(token)
      setMarkets(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos del mercado.")
    } finally {
      setIsLoading(false)
    }
  }

  // ----------------------------------------------------
  // REFRESCAR
  // ----------------------------------------------------
  const handleRefresh = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return setError("Token no encontrado. Inicia sesión nuevamente.")
    await loadMarkets(token)
  }

  // ----------------------------------------------------
  // FORMATEO DE MONTO
  // ----------------------------------------------------
  const formatMarketCap = (value: number) => {
    if (!value || isNaN(value)) return "$0"
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  // ----------------------------------------------------
  // MANEJO DE SESIÓN
  // ----------------------------------------------------
  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const handleGoToWallet = () => router.push("/trader/wallet")
  const handleGoToPortfolio = () => router.push("/trader/portfolio")
  const handleGoToSecurity = () => router.push("/trader/security")

  // ----------------------------------------------------
  // ESTADOS DE CARGA Y ERROR
  // ----------------------------------------------------
  if (isLoading && markets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xl font-semibold text-foreground">Cargando panel...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 border-red-500 shadow-lg max-w-md w-full">
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">Error</CardTitle>
          <p className="mb-6 text-gray-700 dark:text-gray-300">{error}</p>
          <Button
            onClick={() => router.push("/")}
            variant="default"
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Ir a Iniciar Sesión
          </Button>
        </Card>
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="p-8 max-w-lg w-full text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-xl mb-3">Sin datos de mercado</CardTitle>
          <p className="text-muted-foreground">
            No se encontraron mercados habilitados con empresas registradas.
          </p>
          <Button onClick={handleRefresh} className="mt-6">
            Reintentar Carga
          </Button>
        </Card>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">BrokerTEC</span>
              <p className="text-sm text-muted-foreground">Trader: {userAlias}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="h-10 bg-transparent"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar"
              )}
            </Button>
            <Button onClick={handleGoToPortfolio} variant="outline">
              <Briefcase className="w-4 h-4 mr-2" /> Portafolio
            </Button>
            <Button onClick={handleGoToWallet} variant="outline">
              <Wallet className="w-4 h-4 mr-2" /> Billetera
            </Button>
            <Button
              onClick={handleGoToSecurity}
              variant="outline"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> Liquidar Todo
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel del Trader
          </h1>
          <p className="text-muted-foreground">
            Top 5 de empresas por mercado según capitalización (USD)
          </p>
        </div>

        {/* RENDERIZAR UN GRÁFICO POR MERCADO */}
        {markets.map((market) => (
          <Card key={market.id_mercado} className="shadow-md">
            <CardHeader>
              <CardTitle>
                Top 5 del mercado:
                <span className="text-primary">{market.nombre}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {market.top_empresas.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={market.top_empresas}
                      layout="vertical"
                      margin={{ left: 50, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`}
                      />
                      <YAxis type="category" dataKey="nombre" width={120} />
                      <Tooltip
                        formatter={(v: number) =>
                          new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 2,
                          }).format(v)
                        }
                      />
                      <Bar
                        dataKey="capitalizacion"
                        fill="#3b82f6"
                        barSize={25}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  No hay empresas activas en este mercado.
                </p>
              )}
            </CardContent>

            {/* TARJETAS DE EMPRESAS */}
            {market.top_empresas.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {market.top_empresas.map((company) => (
                  <Card
                    key={company.id_empresa}
                    onClick={() =>
                      router.push(`/trader/company/${company.id_empresa}`)
                    }
                    className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">
                        {company.nombre}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {company.ticker}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Capitalización
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatMarketCap(company.capitalizacion)}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          (company.variacion ?? 0) >= 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {(company.variacion ?? 0) >= 0 ? "+" : ""}
                        {(company.variacion ?? 0).toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        ))}
      </main>
    </div>
  )
}
