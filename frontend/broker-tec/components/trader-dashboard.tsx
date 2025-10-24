"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Briefcase, AlertTriangle } from "lucide-react"
import { SecurityLiquidateModal } from "./security-liquidate-modal"

interface Company {
  name: string
  ticker: string
  marketCap: number
  variation: number
}

export function TraderDashboard() {
  // Mock data - Top 5 companies by market cap
  const topCompanies: Company[] = [
    { name: "Apple Inc.", ticker: "AAPL", marketCap: 2800000000000, variation: 2.5 },
    { name: "Microsoft Corporation", ticker: "MSFT", marketCap: 2400000000000, variation: 1.8 },
    { name: "Alphabet Inc.", ticker: "GOOGL", marketCap: 1700000000000, variation: -0.5 },
    { name: "Amazon.com Inc.", ticker: "AMZN", marketCap: 1500000000000, variation: 3.2 },
    { name: "NVIDIA Corporation", ticker: "NVDA", marketCap: 1200000000000, variation: 5.7 },
  ]

  const maxMarketCap = Math.max(...topCompanies.map((c) => c.marketCap))

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`
    }
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    }
    return `$${value.toLocaleString()}`
  }

  // State for security modal
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const router = useRouter()
  
  // Handlers for buttons
  const handleLogout = () => {
    console.log("Logout clicked")
    // TODO: Implement logout logic
  }

  const handleGoToWallet = () => {
    router.push("/trader/wallet")
    // TODO: Implement navigation to wallet
  }

  const handleGoToPortfolio = () => {
    router.push("/trader/portfolio")
    // TODO: Implement navigation to portfolio
  }

  // Handler for liquidate all
  const handleLiquidateAll = () => {
    setShowSecurityModal(true)
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">BrokerTEC</span>
              <p className="text-sm text-muted-foreground">Trader: fernanda1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel del Trader</h1>
            <p className="text-muted-foreground">Top 5 empresas por capitalización de mercado</p>
          </div>

          {/* Company Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topCompanies.map((company) => (
              <Card key={company.ticker} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">{company.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{company.ticker}</p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        company.variation >= 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {company.variation >= 0 ? "+" : ""}
                      {company.variation.toFixed(2)}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Capitalización de mercado</p>
                    <p className="text-2xl font-bold text-foreground">{formatMarketCap(company.marketCap)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Horizontal Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Capitalización de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCompanies.map((company) => {
                  const percentage = (company.marketCap / maxMarketCap) * 100
                  return (
                    <div key={company.ticker} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{company.ticker}</span>
                          <span className="text-muted-foreground">{company.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{formatMarketCap(company.marketCap)}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs font-semibold text-primary-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SecurityLiquidateModal open={showSecurityModal} onOpenChange={setShowSecurityModal} />
    </div>
  )
}
