"use client"

import { useState, useEffect, useRef } from "react"
import { useData, type Market } from "@/lib/data-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge" // added Badge import for enabled status

interface MarketsTableProps {
  onEdit: (market: Market) => void
}

export function MarketsTable({ onEdit }: MarketsTableProps) {
  const { deleteMarket, getMarkets, markets } = useData()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [marketToDelete, setMarketToDelete] = useState<Market | null>(null)
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    getMarkets().catch((e) => console.error("getMarkets failed", e))
  }, [getMarkets])

  const handleDeleteClick = (market: Market) => {
    setMarketToDelete(market)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (marketToDelete) {
      deleteMarket(marketToDelete.id)
      setDeleteDialogOpen(false)
      setMarketToDelete(null)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {markets.map((market) => (
            <TableRow key={market.id}>
              <TableCell className="font-medium">{market.name}</TableCell>
              <TableCell>
                <Badge variant={market.enabled ? "default" : "secondary"}>
                  {market.enabled ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </TableCell>
              <TableCell>{market.createdAt.toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(market)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(market)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el mercado "{marketToDelete?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
