"use client"

import { useState, useEffect, useRef } from "react"
import { useData, type Market } from "@/lib/data-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DisableMarketDialog } from "./disable-market-dialog"
import { useToast } from "@/hooks/use-toast"

interface MarketsTableProps {
  onEdit: (market: Market) => void
}

export function MarketsTable({ onEdit }: MarketsTableProps) {
  const { disableMarket, getMarkets, markets } = useData()
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [marketToDisable, setMarketToDisable] = useState<Market | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    getMarkets().catch((e) => console.error("getMarkets failed", e))
  }, [getMarkets])

  const handleDisableClick = (market: Market) => {
    setMarketToDisable(market)
    setDisableDialogOpen(true)
  }

  const handleConfirmDisable = async (reason: string) => {
    if (!marketToDisable) return

    setIsLoading(true)
    try {
      const result = await disableMarket(marketToDisable.id, reason)
      
      if (result.success) {
        toast({
          title: " Mercado deshabilitado",
          description: result.message,
          variant: "default",
        })
        setDisableDialogOpen(false)
        setMarketToDisable(null)
      } else {
        toast({
          title: " Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: " Error",
        description: "Ocurrió un error al deshabilitar el mercado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDisableClick(market)}
                    disabled={!market.enabled}
                    title={market.enabled ? "Deshabilitar mercado" : "Mercado ya deshabilitado"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DisableMarketDialog
        open={disableDialogOpen}
        onOpenChange={setDisableDialogOpen}
        marketName={marketToDisable?.name || ""}
        onConfirm={handleConfirmDisable}
        isLoading={isLoading}
      />
    </>
  )
}
