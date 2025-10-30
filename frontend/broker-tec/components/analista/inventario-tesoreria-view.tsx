"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vault, Building2, TrendingUp, DollarSign, Package } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ItemInventario {
  nombre: string
  mercado: string
  acciones_disponibles: number
  precio_actual: number
  valor_inventario: number
}

interface Mercado {
  id_mercado: number
  nombre: string
}

/**
 * Componente para ver el inventario de acciones en la Tesorería
 * Muestra las acciones disponibles (no vendidas) por empresa en cada mercado
 */
export function InventarioTesoreriaView() {
  const [mercados, setMercados] = useState<Mercado[]>([])
  const [mercadoSeleccionado, setMercadoSeleccionado] = useState<string>("")
  const [inventario, setInventario] = useState<ItemInventario[]>([])
  const [resumen, setResumen] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Cargar mercados al montar el componente
  useEffect(() => {
    cargarMercados()
  }, [])

  // Función para cargar los mercados disponibles desde el inventario
  const cargarMercados = async () => {
    try {
      const token = localStorage.getItem("authToken")
      
      // Obtener inventario SIN filtro de mercado para obtener todos los mercados
      const response = await fetch("/api/analista/reportes/tesoreria/inventario", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar datos iniciales")
      }

      const data = await response.json()
      
      // Extraer mercados únicos de "por_mercado"
      if (data.data && data.data.por_mercado) {
        const mercadosExtraidos = data.data.por_mercado.map((item: any, index: number) => ({
          id_mercado: index + 1, // Temporal: asignar ID basado en orden
          nombre: item.mercado
        }))
        setMercados(mercadosExtraidos)
      }
    } catch (error: any) {
      console.error("Error al cargar mercados:", error)
      toast({
        title: " Error al cargar mercados",
        description: error.message || "No se pudieron cargar los mercados disponibles",
        variant: "destructive",
      })
    }
  }

  // Función para cargar el inventario
  const handleCargarInventario = async () => {
    if (!mercadoSeleccionado) {
      toast({
        title: "Campo requerido",
        description: "Por favor selecciona un mercado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(
        `/api/analista/reportes/tesoreria/inventario?id_mercado=${mercadoSeleccionado}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener inventario")
      }

      setInventario(data.data.inventario)
      setResumen(data.data.resumen)

      toast({
        title: " Inventario cargado",
        description: `Se encontraron ${data.data.inventario.length} empresas`,
      })
    } catch (error: any) {
      toast({
        title: " Error",
        description: error.message || "Error al cargar inventario",
        variant: "destructive",
      })
      setInventario([])
      setResumen(null)
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar
  const handleLimpiar = () => {
    setMercadoSeleccionado("")
    setInventario([])
    setResumen(null)
  }

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de mercado */}
            <div className="md:col-span-2">
              <Label htmlFor="mercado">Mercado *</Label>
              <Select value={mercadoSeleccionado} onValueChange={setMercadoSeleccionado}>
                <SelectTrigger id="mercado">
                  <SelectValue placeholder="Selecciona un mercado" />
                </SelectTrigger>
                <SelectContent>
                  {mercados.map((m) => (
                    <SelectItem key={m.id_mercado} value={m.id_mercado.toString()}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 items-end">
              <Button onClick={handleCargarInventario} disabled={loading} className="flex-1">
                {loading ? "Cargando..." : "Cargar Inventario"}
              </Button>
              <Button onClick={handleLimpiar} variant="outline" disabled={loading}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen estadístico */}
      {resumen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Empresas en Inventario
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_empresas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-muted-foreground" />
                Acciones Disponibles
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_acciones_disponibles?.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Valor Total Tesorería
              </div>
              <div className="text-2xl font-bold mt-2">${resumen.valor_total_tesoreria?.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de inventario */}
      {inventario.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vault className="h-5 w-5" />
              Inventario Detallado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead className="text-right">Acciones Disponibles</TableHead>
                    <TableHead className="text-right">Precio Actual</TableHead>
                    <TableHead className="text-right">Valor Inventario</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventario.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">{item.mercado}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.acciones_disponibles.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">${item.precio_actual?.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.valor_inventario?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.acciones_disponibles > 0 ? (
                          <Badge variant="default">Disponible</Badge>
                        ) : (
                          <Badge variant="secondary">Agotado</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pie de tabla con totales */}
            {resumen && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Empresas:</span>{" "}
                    <span className="font-bold">{resumen.total_empresas}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Acciones:</span>{" "}
                    <span className="font-bold">{resumen.total_acciones_disponibles?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">Valor Total:</span>{" "}
                    <span className="font-bold">${resumen.valor_total_tesoreria?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!loading && inventario.length === 0 && resumen === null && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Vault className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay inventario para mostrar</h3>
              <p className="text-muted-foreground">
                Selecciona un mercado y haz clic en "Cargar Inventario" para ver las acciones disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
