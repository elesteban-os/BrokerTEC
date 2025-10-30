"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, User, TrendingUp, TrendingDown, DollarSign, Building2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Transaccion {
  id_auditoria: number
  fecha_hora: string
  accion: string
  ticker_empresa: string
  cantidad_acciones: number
  precio_operacion: number
  monto_operacion: number
  ganancia_perdida: number | null
  saldo_anterior: number
  saldo_nuevo: number
  exitosa: boolean
}

interface DetalleEmpresa {
  ticker: string
  compras: number
  ventas: number
  volumen_acciones: number
  monto_operado: number
}

/**
 * Componente para ver transacciones por usuario (alias)
 * Muestra el comportamiento de trading de un trader específico
 */
export function TransaccionesUsuarioView() {
  const [alias, setAlias] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [tipoAccion, setTipoAccion] = useState<string>("TODOS")
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [usuario, setUsuario] = useState<any>(null)
  const [resumen, setResumen] = useState<any>(null)
  const [detalleEmpresas, setDetalleEmpresas] = useState<DetalleEmpresa[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Función para buscar transacciones
  const handleBuscar = async () => {
    if (!alias.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa el alias del usuario",
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
        `/api/analista/reportes/usuario/${encodeURIComponent(alias)}/transacciones?${params}`,
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

      setUsuario(data.data.usuario)
      setResumen(data.data.resumen)
      setDetalleEmpresas(data.data.detalle_por_empresa)
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
      setUsuario(null)
      setDetalleEmpresas([])
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar filtros
  const handleLimpiar = () => {
    setAlias("")
    setFechaInicio("")
    setFechaFin("")
    setTipoAccion("TODOS")
    setTransacciones([])
    setResumen(null)
    setUsuario(null)
    setDetalleEmpresas([])
  }

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Alias del usuario */}
            <div className="lg:col-span-2">
              <Label htmlFor="alias">Alias del Usuario (Trader) *</Label>
              <Input
                id="alias"
                placeholder="Ej: trader_junior"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
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

      {/* Información del usuario y resumen */}
      {resumen && usuario && (
        <>
          {/* Resumen estadístico */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Usuario
                </div>
                <div className="text-2xl font-bold mt-2">{usuario.alias}</div>
                <p className="text-xs text-muted-foreground">{usuario.nombre}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Total Transacciones</div>
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
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium">Ganancia/Pérdida</div>
                <div
                  className={`text-2xl font-bold mt-2 ${
                    resumen.ganancia_perdida_total >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${resumen.ganancia_perdida_total.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalle por empresa */}
          {detalleEmpresas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Actividad por Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead className="text-center">Compras</TableHead>
                        <TableHead className="text-center">Ventas</TableHead>
                        <TableHead className="text-right">Volumen (Acciones)</TableHead>
                        <TableHead className="text-right">Monto Operado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detalleEmpresas.map((detalle, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{detalle.ticker}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default">{detalle.compras}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{detalle.ventas}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{detalle.volumen_acciones}</TableCell>
                          <TableCell className="text-right">
                            ${detalle.monto_operado.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tabla de transacciones */}
      {transacciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Saldo Nuevo</TableHead>
                    <TableHead className="text-right">Ganancia/Pérdida</TableHead>
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
                      <TableCell className="font-medium">{t.ticker_empresa}</TableCell>
                      <TableCell className="text-right">{t.cantidad_acciones}</TableCell>
                      <TableCell className="text-right">${t.precio_operacion?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${t.monto_operacion?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${t.saldo_nuevo?.toFixed(2)}</TableCell>
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
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay transacciones para mostrar</h3>
              <p className="text-muted-foreground">
                Ingresa el alias de un trader y haz clic en "Buscar" para ver su historial
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
