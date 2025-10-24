"use client"

import { useState } from "react"
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

export function WalletPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [rechargeAmount, setRechargeAmount] = useState("")

  // Mock data
  const currentBalance = 15750.5
  const category = "mid" // junior, mid, senior
  const dailyLimit = 50000
  const dailyConsumption = 8250.75

  const rechargeHistory: RechargeHistory[] = [
    { id: "1", date: "2024-01-15 14:30", amount: 10000, status: "completado" },
    { id: "2", date: "2024-01-10 09:15", amount: 5000, status: "completado" },
    { id: "3", date: "2024-01-08 16:45", amount: 7500, status: "completado" },
    { id: "4", date: "2024-01-05 11:20", amount: 3000, status: "pendiente" },
    { id: "5", date: "2024-01-03 13:00", amount: 2500, status: "rechazado" },
  ]

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completado":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            Completado
          </Badge>
        )
      case "pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
            Pendiente
          </Badge>
        )
      case "rechazado":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">Rechazado</Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const handleRecharge = () => {
    console.log("Recarga solicitada:", rechargeAmount)
    setRechargeAmount("")
    setIsDialogOpen(false)
    // TODO: Implement recharge logic
  }

  const handleBackToDashboard = () => {
    router.back()
    // TODO: Implement navigation
  }

  const consumptionPercentage = (dailyConsumption / dailyLimit) * 100

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
              <p className="text-sm text-muted-foreground">Trader: fernanda1</p>
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
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(category)}`}>
                  {category.toUpperCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Current Balance */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Efectivo disponible</p>
                  <p className="text-4xl font-bold text-foreground">{formatCurrency(currentBalance)}</p>
                </div>

                <Separator />

                {/* Daily Limits */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Límite diario</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(dailyLimit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Consumo del día</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(dailyConsumption)}</p>
                  </div>
                </div>

                {/* Consumption Progress Bar */}
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
                        <p className="text-xs text-muted-foreground">Saldo actual: {formatCurrency(currentBalance)}</p>
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
                  {rechargeHistory.map((recharge) => (
                    <TableRow key={recharge.id}>
                      <TableCell className="font-medium">{recharge.date}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(recharge.amount)}</TableCell>
                      <TableCell className="text-right">{getStatusBadge(recharge.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
