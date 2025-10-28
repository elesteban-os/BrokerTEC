"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Wallet, TrendingUp, AlertTriangle } from "lucide-react"

interface WalletData {
  id_wallet: number
  saldo: number
  categoria: string
  limite_diario: number
  consumo_dia: number
  disponible_hoy: number
  fecha_ultima_recarga?: string
  fecha_creacion?: string
}

interface HistorialRecarga {
  id: number
  fecha: string
  monto: number
  descripcion: string
  estado: string
}

export function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [historial, setHistorial] = useState<HistorialRecarga[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingRecarga, setLoadingRecarga] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

  // --------------------------------------------------------
  // Cargar información del wallet y su historial
  // --------------------------------------------------------
  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const [resWallet, resHistorial] = await Promise.all([
        fetch("http://localhost:3000/api/trader/wallet", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/trader/wallet/historial", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const dataWallet = await resWallet.json()
      const dataHistorial = await resHistorial.json()

      if (!dataWallet.success) throw new Error(dataWallet.message)
      if (!dataHistorial.success) throw new Error(dataHistorial.message)

      const w = dataWallet.data
      setWallet({
        id_wallet: w.id_wallet,
        saldo: w.saldo,
        categoria: w.categoria,
        limite_diario: w.limite_diario,
        consumo_dia: w.consumo_dia,
        disponible_hoy: w.disponible_hoy,
        fecha_ultima_recarga: w.fecha_ultima_recarga,
        fecha_creacion: w.fecha_creacion,
      })

      setHistorial(dataHistorial.data)
    } catch (err: any) {
      console.error("Error al cargar billetera:", err)
      setError(err.message || "Error al cargar la información del wallet.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  // --------------------------------------------------------
  // Recargar saldo + refrescar automáticamente historial
  // --------------------------------------------------------
  const handleRecharge = async () => {
    try {
      setError(null)
      setMensaje(null)
      const valor = Number(rechargeAmount)
      if (isNaN(valor) || valor <= 0) throw new Error("Monto inválido. Debe ser mayor que 0.")

      setLoadingRecarga(true)
      const res = await fetch("http://localhost:3000/api/trader/wallet/recargar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ monto: valor }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      setMensaje(data.message)
      setRechargeAmount("")
      setIsDialogOpen(false)

      //Actualizar wallet e historial inmediatamente
      await fetchWalletData()
    } catch (err: any) {
      setError(err.message || "Error al procesar la recarga.")
    } finally {
      setLoadingRecarga(false)
    }
  }

  // --------------------------------------------------------
  // Utilidades
  // --------------------------------------------------------
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v)

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "JUNIOR": return "bg-blue-100 text-blue-700"
      case "MID": return "bg-purple-100 text-purple-700"
      case "SENIOR": return "bg-amber-100 text-amber-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const handleBackToDashboard = () => router.push("/trader")

  if (loading) return <div className="p-10 text-center text-muted-foreground">Cargando billetera...</div>
  if (error) return <div className="p-10 text-center text-red-500 font-semibold"> {error}</div>

  const consumptionPercentage = (wallet!.consumo_dia / wallet!.limite_diario) * 100

  // --------------------------------------------------------
  // Render
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">Mi Billetera</span>
            </div>
          </div>
          <Button onClick={handleBackToDashboard} variant="outline" className="h-10 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Card principal */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Saldo Disponible</CardTitle>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(wallet!.categoria)}`}>
                  {wallet!.categoria.toUpperCase()}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Efectivo disponible</p>
                <p className="text-4xl font-bold">{formatCurrency(wallet!.saldo)}</p>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Límite diario</p>
                  <p className="text-xl font-semibold">{formatCurrency(wallet!.limite_diario)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consumo del día</p>
                  <p className="text-xl font-semibold">{formatCurrency(wallet!.consumo_dia)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consumo diario</span>
                  <span className="font-semibold">{consumptionPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      consumptionPercentage > 80 ? "bg-red-500" :
                      consumptionPercentage > 50 ? "bg-yellow-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(consumptionPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Dialog Recarga */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 text-base" size="lg">
                    <TrendingUp className="w-5 h-5 mr-2" /> Recargar Saldo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recargar Saldo</DialogTitle>
                    <DialogDescription>Ingresa el monto a recargar en tu billetera.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-12 text-lg"
                    />
                  </div>
                  {error && <div className="text-red-600 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}
                  {mensaje && <div className="text-green-600 text-sm"> {mensaje}</div>}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleRecharge} disabled={!rechargeAmount || loadingRecarga}>
                      {loadingRecarga ? "Procesando..." : "Confirmar Recarga"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/*Historial de recargas */}
          <Card>
            <CardHeader><CardTitle>Historial de Recargas</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto (USD)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historial.length > 0 ? (
                    historial.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.fecha}</TableCell>
                        <TableCell>{formatCurrency(r.monto)}</TableCell>
                        <TableCell>
                          <Badge className={r.estado === "completado" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}>
                            {r.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.descripcion}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No hay recargas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
