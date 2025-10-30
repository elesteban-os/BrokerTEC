"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DisableMarketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  marketName: string
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

export function DisableMarketDialog({
  open,
  onOpenChange,
  marketName,
  onConfirm,
  isLoading = false,
}: DisableMarketDialogProps) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = () => {
    // Validar que se haya ingresado una justificación
    if (!reason.trim()) {
      setError("Debes proporcionar una justificación para deshabilitar el mercado")
      return
    }

    if (reason.trim().length < 10) {
      setError("La justificación debe tener al menos 10 caracteres")
      return
    }

    setError("")
    onConfirm(reason.trim())
  }

  const handleClose = () => {
    setReason("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-red-600"> Deshabilitar Mercado</DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p className="font-semibold text-foreground">
              Estás a punto de deshabilitar el mercado <span className="text-red-600">"{marketName}"</span>
            </p>
            <Alert variant="destructive" className="border-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong> ADVERTENCIA - OPERACIÓN CRÍTICA Y MASIVA:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Se <strong>deslistarán AUTOMÁTICAMENTE</strong> todas las empresas activas de este mercado</li>
                  <li>Se <strong>liquidarán TODAS las posiciones</strong> de todos los traders en esas empresas</li>
                  <li>El dinero de las liquidaciones se <strong>abonará automáticamente</strong> a las wallets de los traders</li>
                  <li>Esta acción <strong>NO SE PUEDE DESHACER</strong></li>
                </ul>
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Justificación <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué se debe deshabilitar este mercado (ej: Cierre temporal por mantenimiento del sistema de trading, Regulaciones financieras, etc.)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError("")
              }}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres. Esta justificación quedará registrada en auditoría.
            </p>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-sm text-amber-800">
              <strong>ℹ Nota:</strong> El mercado quedará deshabilitado pero no será eliminado. 
              Podrás rehabilitarlo posteriormente si es necesario.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Deshabilitando..." : "Confirmar Deshabilitación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
