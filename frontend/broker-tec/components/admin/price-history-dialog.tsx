"use client"

import { useData, type Company } from "@/lib/data-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface PriceHistoryDialogProps {
  open: boolean
  onClose: () => void
  company: Company
}

export function PriceHistoryDialog({ open, onClose, company }: PriceHistoryDialogProps) {
  const { getPriceHistory } = useData()
  const history = getPriceHistory(company.id)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Precios - {company.name}</DialogTitle>
          <DialogDescription>Registro completo de precios cargados para esta empresa</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead className="text-right">Precio (USD)</TableHead>
                <TableHead>Método de Carga</TableHead>
                <TableHead>Cargado Por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay histórico de precios disponible
                  </TableCell>
                </TableRow>
              ) : (
                history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDateTime(record.timestamp)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(record.price)}</TableCell>
                    <TableCell>
                      <Badge variant={record.loadMethod === "api" ? "default" : "secondary"}>
                        {record.loadMethod === "api" ? "API" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.loadedBy}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
