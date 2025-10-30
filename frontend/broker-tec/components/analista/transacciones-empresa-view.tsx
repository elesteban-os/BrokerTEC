"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, TrendingUp, TrendingDown, DollarSign, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Transaccion {
  id_auditoria: number
  fecha_hora: string
  accion: string
  alias: string
  cantidad_acciones: number
  precio_operacion: number
  monto_operacion: number
  ganancia_perdida: number | null
  exitosa: boolean
}

interface Resumen {
  total_transacciones: number
  total_compras: number
  total_ventas: number
  volumen_total_acciones: number
  monto_total_operado: number
}

/**
 * Componente para ver transacciones por empresa
 * Permite filtrar por fechas y tipo de operación
 */
export function TransaccionesEmpresaView() {
  const [nombreEmpresa, setNombreEmpresa] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoAccion, setTipoAccion] = useState<string>("TODOS")
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [empresaInfo, setEmpresaInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Función para buscar transacciones
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
      
      // Construir query params
      const params = new URLSearchParams()
      if (fechaInicio) params.append("fecha_inicio", fechaInicio)
      if (fechaFin) params.append("fecha_fin", fechaFin)
      if (tipoAccion !== "TODOS") params.append("tipo_accion", tipoAccion)

      const response = await fetch(
        `/api/analista/reportes/empresa/${encodeURIComponent(nombreEmpresa)}/transacciones?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener transacciones")
      }

      setEmpresaInfo(data.data.empresa)
      setResumen(data.data.resumen)
      setTransacciones(data.data.transacciones)

      toast({
        title: "✅ Reporte generado",
        description: `Se encontraron ${data.data.resumen.total_transacciones} transacciones`,
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Error al cargar transacciones",
        variant: "destructive",
      })
      setTransacciones([])
      setResumen(null)
      setEmpresaInfo(null)
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar filtros
  const handleLimpiar = () => {
    setNombreEmpresa("")
    setFechaInicio("")
    setFechaFin("")
    setTipoAccion("TODOS")
    setTransacciones([])
    setResumen(null)
    setEmpresaInfo(null)
  }

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Nombre de empresa */}
            <div className="lg:col-span-2">
              <Label htmlFor="empresa">Nombre de la Empresa *</Label>
              <Input
                id="empresa"
                placeholder="Ej: Apple Inc."
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>

            {/* Fecha inicio */}
            <div>
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            {/* Fecha fin */}
            <div>
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            {/* Tipo de acción */}
            <div>
              <Label htmlFor="tipo">Tipo de Acción</Label>
              <Select value={tipoAccion} onValueChange={setTipoAccion}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="COMPRA">Compra</SelectItem>
                  <SelectItem value="VENTA">Venta</SelectItem>
                  <SelectItem value="LIQUIDAR_TODO">Liquidación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleBuscar} disabled={loading} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button onClick={handleLimpiar} variant="outline" disabled={loading}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen estadístico */}
      {resumen && empresaInfo && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{empresaInfo.nombre}</div>
              <p className="text-xs text-muted-foreground">
                {empresaInfo.mercado} • ${empresaInfo.precio_actual}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Total Transacciones
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_transacciones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <TrendingUp className="h-4 w-4" />
                Compras
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_compras}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                <TrendingDown className="h-4 w-4" />
                Ventas
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_ventas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Monto Total
              </div>
              <div className="text-2xl font-bold mt-2">
                ${resumen.monto_total_operado.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de transacciones */}
      {transacciones.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Trader (Alias)</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Ganancia/Pérdida</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transacciones.map((t) => (
                    <TableRow key={t.id_auditoria}>
                      <TableCell className="font-mono text-sm">
                        {new Date(t.fecha_hora).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.accion === "COMPRA" ? "default" : "secondary"}>
                          {t.accion}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{t.alias}</TableCell>
                      <TableCell className="text-right">{t.cantidad_acciones}</TableCell>
                      <TableCell className="text-right">${t.precio_operacion?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${t.monto_operacion?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {t.ganancia_perdida !== null ? (
                          <span
                            className={
                              t.ganancia_perdida >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
                            }
                          >
                            ${t.ganancia_perdida.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.exitosa ? "default" : "destructive"}>
                          {t.exitosa ? "Exitosa" : "Fallida"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!loading && transacciones.length === 0 && resumen === null && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay transacciones para mostrar</h3>
              <p className="text-muted-foreground">
                Ingresa el nombre de una empresa y haz clic en "Buscar" para ver su historial
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
