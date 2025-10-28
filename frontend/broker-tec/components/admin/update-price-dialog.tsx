"use client"

import { useState, useEffect } from "react"
import { useData, type Company } from "@/lib/data-context"
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

interface UpdatePriceDialogProps {
  open: boolean
  onClose: () => void
  company: Company
  onResult: (result: { success: boolean; message: string }) => void
}

export function UpdatePriceDialog({ open, onClose, company, onResult }: UpdatePriceDialogProps) {
  const { updatePriceManual } = useData()
  const [price, setPrice] = useState(company.currentPrice.toString())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setPrice(company.currentPrice.toString())
    }
  }, [open, company.currentPrice])

  const handleSubmit = async () => {
    const priceValue = Number.parseFloat(price)

    if (isNaN(priceValue) || priceValue <= 0) {
      onResult({ success: false, message: "precio inválido" })
      return
    }

    setIsLoading(true)
    const result = await updatePriceManual(company.id, priceValue)
    setIsLoading(false)

    onResult(result)
    if (result.success) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Precio - {company.name}</DialogTitle>
          <DialogDescription>Ingresa el nuevo precio para esta empresa</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Precio Actual (USD)</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Actualizando..." : "Actualizar Precio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
