"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Briefcase, AlertTriangle, Loader2 } from "lucide-react"
import { SecurityLiquidateModal } from "./security-liquidate-modal"
import { fetchTopCompanies, ApiCompany } from "@/lib/trader-api"

export function TraderDashboard() {
  const [userAlias, setUserAlias] = useState("Cargando...")
  const [companies, setCompanies] = useState<ApiCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
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
  const handleLiquidateAll = () => setShowSecurityModal(true)

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
          <CardTitle className="text-xl mb-3">No hay datos de empresas</CardTitle>
          <p className="text-muted-foreground">
            No se pudieron obtener los datos de las principales empresas en este momento.
          </p>
          <Button onClick={handleRefresh} className="mt-6">
            Reintentar Carga
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
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
                "Actualizar precios"
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
              onClick={handleLiquidateAll}
              variant="outline"
              className="h-10 bg-transparent text-destructive hover:text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Liquidar todo
            </Button>

            <Button onClick={handleLogout} variant="outline" className="h-10 bg-transparent">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel del Trader</h1>
            <p className="text-muted-foreground">
              Top {companies.length} empresas por capitalización de mercado
            </p>
          </div>

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

      <SecurityLiquidateModal open={showSecurityModal} onOpenChange={setShowSecurityModal} />
    </div>
  )
}
