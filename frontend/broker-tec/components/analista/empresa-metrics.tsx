import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EmpresaMetricsProps {
  majorHolder: { alias: string; shares: number }
  treasuryInventory: number
  currentPrice: number
}

export function EmpresaMetrics({ majorHolder, treasuryInventory, currentPrice }: EmpresaMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-ES").format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Mayor Tenedor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{majorHolder.alias}</p>
          <p className="text-sm text-muted-foreground mt-1">{formatNumber(majorHolder.shares)} acciones</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Inventario de Tesorería</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{formatNumber(treasuryInventory)}</p>
          <p className="text-sm text-muted-foreground mt-1">acciones disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Precio Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(currentPrice)}</p>
          <p className="text-sm text-muted-foreground mt-1">por acción</p>
        </CardContent>
      </Card>
    </div>
  )
}
