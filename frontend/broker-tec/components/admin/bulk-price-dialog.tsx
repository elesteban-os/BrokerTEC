"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"

interface BulkPriceDialogProps {
  open: boolean
  onClose: () => void
  onResult: (result: { success: boolean; message: string }) => void
}

interface PriceRow {
  id: string
  companyId: string
  price: string
}

export function BulkPriceDialog({ open, onClose, onResult }: BulkPriceDialogProps) {
  const { companies, loadMultiplePrices } = useData()
  const [rows, setRows] = useState<PriceRow[]>([{ id: "1", companyId: "", price: "" }])
  const [isLoading, setIsLoading] = useState(false)

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), companyId: "", price: "" }])
  }

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id))
    }
  }

  const updateRow = (id: string, field: "companyId" | "price", value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id !== id) return row

        if (field === "companyId") {
          // when a company is selected, auto-fill the price with its currentPrice
          const company = companies.find((c) => c.id === value)
          return {
            ...row,
            companyId: value,
            price: company ? company.currentPrice.toFixed(2) : "",
          }
        }

        return { ...row, price: value }
      }),
    )
  }

  const handleSubmit = async () => {
    // Validate all rows
    const validRows = rows.filter((row) => row.companyId && row.price)

    if (validRows.length === 0) {
      onResult({ success: false, message: "Agrega al menos una empresa con precio" })
      return
    }

    const prices = validRows.map((row) => ({
      companyId: row.companyId,
      price: Number.parseFloat(row.price),
    }))

    // Check for invalid prices
    const invalidPrice = prices.find((p) => isNaN(p.price) || p.price <= 0)
    if (invalidPrice) {
      onResult({ success: false, message: "precio inválido" })
      return
    }

    setIsLoading(true)
    const result = await loadMultiplePrices(prices)
    setIsLoading(false)

    onResult(result)
    if (result.success) {
      setRows([{ id: "1", companyId: "", price: "" }])
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carga Múltiple de Precios</DialogTitle>
          <DialogDescription>Carga precios para múltiples empresas a la vez</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Precio (USD)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Select value={row.companyId} onValueChange={(value) => updateRow(row.id, "companyId", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies
                            .filter((c) => !rows.some((r2) => r2.companyId === c.id && r2.id !== row.id))
                            .map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.00"
                        value={row.price}
                        onChange={(e) => updateRow(row.id, "price", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" onClick={addRow} className="w-full bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Empresa
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Cargando..." : "Cargar Precios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
