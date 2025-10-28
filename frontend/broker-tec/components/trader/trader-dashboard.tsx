"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Briefcase, AlertTriangle, Loader2, ShieldCheck, BarChart2 } from "lucide-react"
import { fetchTopCompanies, ApiCompany } from "@/lib/trader-api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function TraderDashboard() {
  const [userAlias, setUserAlias] = useState("Cargando...")
  const [companies, setCompanies] = useState<ApiCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // ----------------------------------------------------
  // CARGA DE DATOS INICIAL
  // ----------------------------------------------------
  useEffect(() => {
    const alias = localStorage.getItem("user_alias")
    const accessToken = localStorage.getItem("access_token")

    if (!alias || !accessToken) {
      setError("Sesión no válida. Por favor, inicia sesión de nuevo.")
      setIsLoading(false)
      setTimeout(() => router.push("/"), 2000)
      return
    }

    setUserAlias(alias)
    loadTopCompanies(accessToken)
  }, [router])

  // ----------------------------------------------------
  // FUNCIÓN PARA CARGAR DATOS DE EMPRESAS
  // ----------------------------------------------------
  const loadTopCompanies = async (token: string) => {
    try {
      setIsLoading(true)
      const data = await fetchTopCompanies(token)
      const normalized = data.map((c) => ({
        id_empresa: c.id_empresa,
        nombre: c.nombre,
        ticker: c.ticker ?? c.nombre.slice(0, 3).toUpperCase(),
        price: Number(c.precio_actual) || 0,
        shares: Number(c.cantidad_acciones) || 0,
        capitalizacion: Number(c.capitalizacion) || 0,
      }))
      setCompanies(normalized)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos de las empresas.")
    } finally {
      setIsLoading(false)
    }
  }

  // ----------------------------------------------------
  // BOTÓN DE REFRESCAR
  // ----------------------------------------------------
  const handleRefresh = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Token no encontrado. Inicia sesión nuevamente.")
      return
    }
    await loadTopCompanies(token)
  }

  // ----------------------------------------------------
  // FORMATOS AUXILIARES
  // ----------------------------------------------------
  const formatMarketCap = (value: number) => {
    if (!value || isNaN(value)) return "$0"
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  // ----------------------------------------------------
  // HANDLERS DE NAVEGACIÓN
  // ----------------------------------------------------
  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const handleGoToWallet = () => router.push("/trader/wallet")
  const handleGoToPortfolio = () => router.push("/trader/portfolio")
  const handleGoToSecurity = () => router.push("/trader/security")

  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------
  if (isLoading && companies.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xl font-semibold text-foreground">Cargando panel de operaciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 border-red-500 shadow-lg max-w-md w-full">
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">Error de Carga</CardTitle>
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

  if (companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="p-8 max-w-lg w-full text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-xl mb-3">Sin datos de capitalización</CardTitle>
          <p className="text-muted-foreground">
            No se pudieron obtener los datos de capitalización del mercado.
          </p>
          <Button onClick={handleRefresh} className="mt-6">
            Reintentar Carga
          </Button>
        </Card>
      </div>
    )
  }

  // ----------------------------------------------------
  // DATOS PARA EL GRÁFICO
  // ----------------------------------------------------
  const topCompanies = companies
    .filter((c) => c.capitalizacion > 0)
    .sort((a, b) => b.capitalizacion - a.capitalizacion)
    .slice(0, 5)

  // ----------------------------------------------------
  // INTERFAZ PRINCIPAL
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
                "Actualizar Top"
              )}
            </Button>

            <Button onClick={handleGoToPortfolio} variant="outline" className="h-10 bg-transparent">
              <Briefcase className="w-4 h-4 mr-2" />
              Mi Portafolio
            </Button>

            <Button onClick={handleGoToWallet} variant="outline" className="h-10 bg-transparent">
              <Wallet className="w-4 h-4 mr-2" />
              Mi Billetera
            </Button>

            <Button
              onClick={handleGoToSecurity}
              variant="outline"
              className="h-10 bg-transparent text-destructive hover:text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Liquidar Todo
            </Button>

            <Button onClick={handleLogout} variant="outline" className="h-10 bg-transparent">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel del Trader</h1>
            <p className="text-muted-foreground">
              Top {companies.length} empresas por capitalización de mercado (USD)
            </p>
          </div>

          {/*GRÁFICO DE TOP EMPRESAS */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Empresas por Capitalización (USD)</CardTitle>
            </CardHeader>
            <CardContent>
              {topCompanies.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCompanies} layout="vertical" margin={{ left: 50, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
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
                      <Bar dataKey="capitalizacion" fill="#3b82f6" barSize={25} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Sin datos de capitalización disponibles.
                </p>
              )}
            </CardContent>
          </Card>

          {/* TARJETAS DE EMPRESAS */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card
                key={company.id_empresa}
                onClick={() => router.push(`/trader/company/${company.id_empresa}`)}
                className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">{company.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{company.ticker}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Capitalización de mercado</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatMarketCap(company.capitalizacion)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
