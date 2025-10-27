"use client"

import type React from "react"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"

interface DelistDialogProps {
  open: boolean
  onClose: () => void
  company: Company
  onResult: (result: { success: boolean; message: string }) => void
}

export function DelistDialog({ open, onClose, company, onResult }: DelistDialogProps) {
  const { delistCompany, positions } = useData()
  const [reason, setReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const activePositions = positions.filter((p) => p.companyId === company.id)
  const hasPositions = activePositions.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!reason.trim()) {
      setError("Debes proporcionar una justificación para el deslistado")
      return
    }

    setIsProcessing(true)

    try {
      const result = await delistCompany(company.id, reason)
      onResult(result)

      if (result.success) {
        onClose()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("Error al procesar el deslistado")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Deslistar y Eliminar Empresa
          </DialogTitle>
          <DialogDescription>
            Esta acción deslistará y eliminará permanentemente la empresa "{company.name}" del sistema.
          </DialogDescription>
        </DialogHeader>

        {hasPositions && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Advertencia:</strong> Esta empresa tiene {activePositions.length} posiciones activas que serán
              liquidadas automáticamente al precio actual (${company.currentPrice.toFixed(2)} USD). El dinero será
              acreditado a las billeteras de los usuarios.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Justificación del Deslistado</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explica el motivo del deslistado (ej: quiebra, fusión, incumplimiento regulatorio, etc.)"
                rows={4}
                required
              />
            </div>

            {hasPositions && (
              <div className="rounded-lg border bg-muted p-4">
                <h4 className="font-semibold mb-2">Resumen de Liquidación</h4>
                <div className="space-y-1 text-sm">
                  <p>Posiciones a liquidar: {activePositions.length}</p>
                  <p>Total de acciones: {activePositions.reduce((sum, p) => sum + p.shares, 0).toLocaleString()}</p>
                  <p>Precio de liquidación: ${company.currentPrice.toFixed(2)} USD (precio actual)</p>
                  <p>
                    Valor total de liquidación: $
                    {(activePositions.reduce((sum, p) => sum + p.shares, 0) * company.currentPrice).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                    )}{" "}
                    USD
                  </p>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Deslistado"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
