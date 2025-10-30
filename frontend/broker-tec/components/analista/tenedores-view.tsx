"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Trophy, User, Building2, TrendingUp, Percent } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Tenedor {
  alias: string
  cantidad_acciones: number
  porcentaje_total: number
  tipo: string
}

/**
 * Componente para ver el ranking de tenedores de una empresa específica
 * Muestra quiénes son los mayores accionistas de una compañía
 */
export function TenedoresView() {
  const [nombreEmpresa, setNombreEmpresa] = useState("")
  const [empresa, setEmpresa] = useState<any>(null)
  const [tenedores, setTenedores] = useState<Tenedor[]>([])
  const [resumen, setResumen] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Función para buscar tenedores
  const handleBuscar = async () => {
    if (!nombreEmpresa.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa el nombre de la empresa",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(
        `/api/analista/reportes/empresa/${encodeURIComponent(nombreEmpresa)}/tenedores`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener tenedores")
      }

      setEmpresa(data.data.empresa)
      setTenedores(data.data.tenedores)
      
      // Crear resumen calculado del mayor tenedor
      const mayorTenedor = data.data.mayor_tenedor || data.data.tenedores[0]
      setResumen({
        total_tenedores: data.data.tenedores.length,
        total_acciones: data.data.empresa.total_acciones,
        mayor_tenedor_alias: mayorTenedor?.alias || "N/A",
        mayor_tenedor_porcentaje: mayorTenedor?.porcentaje || mayorTenedor?.porcentaje_total || 0
      })

      toast({
        title: "✅ Reporte generado",
        description: `Se encontraron ${data.data.tenedores.length} tenedores`,
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Error al cargar tenedores",
        variant: "destructive",
      })
      setEmpresa(null)
      setTenedores([])
      setResumen(null)
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar filtros
  const handleLimpiar = () => {
    setNombreEmpresa("")
    setEmpresa(null)
    setTenedores([])
    setResumen(null)
  }

  // Función para obtener el color del badge según el ranking
  const getBadgeVariant = (ranking: number) => {
    if (ranking === 1) return "default" // Oro
    if (ranking === 2) return "secondary" // Plata
    if (ranking === 3) return "outline" // Bronce
    return "outline"
  }

  // Función para obtener el ícono según el ranking
  const getRankingIcon = (ranking: number) => {
    if (ranking <= 3) {
      return <Trophy className="h-4 w-4" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Nombre de la empresa */}
            <div className="md:col-span-2">
              <Label htmlFor="empresa">Nombre de la Empresa *</Label>
              <Input
                id="empresa"
                placeholder="Ej: Microsoft"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>

            {/* Botones de acción */}
            <div className="md:col-span-2 flex gap-2 items-end">
              <Button onClick={handleBuscar} disabled={loading} className="flex-1 flex items-center gap-2">
                <Search className="h-4 w-4" />
                {loading ? "Buscando..." : "Buscar"}
              </Button>
              <Button onClick={handleLimpiar} variant="outline" disabled={loading}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de la empresa y resumen */}
      {empresa && resumen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Empresa
              </div>
              <div className="text-2xl font-bold mt-2">{empresa.nombre}</div>
              <p className="text-xs text-muted-foreground">
                {empresa.acciones_disponibles?.toLocaleString()} acciones disponibles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                Total Tenedores
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_tenedores}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Acciones en Circulación
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_acciones?.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Mayor Tenedor
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.mayor_tenedor_alias}</div>
              <p className="text-xs text-muted-foreground">
                {resumen.mayor_tenedor_porcentaje?.toFixed(2)}% del total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de tenedores */}
      {tenedores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Ranking de Accionistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 text-center">Ranking</TableHead>
                    <TableHead>Alias / Tenedor</TableHead>
                    <TableHead className="text-right">Cantidad de Acciones</TableHead>
                    <TableHead className="text-right">% Tenencia</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenedores.map((tenedor, index) => {
                    const ranking = index + 1
                    return (
                      <TableRow key={index} className={ranking <= 3 ? "bg-muted/50" : ""}>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getRankingIcon(ranking)}
                            <span className="text-lg font-bold">{ranking}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tenedor.alias}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {tenedor.cantidad_acciones.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">{tenedor.porcentaje_total.toFixed(2)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getBadgeVariant(ranking)}>
                            {ranking === 1 && "🥇 Líder"}
                            {ranking === 2 && "🥈 Segundo"}
                            {ranking === 3 && "🥉 Tercero"}
                            {ranking > 3 && tenedor.tipo === "TESORERIA" ? "🏦 Tesorería" : `Top ${ranking}`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Análisis de concentración */}
            {resumen && (
              <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
                <h4 className="font-semibold text-sm">📊 Análisis de Concentración</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Tenedores:</span>{" "}
                    <span className="font-bold">{resumen.total_tenedores}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Acciones:</span>{" "}
                    <span className="font-bold">{resumen.total_acciones?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mayor Concentración:</span>{" "}
                    <span className="font-bold">{resumen.mayor_tenedor_porcentaje?.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!loading && tenedores.length === 0 && empresa === null && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay tenedores para mostrar</h3>
              <p className="text-muted-foreground">
                Ingresa el nombre de una empresa y haz clic en "Buscar" para ver su ranking de accionistas
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
