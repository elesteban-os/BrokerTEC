"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react"

export default function SecurityPage() {
  const router = useRouter()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // ─────────────────────────────────────────────────────
  // Último acceso se toma del backend;
  // si no, guardamos/mostramos un timestamp local.
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    const nowIso = new Date().toISOString()
    // si no existe, lo creamos la primera vez
    if (!localStorage.getItem("last_access_at")) {
      localStorage.setItem("last_access_at", nowIso)
    }
  }, [])

  const lastAccess = useMemo(() => {
    const iso = localStorage.getItem("last_access_at")
    if (!iso) return { date: "—", time: "—" }
    const d = new Date(iso)
    const date = d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const time = d.toLocaleTimeString("es-ES", { hour12: false })
    return { date, time }
  }, [])

  // ─────────────────────────────────────────────────────
  // Acción: Liquidar Todo (requiere contraseña)
  // ─────────────────────────────────────────────────────
  const onConfirmLiquidation = async () => {
    try {
      setSubmitting(true)
      setErrorMsg(null)
      setSuccessMsg(null)

      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      if (!token) {
        setErrorMsg("Sesión no válida. Inicia sesión nuevamente.")
        setSubmitting(false)
        return
      }

      const res = await fetch("http://localhost:3000/api/trader/portafolio/liquidar-todo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
        // Backend envía 500 en contraseña incorrecta, con message descriptivo
        setErrorMsg(data?.message || "No se pudo completar la liquidación.")
        setSubmitting(false)
        return
      }

      setSuccessMsg(data.message || "Tu cartera fue liquidada correctamente.")
      setPassword("")
      setSubmitting(false)
      setOpenConfirm(false)

      // Actualiza "último acceso" como marca de seguridad
      localStorage.setItem("last_access_at", new Date().toISOString())

      // Redirige al portafolio para ver los cambios reflejados
      router.push("/trader/portfolio")
    } catch (err: any) {
      setErrorMsg(err?.message || "Error inesperado al liquidar el portafolio.")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simple */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">Seguridad</span>
              <p className="text-sm text-muted-foreground">Acciones sensibles del Trader</p>
            </div>
          </div>
          <Button variant="outline" className="h-10 bg-transparent" onClick={() => router.push("/trader")}>
            Volver al Dashboard
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Último acceso */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Último acceso
              </CardTitle>
              <CardDescription>Registro local del último acceso exitoso.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="text-lg font-semibold">{lastAccess.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="text-lg font-semibold">{lastAccess.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liquidar Todo */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Liquidar Todo
              </CardTitle>
              <CardDescription>
                Esta acción venderá <strong>todas</strong> tus posiciones al precio actual de mercado y convertirá la
                cartera en efectivo. Es <strong>irreversible</strong> y quedará auditada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMsg ? (
                <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMsg}
                </div>
              ) : null}
              {successMsg ? (
                <div className="mb-4 rounded-md border border-green-400/50 bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {successMsg}
                </div>
              ) : null}
              <Button
                variant="destructive"
                className="w-full h-11"
                onClick={() => {
                  setErrorMsg(null)
                  setSuccessMsg(null)
                  setOpenConfirm(true)
                }}
              >
                Liquidar toda mi cartera
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de confirmación */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirmar liquidación
            </DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña para confirmar. Esta acción es inmediata e irreversible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Advertencia
              </p>
              <p className="text-xs text-destructive/80 mt-1">
                Todas tus posiciones serán vendidas al precio de mercado actual. No podrás deshacer esta operación.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                disabled={submitting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setOpenConfirm(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onConfirmLiquidation}
              disabled={!password || submitting}
            >
              {submitting ? "Procesando..." : "Confirmar liquidación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
