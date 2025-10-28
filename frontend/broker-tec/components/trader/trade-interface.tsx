"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, TrendingUp, Wallet } from "lucide-react"

export default function TradeInterface() {
  const router = useRouter()
  const { id } = useParams() // ID de empresa

  const [company, setCompany] = useState<any>(null)
  const [quantity, setQuantity] = useState<string>("")
  const [userBalance, setUserBalance] = useState<number>(0)
  const [userShares, setUserShares] = useState<number>(0)
  const [validationMessage, setValidationMessage] = useState<string>("")
  const [validationType, setValidationType] = useState<"error" | "success" | "">("")
  const [isLoading, setIsLoading] = useState(true)

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  const id_user = typeof window !== "undefined" ? localStorage.getItem("user_id") : null

  // -------------------------------------------------------------
  // Cargar datos del trader: empresa, wallet, posición
  // -------------------------------------------------------------
  const fetchTraderData = async () => {
    try {
      if (!token || !id_user) {
        setValidationMessage("Sesión expirada. Inicia sesión nuevamente.")
        setValidationType("error")
        setTimeout(() => router.push("/"), 2000)
        return
      }

      // Obtener datos de la empresa
      const empresaRes = await fetch(`http://localhost:3000/api/trader/empresas/${id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const empresaJson = await empresaRes.json()
      if (!empresaJson.success) throw new Error(empresaJson.message)
      setCompany(empresaJson.data)

      // Obtener wallet
      const walletRes = await fetch("http://localhost:3000/api/trader/wallet", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const walletJson = await walletRes.json()
      if (walletJson.success && walletJson.data) setUserBalance(walletJson.data.saldo || 0)

      // Obtener posición del trader en la empresa
      const posRes = await fetch(
        `http://localhost:3000/api/trader/posicion/${id_user}/${id}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      )
      const posJson = await posRes.json()
      if (posJson.success && posJson.data) setUserShares(posJson.data.cantidad || 0)

      setIsLoading(false)
    } catch (err: any) {
      console.error(" Error al cargar datos del trader:", err)
      setValidationMessage(err.message || "Error al cargar datos.")
      setValidationType("error")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTraderData()
  }, [id])

  // -------------------------------------------------------------
  // Función para comprar o vender
  // -------------------------------------------------------------
  const executeTrade = async (tipo: "comprar" | "vender") => {
    try {
      const cantidad = Number(quantity)
      if (!token) throw new Error("Token no disponible. Inicia sesión nuevamente.")
      if (!cantidad || cantidad <= 0) throw new Error("Por favor ingresa una cantidad válida.")

      const endpoint =
        tipo === "comprar"
          ? "http://localhost:3000/api/trader/trading/comprar"
          : "http://localhost:3000/api/trader/trading/vender"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_empresa: Number(id), cantidad }),
      })

      const data = await response.json()

      if (!response.ok || !data.success)
        throw new Error(data.message || "Error en la operación.")

      //  Éxito
      setValidationMessage(data.message || "Operación realizada con éxito.")
      setValidationType("success")

      //  Refrescar datos del trader (wallet + posición)
      await fetchTraderData()
      setQuantity("")
    } catch (err: any) {
      console.error("Error en la operación:", err)
      setValidationMessage(err.message || `Error al realizar la ${tipo}.`)
      setValidationType("error")
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(value)

  const totalCost = quantity && company ? Number(quantity) * company.precio_actual : 0

  // -------------------------------------------------------------
  //  Renderizado condicional
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Cargando datos...
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        No se encontró información de la empresa.
      </div>
    )
  }

  // -------------------------------------------------------------
  //  Render principal
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Operar</h1>
              <p className="text-sm text-muted-foreground">
                {company.nombre}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/trader/company/${id}`)}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-3">
          {/* Panel izquierdo */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="w-5 h-5 text-primary" />
                  Saldo Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(userBalance)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Acciones Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{userShares}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Precio Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(company.precio_actual)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Realizar Operación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Cantidad de Acciones</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-14 text-2xl font-semibold"
                  />
                </div>

                {quantity && Number(quantity) > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cantidad:</span>
                      <span>{quantity} acciones</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Precio unitario:</span>
                      <span>{formatCurrency(company.precio_actual)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span>{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                )}

                {validationMessage && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      validationType === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{validationMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button
                    onClick={() => executeTrade("comprar")}
                    size="lg"
                    className="h-14 text-base font-semibold bg-green-600 hover:bg-green-700 text-white"
                  >
                    Comprar
                  </Button>
                  <Button
                    onClick={() => executeTrade("vender")}
                    size="lg"
                    variant="destructive"
                    className="h-14 text-base font-semibold"
                  >
                    Vender
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
