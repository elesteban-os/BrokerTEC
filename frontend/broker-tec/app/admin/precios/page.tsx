"use client"

import { useEffect, useState, useRef } from "react"
import { useData, type Company } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, History, TrendingUp, Edit } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UpdatePriceDialog } from "@/components/admin/update-price-dialog"
import { PriceHistoryDialog } from "@/components/admin/price-history-dialog"
import { PriceChartDialog } from "@/components/admin/price-chart-dialog"
import { BulkPriceDialog } from "@/components/admin/bulk-price-dialog"
import { ResultDialog } from "@/components/admin/result-dialog"

export default function PreciosPage() {
  const { companies, markets, getCompanies, getMarkets, getPriceHistory } = useData()
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showChartDialog, setShowChartDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const calledRef = useRef(false)

  useEffect(() => {
        if (calledRef.current) return
        calledRef.current = true
        getCompanies().catch((e) => console.error("getCompanies failed", e))
        getMarkets().catch((e) => console.error("getMarkets failed", e))
  }, [getCompanies])

  const handleOpenUpdate = (company: Company) => {
    setSelectedCompany(company)
    setShowUpdateDialog(true)
  }

  const handleOpenHistory = (company: Company) => {
    setSelectedCompany(company)
    setShowHistoryDialog(true)
  }

  const handleOpenChart = (company: Company) => {
    setSelectedCompany(company)
    setShowChartDialog(true)
  }

  const handleResult = (result: { success: boolean; message: string }) => {
    setResult(result)
    setShowResultDialog(true)
  }

  const getLastUpdate = (companyId: string) => {
    const history = getPriceHistory(companyId)
    if (history.length === 0) return "Sin actualizaciones"
    return history[0].timestamp.toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Precios y Carga</h1>
          <p className="text-muted-foreground">Gestiona y valida precios de empresas</p>
        </div>
        <Button onClick={() => setShowBulkDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Carga Múltiple
        </Button>
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
                <TableHead>Mercado</TableHead>
                <TableHead className="text-right">Precio Actual</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => {
                const market = markets.find((m) => m.id === company.marketId)
                return (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{market?.name}</TableCell>
                    <TableCell className="text-right font-mono">${company.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getLastUpdate(company.id)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenUpdate(company)}
                          title="Actualizar precio"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenHistory(company)}
                          title="Ver histórico"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenChart(company)}
                          title="Ver gráfico"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCompany && (
        <>
          <UpdatePriceDialog
            open={showUpdateDialog}
            onClose={() => setShowUpdateDialog(false)}
            company={selectedCompany}
            onResult={handleResult}
          />
          <PriceHistoryDialog
            open={showHistoryDialog}
            onClose={() => setShowHistoryDialog(false)}
            company={selectedCompany}
          />
          <PriceChartDialog
            open={showChartDialog}
            onClose={() => setShowChartDialog(false)}
            company={selectedCompany}
          />
        </>
      )}

      <BulkPriceDialog open={showBulkDialog} onClose={() => setShowBulkDialog(false)} onResult={handleResult} />

      <ResultDialog open={showResultDialog} onClose={() => setShowResultDialog(false)} result={result} />
    </div>
  )
}
