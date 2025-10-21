"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useData, type Market } from "@/lib/data-context"
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

interface MarketDialogProps {
  open: boolean
  onClose: () => void
  market: Market | null
}

export function MarketDialog({ open, onClose, market }: MarketDialogProps) {
  const { addMarket, updateMarket } = useData()
  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    if (market) {
      setName(market.name)
      setCurrency(market.currency)
    } else {
      setName("")
      setCurrency("USD")
    }
  }, [market, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (market) {
      updateMarket(market.id, { name, currency })
    } else {
      addMarket({ name, currency })
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{market ? "Editar Mercado" : "Nuevo Mercado"}</DialogTitle>
          <DialogDescription>
            {market ? "Actualiza la información del mercado" : "Crea un nuevo mercado para listar empresas"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="NASDAQ" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="USD"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{market ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
