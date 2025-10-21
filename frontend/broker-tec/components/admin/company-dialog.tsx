"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useData, type Company, type Market } from "@/lib/data-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface CompanyDialogProps {
  open: boolean
  onClose: () => void
  company: Company | null
  markets: Market[]
}

export function CompanyDialog({ open, onClose, company, markets }: CompanyDialogProps) {
  const { addCompany, updateCompany } = useData()
  const [name, setName] = useState("")
  const [ticker, setTicker] = useState("")
  const [marketId, setMarketId] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [previousPrice, setPreviousPrice] = useState("")
  const [totalShares, setTotalShares] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (company) {
      setName(company.name)
      setTicker(company.ticker)
      setMarketId(company.marketId)
      setCurrentPrice(company.currentPrice.toString())
      setPreviousPrice(company.previousPrice.toString())
      setTotalShares(company.totalShares.toString())
    } else {
      setName("")
      setTicker("")
      setMarketId(markets[0]?.id || "")
      setCurrentPrice("")
      setPreviousPrice("")
      setTotalShares("")
    }
    setError("")
  }, [company, open, markets])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const price = Number.parseFloat(currentPrice)
    const prevPrice = Number.parseFloat(previousPrice)
    const shares = Number.parseFloat(totalShares)

    if (isNaN(price) || price <= 0) {
      setError("El precio actual debe ser un número válido mayor a 0")
      return
    }

    if (isNaN(prevPrice) || prevPrice <= 0) {
      setError("El precio anterior debe ser un número válido mayor a 0")
      return
    }

    if (isNaN(shares) || shares <= 0) {
      setError("datos de capitalización incompletos")
      return
    }

    const marketCap = price * shares

    if (company) {
      updateCompany(company.id, {
        name,
        ticker: ticker.toUpperCase(),
        marketId,
        currentPrice: price,
        previousPrice: prevPrice,
        totalShares: shares,
        marketCap,
      })
    } else {
      addCompany({
        name,
        ticker: ticker.toUpperCase(),
        marketId,
        currentPrice: price,
        previousPrice: prevPrice,
        totalShares: shares,
        marketCap,
        isActive: true,
      })
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
          <DialogDescription>
            {company ? "Actualiza la información de la empresa" : "Agrega una nueva empresa al catálogo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Empresa</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apple Inc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="market">Mercado</Label>
              <Select value={marketId} onValueChange={setMarketId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un mercado" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name} ({market.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPrice">Precio Actual (USD)</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousPrice">Precio Anterior (USD)</Label>
                <Input
                  id="previousPrice"
                  type="number"
                  step="0.01"
                  value={previousPrice}
                  onChange={(e) => setPreviousPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalShares">Número Total de Acciones</Label>
              <Input
                id="totalShares"
                type="number"
                value={totalShares}
                onChange={(e) => setTotalShares(e.target.value)}
                placeholder="1000000"
                required
              />
            </div>

            {currentPrice && totalShares && (
              <div className="rounded-lg border bg-muted p-3">
                <p className="text-sm font-medium">
                  Capitalización de Mercado:{" "}
                  <span className="text-lg font-bold">
                    $
                    {(Number.parseFloat(currentPrice) * Number.parseFloat(totalShares)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </span>
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{company ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
