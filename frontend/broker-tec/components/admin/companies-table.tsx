"use client"

import { useState } from "react"
import { useData, type Company, type Market } from "@/lib/data-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, AlertTriangle } from "lucide-react"
import { DelistDialog } from "./delist-dialog"

interface CompaniesTableProps {
  companies: Company[]
  markets: Market[]
  onEdit: (company: Company) => void
}

export function CompaniesTable({ companies, markets, onEdit }: CompaniesTableProps) {
  const { deleteCompany, positions } = useData()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [delistDialogOpen, setDelistDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [companyToDelist, setCompanyToDelist] = useState<Company | null>(null)

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

  const getPriceChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return change.toFixed(2)
  }

  const hasActivePositions = (companyId: string) => {
    return positions.some((p) => p.companyId === companyId)
  }

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const handleDelistClick = (company: Company) => {
    setCompanyToDelist(company)
    setDelistDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (companyToDelete) {
      deleteCompany(companyToDelete.id)
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
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
              const priceChange = getPriceChange(company.currentPrice, company.previousPrice)
              const isPositive = Number.parseFloat(priceChange) >= 0
              const hasPositions = hasActivePositions(company.id)

              return (
                <TableRow key={company.id}>
                  <TableCell className="font-bold">{company.ticker}</TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{getMarketName(company.marketId)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(company.currentPrice)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(company.previousPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={isPositive ? "text-green-600" : "text-red-600"}>
                      {isPositive ? "+" : ""}
                      {priceChange}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(company.totalShares)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(company.marketCap)}</TableCell>
                  <TableCell>
                    <Badge variant={company.isActive ? "default" : "secondary"}>
                      {company.isActive ? "Activa" : "Deslistada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(company)} disabled={!company.isActive}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {company.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelistClick(company)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(company)}
                        disabled={hasPositions}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la empresa "{companyToDelete?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {companyToDelist && (
        <DelistDialog
          open={delistDialogOpen}
          onClose={() => {
            setDelistDialogOpen(false)
            setCompanyToDelist(null)
          }}
          company={companyToDelist}
        />
      )}
    </>
  )
}
