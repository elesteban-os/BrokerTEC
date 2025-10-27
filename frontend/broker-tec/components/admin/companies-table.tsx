"use client"

import { useEffect, useState, useRef } from "react"
import { useData, type Company, type Market } from "@/lib/data-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, AlertTriangle, History } from "lucide-react"
import { DelistDialog } from "./delist-dialog"
import { PriceHistoryDialog } from "./price-history-dialog"

interface CompaniesTableProps {
  companies: Company[]
  markets: Market[]
  onEdit: (company: Company) => void
  onResult: (result: { success: boolean; message: string }) => void
}

export function CompaniesTable({ companies, markets, onEdit, onResult }: CompaniesTableProps) {
  const { positions, getCompanies, getMarkets, getPriceHistory } = useData()
  const [delistDialogOpen, setDelistDialogOpen] = useState(false)
  const [companyToDelist, setCompanyToDelist] = useState<Company | null>(null)
  const [priceHistoryDialogOpen, setPriceHistoryDialogOpen] = useState(false)
  const [companyForHistory, setCompanyForHistory] = useState<Company | null>(null)
  const calledRef = useRef(false)

  useEffect(() => {
      if (calledRef.current) return
      calledRef.current = true
      getCompanies().catch((e) => console.error("getCompanies failed", e))
      getMarkets().catch((e) => console.error("getMarkets failed", e))
    }, [getCompanies])

  
  const getMarketName = (marketId: string) => {
    return markets.find((m) => m.id === marketId)?.name || "N/A"
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value)
  }

  const getPreviousPrice = (companyId: string, currentPrice: number) => {
    const history = getPriceHistory(companyId)
    if (history.length < 2) return currentPrice
    return history[1].price // Second most recent price
  }

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return change.toFixed(2)
  }

  const hasActivePositions = (companyId: string) => {
    return positions.some((p) => p.companyId === companyId)
  }

  const handleDelistClick = (company: Company) => {
    setCompanyToDelist(company)
    setDelistDialogOpen(true)
  }

  const handleHistoryClick = (company: Company) => {
    setCompanyForHistory(company)
    setPriceHistoryDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Mercado</TableHead>
              <TableHead className="text-right">Precio Actual</TableHead>
              <TableHead className="text-right">Precio Anterior</TableHead>
              <TableHead className="text-right">Cambio %</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
              <TableHead className="text-right">Cap. Mercado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const previousPrice = getPreviousPrice(company.id, company.currentPrice)
              const priceChange = getPriceChange(company.currentPrice, previousPrice)
              const isPositive = Number.parseFloat(priceChange) >= 0
              const hasPositions = hasActivePositions(company.id)

              return (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{getMarketName(company.marketId)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(company.currentPrice)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(previousPrice)}</TableCell>
                  <TableCell className="text-right">
                    <span className={isPositive ? "text-green-600" : "text-red-600"}>
                      {isPositive ? "+" : ""}
                      {priceChange}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(company.totalShares)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(company.marketCap)}</TableCell>
                  <TableCell>
                    <Badge variant={company.enabled ? "default" : "secondary"}>
                      {company.enabled ? "Habilitada" : "Deshabilitada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(company)} title="Editar empresa">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleHistoryClick(company)}
                        title="Ver histórico de precios"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelistClick(company)}
                        className="text-orange-600 hover:text-orange-700"
                        title="Deslistar y eliminar empresa"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {companyToDelist && (
        <DelistDialog
          open={delistDialogOpen}
          onClose={() => {
            setDelistDialogOpen(false)
            setCompanyToDelist(null)
          }}
          company={companyToDelist}
          onResult={onResult}
        />
      )}

      {companyForHistory && (
        <PriceHistoryDialog
          open={priceHistoryDialogOpen}
          onClose={() => {
            setPriceHistoryDialogOpen(false)
            setCompanyForHistory(null)
          }}
          company={companyForHistory}
        />
      )}
    </>
  )
}
