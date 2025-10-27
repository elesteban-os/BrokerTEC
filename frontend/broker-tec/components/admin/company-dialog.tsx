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
import { AlertCircle, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface CompanyDialogProps {
  open: boolean
  onClose: () => void
  company: Company | null
  markets: Market[]
  onResult: (result: { success: boolean; message: string }) => void
}

export function CompanyDialog({ open, onClose, company, markets, onResult }: CompanyDialogProps) {
  const { addCompany, updateCompany } = useData()
  const [name, setName] = useState("")
  const [marketId, setMarketId] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [totalShares, setTotalShares] = useState("")
  const [enabled, setEnabled] = useState(true) // Added enabled state
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (company) {
      setName(company.name)
      setMarketId(company.marketId)
      setCurrentPrice(company.currentPrice.toString())
      setTotalShares(company.totalShares.toString())
      setEnabled(company.enabled) // Initialize enabled state
    } else {
      setName("")
      setMarketId(markets[0]?.id || "")
      setCurrentPrice("")
      setTotalShares("")
      setEnabled(true) // Reset enabled state
    }
    setError("")
  }, [company, open, markets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    const price = Number.parseFloat(currentPrice)
    const shares = Number.parseFloat(totalShares)

    if (isNaN(price) || price <= 0) {
      setError("El precio actual debe ser un número válido mayor a 0")
      setIsSubmitting(false)
      return
    }

    if (isNaN(shares) || shares <= 0) {
      setError("datos de capitalización incompletos")
      setIsSubmitting(false)
      return
    }

    const marketCap = price * shares

    try {
      let result
      if (company) {
        result = await updateCompany(company.id, {
          name,
          marketId,
          currentPrice: price,
          totalShares: shares,
          marketCap,
          enabled,
        })
      } else {
        result = await addCompany({
          name,
          marketId,
          currentPrice: price,
          totalShares: shares,
          marketCap,
          isActive: true,
        })
      }

      onResult(result)
      if (result.success) {
        onClose()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
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
              <Label htmlFor="market">Mercado</Label>
              <Select value={marketId} onValueChange={setMarketId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un mercado" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((market) => (
                    <SelectItem key={market.id} value={market.id}>
                      {market.name}
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
                <Label htmlFor="totalShares">Cantidad de Acciones</Label>
                <Input
                  id="totalShares"
                  type="number"
                  value={totalShares}
                  onChange={(e) => setTotalShares(e.target.value)}
                  placeholder="1000000"
                  required
                />
              </div>
            </div>

            {company && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Estado de la Empresa</Label>
                  <p className="text-sm text-muted-foreground">
                    {enabled ? "La empresa está habilitada" : "La empresa está deshabilitada"}
                  </p>
                </div>
                <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              </div>
            )}

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
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : company ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
