"use client"

import { useState } from "react"
import { useData, type Company } from "@/lib/data-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PriceChartDialogProps {
  open: boolean
  onClose: () => void
  company: Company
}

export function PriceChartDialog({ open, onClose, company }: PriceChartDialogProps) {
  const { getPriceHistory } = useData()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const allHistory = getPriceHistory(company.id).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  // Filter by date range if provided
  const filteredHistory = allHistory.filter((record) => {
    const recordDate = record.timestamp
    if (startDate && recordDate < new Date(startDate)) return false
    if (endDate && recordDate > new Date(endDate)) return false
    return true
  })

  const chartData = filteredHistory.map((record) => ({
    time: record.timestamp.toLocaleDateString("es-MX", { month: "short", day: "numeric" }),
    precio: record.price,
  }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gráfico de Precios - {company.name}</DialogTitle>
          <DialogDescription>Histórico de precios en el tiempo</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Desde</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Hasta</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="h-80 border rounded-lg p-4">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos disponibles para el rango seleccionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: "Tiempo", position: "insideBottom", offset: -5 }} />
                  <YAxis
                    label={{ value: "Precio (USD)", angle: -90, position: "insideLeft" }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Precio"]} />
                  <Line
                    type="monotone"
                    dataKey="precio"
                    stroke="black"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
