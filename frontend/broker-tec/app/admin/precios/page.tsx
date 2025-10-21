"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Download, RefreshCw, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PreciosPage() {
  const { companies, markets, priceHistory, addPriceHistory, loadPricesFromAPI } = useData()
  const { toast } = useToast()
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [manualPrice, setManualPrice] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoadingAPI, setIsLoadingAPI] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)
  const [showAPIDialog, setShowAPIDialog] = useState(false)
  const [showChartDialog, setShowChartDialog] = useState(false)

  const handleManualLoad = () => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Selecciona una empresa",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(manualPrice)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "precio inválido",
        variant: "destructive",
      })
      return
    }

    const now = new Date()
    if (isNaN(now.getTime())) {
      toast({
        title: "Error",
        description: "formato de fecha inválido",
        variant: "destructive",
      })
      return
    }

    addPriceHistory({
      companyId: selectedCompany,
      price,
      timestamp: now,
      loadedBy: "admin",
      loadMethod: "manual",
    })

    toast({
      title: "Éxito",
      description: "Precio cargado manualmente",
    })

    setShowManualDialog(false)
    setManualPrice("")
    setSelectedCompany("")
  }

  const handleAPILoad = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Ingresa la API key",
        variant: "destructive",
      })
      return
    }

    setIsLoadingAPI(true)
    const result = await loadPricesFromAPI(apiKey)
    setIsLoadingAPI(false)

    if (result.success) {
      toast({
        title: "Éxito",
        description: result.message,
      })
      setShowAPIDialog(false)
      setApiKey("")
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const getCompanyPriceHistory = (companyId: string) => {
    return priceHistory
      .filter((p) => p.companyId === companyId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((p) => ({
        time: p.timestamp.toLocaleString(),
        price: p.price,
      }))
  }

  const getLastUpdate = (companyId: string) => {
    const history = priceHistory.filter((p) => p.companyId === companyId)
    if (history.length === 0) return "Sin actualizaciones"
    const latest = history.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
    return latest.timestamp.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Precios y Carga</h1>
          <p className="text-muted-foreground">Gestiona y valida precios de empresas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
            <DialogTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Carga Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carga Manual de Precio</DialogTitle>
                <DialogDescription>Ingresa el precio actual de una empresa</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Empresa</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.ticker})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Precio (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowManualDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleManualLoad}>Cargar Precio</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAPIDialog} onOpenChange={setShowAPIDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Carga por API
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carga de Precios por API</DialogTitle>
                <DialogDescription>
                  Ingresa la API key de administrador para cargar precios automáticamente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="ADMIN_API_KEY"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Usa: ADMIN_API_KEY para esta demo</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAPIDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAPILoad} disabled={isLoadingAPI}>
                  {isLoadingAPI ? "Cargando..." : "Cargar Precios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas y Precios Actuales</CardTitle>
          <CardDescription>Listado de empresas con último precio y fecha de actualización</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Mercado</TableHead>
                <TableHead className="text-right">Precio Actual</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-center">Gráfico</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => {
                const market = markets.find((m) => m.id === company.marketId)
                return (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.ticker}</TableCell>
                    <TableCell>{market?.name}</TableCell>
                    <TableCell className="text-right font-mono">${company.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getLastUpdate(company.id)}</TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              {company.name} ({company.ticker})
                            </DialogTitle>
                            <DialogDescription>Histórico de precios</DialogDescription>
                          </DialogHeader>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getCompanyPriceHistory(company.id)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis domain={["auto", "auto"]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="price" stroke="rgba(1, 63, 96, 1)" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
