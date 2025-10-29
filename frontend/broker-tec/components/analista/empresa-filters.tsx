"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Market, Company } from "@/lib/data-context"

interface EmpresaFiltersProps {
  markets: Market[]
  companies: Company[]
  selectedMarketId: string
  selectedCompanyId: string
  startDate: string
  endDate: string
  dateError: string
  onMarketChange: (value: string) => void
  onCompanyChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export function EmpresaFilters({
  markets,
  companies,
  selectedMarketId,
  selectedCompanyId,
  startDate,
  endDate,
  dateError,
  onMarketChange,
  onCompanyChange,
  onStartDateChange,
  onEndDateChange,
}: EmpresaFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Mercado</Label>
            <Select value={selectedMarketId} onValueChange={onMarketChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mercado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los mercados</SelectItem>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.ticker} - {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Fecha Fin</Label>
            <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
          </div>
        </div>

        {dateError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dateError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
