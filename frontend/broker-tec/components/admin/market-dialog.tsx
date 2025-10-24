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
import { Switch } from "@/components/ui/switch"

interface MarketDialogProps {
  open: boolean
  onClose: () => void
  market: Market | null
}

export function MarketDialog({ open, onClose, market }: MarketDialogProps) {
  const { addMarket, updateMarket } = useData()
  const [name, setName] = useState("")
  const [enabled, setEnabled] = useState(true)
  const [resultOpen, setResultOpen] = useState(false)
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null)
  const [resultMessage, setResultMessage] = useState("")

  useEffect(() => {
    if (market) {
      setName(market.name)
      setEnabled(market.enabled)
    } else {
      setName("")
      setEnabled(true)
    }
  }, [market, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (market) {
      const res = await updateMarket(market.id, { enabled })
      setResultSuccess(res.success)
      setResultMessage(res.message)
      setResultOpen(true)
      if (res.success) onClose()
    } else {
      const res = await addMarket({ name, currency: "USD", enabled: true })
      setResultSuccess(res.success)
      setResultMessage(res.message)
      setResultOpen(true)
      if (res.success) onClose()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{market ? "Editar Mercado" : "Nuevo Mercado"}</DialogTitle>
          <DialogDescription>
            {market ? "Habilita o deshabilita el mercado" : "Crea un nuevo mercado para listar empresas"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NASDAQ"
                required
                disabled={!!market}
              />
              {market && <p className="text-sm text-muted-foreground">El nombre del mercado no puede ser modificado</p>}
            </div>
            {market ? (
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="enabled" className="flex flex-col space-y-1">
                  <span>Estado del Mercado</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {enabled ? "El mercado está habilitado" : "El mercado está deshabilitado"}
                  </span>
                </Label>
                <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">El mercado será habilitado por defecto al crearlo.</div>
            )}
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

      {/* Result dialog */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{resultSuccess ? "Éxito" : "Error"}</DialogTitle>
          <DialogDescription>{resultMessage}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setResultOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  )
}
