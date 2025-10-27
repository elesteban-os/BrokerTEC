"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"

interface ResultDialogProps {
  open: boolean
  onClose: () => void
  result: { success: boolean; message: string } | null
}

export function ResultDialog({ open, onClose, result }: ResultDialogProps) {
  if (!result) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Operación Exitosa
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Error en la Operación
              </>
            )}
          </DialogTitle>
          <DialogDescription className="pt-4 text-base">{result.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
