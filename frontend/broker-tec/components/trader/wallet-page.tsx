"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Wallet, TrendingUp } from "lucide-react"

interface RechargeHistory {
  id: string
  date: string
  amount: number
  status: "completado" | "pendiente" | "rechazado"
}

interface WalletData {
  balance: number
  category: string
  dailyLimit: number
  dailyConsumption: number
  rechargeHistory: RechargeHistory[]
}

export function WalletPage() {
  const router = useRouter()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Obtener los datos reales de la API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setError("No se encontró token de sesión. Inicia sesión nuevamente.")
          setLoading(false)
          return
        }

        const res = await fetch("http://localhost:3000/api/trader/wallet", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) throw new Error("Error al obtener datos de la billetera")

        const data = await res.json()

        // 🔧 Ajusta los nombres según lo que devuelva tu backend
        setWallet({
          balance: data.balance ?? 0,
          category: data.category ?? "mid",
          dailyLimit: data.dailyLimit ?? 50000,
          dailyConsumption: data.dailyConsumption ?? 0,
          rechargeHistory: data.rechargeHistory ?? [],
        })
      } catch (err: any) {
        console.error("Error al cargar billetera:", err)
        setError(err.message || "Error al cargar la información de la billetera.")
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "junior":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "mid":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "senior":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const handleRecharge = () => {
    console.log("Recarga solicitada:", rechargeAmount)
    setRechargeAmount("")
    setIsDialogOpen(false)
    // TODO: implementar POST /api/trader/wallet/recharge
  }

  const handleBackToDashboard = () => {
    router.push("/trader")
  }

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Cargando billetera...</div>

  if (error)
    return <div className="p-10 text-center text-red-500 font-semibold">{error}</div>

  const consumptionPercentage = (wallet!.dailyConsumption / wallet!.dailyLimit) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">Mi Billetera</span>
              <p className="text-sm text-muted-foreground">Trader: {userAlias}</p>
            </div>
          </div>
          <Button onClick={handleBackToDashboard} variant="outline" className="h-10 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Balance Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Saldo Disponible</CardTitle>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(wallet!.category)}`}>
                  {wallet!.category.toUpperCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Current Balance */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Efectivo disponible</p>
                  <p className="text-4xl font-bold text-foreground">{formatCurrency(wallet!.balance)}</p>
                </div>

                <Separator />

                {/* Daily Limits */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Límite diario</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(wallet!.dailyLimit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Consumo del día</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(wallet!.dailyConsumption)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consumo diario</span>
                    <span className="font-semibold text-foreground">{consumptionPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        consumptionPercentage > 80
                          ? "bg-red-500"
                          : consumptionPercentage > 50
                          ? "bg-yellow-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(consumptionPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Recharge Button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 text-base" size="lg">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Recargar Saldo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Recargar Saldo</DialogTitle>
                      <DialogDescription>Ingresa el monto que deseas recargar a tu billetera.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Monto a recargar</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          className="h-12 text-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          Saldo actual: {formatCurrency(wallet!.balance)}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRecharge}
                        disabled={!rechargeAmount || Number.parseFloat(rechargeAmount) <= 0}
                      >
                        Confirmar Recarga
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Recharge History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Recargas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallet!.rechargeHistory.length > 0 ? (
                    wallet!.rechargeHistory.map((recharge) => (
                      <TableRow key={recharge.id}>
                        <TableCell className="font-medium">{recharge.date}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(recharge.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge>{recharge.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
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
