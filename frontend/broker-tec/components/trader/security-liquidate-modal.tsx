"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Clock } from "lucide-react"

interface SecurityLiquidateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SecurityLiquidateModal({ open, onOpenChange }: SecurityLiquidateModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [password, setPassword] = useState("")

  // Mock data - last access
  const lastAccess = {
    date: "21 de octubre, 2025",
    time: "14:35:22",
  }

  const handleLiquidateClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmLiquidation = () => {
    console.log("Liquidation confirmed")
    // TODO: Implement liquidation logic
    setShowConfirmation(false)
    setPassword("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setPassword("")
  }

  const handleClose = () => {
    setShowConfirmation(false)
    setPassword("")
    onOpenChange(false)
  }

  return (
    <>
      {/* Main Security Modal */}
      <Dialog open={open && !showConfirmation} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Seguridad y Liquidación</DialogTitle>
            <DialogDescription>Información de acceso y opciones de liquidación de cartera</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Last Access Card */}
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Último acceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="text-lg font-semibold">{lastAccess.date}</p>
                  <p className="text-sm text-muted-foreground mt-2">Hora</p>
                  <p className="text-lg font-semibold">{lastAccess.time}</p>
                </div>
              </CardContent>
            </Card>

            {/* Liquidate All Section */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  Liquidar Todo
                </CardTitle>
                <CardDescription>
                  Esta acción venderá todas tus posiciones al precio de mercado actual y convertirá tu cartera completa
                  en efectivo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleLiquidateClick} variant="destructive" className="w-full" size="lg">
                  Liquidar toda mi cartera
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Liquidación
            </DialogTitle>
            <DialogDescription>Por favor, ingresa tu contraseña para confirmar esta acción</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Warning Message */}
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Esta acción es irreversible
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                Todas tus posiciones serán vendidas inmediatamente al precio de mercado actual.
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleConfirmLiquidation} variant="destructive" className="flex-1" disabled={!password}>
              Confirmar liquidación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}