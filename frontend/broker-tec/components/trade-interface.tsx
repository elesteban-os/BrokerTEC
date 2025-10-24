"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, TrendingUp, Wallet } from "lucide-react"

interface TradeInterfaceProps {
  companyName?: string
  companyTicker?: string
  currentPrice?: number
  userBalance?: number
  userShares?: number
  maxPurchasable?: number
}

export function TradeInterface({
  companyName = "Apple Inc.",
  companyTicker = "AAPL",
  currentPrice = 178.25,
  userBalance = 50000,
  userShares = 25,
  maxPurchasable = 120,
}: TradeInterfaceProps) {
  const [quantity, setQuantity] = useState<string>("")
  const [validationMessage, setValidationMessage] = useState<string>("")
  const [validationType, setValidationType] = useState<"error" | "success" | "">("")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const handleQuantityChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "")
    setQuantity(numericValue)
    setValidationMessage("")
    setValidationType("")
  }

  const handleBuy = () => {
    const qty = Number.parseInt(quantity)

    if (!quantity || qty <= 0) {
      setValidationMessage("Por favor ingrese una cantidad válida")
      setValidationType("error")
      return
    }

    const totalCost = qty * currentPrice

    if (qty > maxPurchasable) {
      setValidationMessage(`No puede comprar más de ${maxPurchasable} acciones`)
      setValidationType("error")
      return
    }

    if (totalCost > userBalance) {
      setValidationMessage("Saldo insuficiente para realizar esta compra")
      setValidationType("error")
      return
    }

    setValidationMessage(`Compra exitosa: ${qty} acciones por ${formatCurrency(totalCost)}`)
    setValidationType("success")
    console.log(`Buy ${qty} shares at ${formatCurrency(totalCost)}`)
  }

  const handleSell = () => {
    const qty = Number.parseInt(quantity)

    if (!quantity || qty <= 0) {
      setValidationMessage("Por favor ingrese una cantidad válida")
      setValidationType("error")
      return
    }

    if (qty > userShares) {
      setValidationMessage("Inventario insuficiente para realizar esta venta")
      setValidationType("error")
      return
    }

    const totalRevenue = qty * currentPrice

    setValidationMessage(`Venta exitosa: ${qty} acciones por ${formatCurrency(totalRevenue)}`)
    setValidationType("success")
    console.log(`Sell ${qty} shares for ${formatCurrency(totalRevenue)}`)
  }

  const totalCost = quantity ? Number.parseInt(quantity) * currentPrice : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Operar</h1>
                <p className="text-sm text-muted-foreground">
                  {companyName} ({companyTicker})
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Volver a la empresa
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - User Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="w-5 h-5 text-primary" />
                    Saldo Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(userBalance)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Disponible para operar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Acciones en Cartera
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{userShares}</p>
                  <p className="text-sm text-muted-foreground mt-1">{companyTicker} disponibles para vender</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Precio Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(currentPrice)}</p>
                  <p className="text-xs text-muted-foreground mt-1">por acción</p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Trading Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Realizar Operación</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ingrese la cantidad de acciones que desea comprar o vender
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-base font-semibold">
                      Cantidad de Acciones
                    </Label>
                    <div className="relative">
                      <Input
                        id="quantity"
                        type="text"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="h-14 text-2xl font-semibold pr-24"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        acciones
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Máximo comprable: <span className="font-semibold text-foreground">{maxPurchasable}</span>
                    </p>
                  </div>

                  {/* Total Cost Display */}
                  {quantity && Number.parseInt(quantity) > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cantidad:</span>
                        <span className="font-semibold text-foreground">{quantity} acciones</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Precio unitario:</span>
                        <span className="font-semibold text-foreground">{formatCurrency(currentPrice)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-foreground">Total:</span>
                        <span className="text-xl font-bold text-foreground">{formatCurrency(totalCost)}</span>
                      </div>
                    </div>
                  )}

                  {/* Validation Message */}
                  {validationMessage && (
                    <div
                      className={`flex items-start gap-3 p-4 rounded-lg ${
                        validationType === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium">{validationMessage}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Button
                      onClick={handleBuy}
                      size="lg"
                      className="h-14 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                    >
                      Comprar
                    </Button>
                    <Button
                      onClick={handleSell}
                      size="lg"
                      variant="destructive"
                      className="h-14 text-base font-semibold"
                    >
                      Vender
                    </Button>
                  </div>

                  {/* Info Text */}
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Las operaciones se ejecutarán al precio actual de mercado
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
