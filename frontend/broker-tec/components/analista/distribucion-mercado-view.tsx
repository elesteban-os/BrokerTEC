"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Building2, Vault, Users, TrendingUp, Percent } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Estructura para nivel EMPRESA
interface ItemDistribucionEmpresa {
  mercado: {
    id: number
    nombre: string
  }
  empresa: {
    id: number
    nombre: string
    total_acciones: number
  }
  en_traders: {
    cantidad: number
    porcentaje: number
    numero_tenedores: number
  }
  en_tesoreria: {
    cantidad: number
    porcentaje: number
  }
}

// Estructura para nivel MERCADO
interface ItemDistribucionMercado {
  mercado: {
    id: number
    nombre: string
    numero_empresas: number
  }
  totales: {
    total_acciones: number
    en_traders: number
    en_tesoreria: number
  }
  porcentajes: {
    traders: number
    tesoreria: number
  }
  traders_activos: number
}

interface Mercado {
  id_mercado: number
  nombre: string
}

/**
 * Componente para ver la distribución de acciones entre Traders y Tesorería
 * Puede verse a nivel de mercado completo o desglosado por empresa
 */
export function DistribucionMercadoView() {
  const [mercados, setMercados] = useState<Mercado[]>([])
  const [mercadoSeleccionado, setMercadoSeleccionado] = useState<string>("")
  const [nivel, setNivel] = useState<string>("mercado") // "mercado" o "empresa"
  const [distribucion, setDistribucion] = useState<ItemDistribucionEmpresa[] | ItemDistribucionMercado[]>([])
  const [resumen, setResumen] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Cargar mercados al montar el componente
  useEffect(() => {
    cargarMercados()
  }, [])

  // Limpiar datos cuando cambia el nivel de análisis
  useEffect(() => {
    // Limpiar distribución y resumen al cambiar nivel
    setDistribucion([])
    setResumen(null)
  }, [nivel])

  // Función para cargar los mercados disponibles desde el inventario
  const cargarMercados = async () => {
    try {
      const token = localStorage.getItem("authToken")
      
      // Obtener inventario SIN filtro para extraer mercados
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
        title: "⚠️ Error al cargar mercados",
        description: error.message || "No se pudieron cargar los mercados disponibles",
        variant: "destructive",
      })
    }
  }

  // Función para cargar distribución
  const handleCargarDistribucion = async () => {
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
        `/api/analista/reportes/mercado/distribucion?id_mercado=${mercadoSeleccionado}&nivel=${nivel}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener distribución")
      }

      setDistribucion(data.data.distribucion)
      
      // Calcular resumen basado en el nivel
      if (nivel === "empresa") {
        const items = data.data.distribucion as ItemDistribucionEmpresa[]
        const totalAcciones = items.reduce((sum, item) => sum + item.empresa.total_acciones, 0)
        const totalTraders = items.reduce((sum, item) => sum + item.en_traders.cantidad, 0)
        const totalTesoreria = items.reduce((sum, item) => sum + item.en_tesoreria.cantidad, 0)
        
        setResumen({
          total_acciones: totalAcciones,
          total_traders: totalTraders,
          total_tesoreria: totalTesoreria,
          porcentaje_traders: totalAcciones > 0 ? (totalTraders / totalAcciones) * 100 : 0,
          porcentaje_tesoreria: totalAcciones > 0 ? (totalTesoreria / totalAcciones) * 100 : 0
        })
      } else {
        const items = data.data.distribucion as ItemDistribucionMercado[]
        const totalAcciones = items.reduce((sum, item) => sum + item.totales.total_acciones, 0)
        const totalTraders = items.reduce((sum, item) => sum + item.totales.en_traders, 0)
        const totalTesoreria = items.reduce((sum, item) => sum + item.totales.en_tesoreria, 0)
        
        setResumen({
          total_acciones: totalAcciones,
          total_traders: totalTraders,
          total_tesoreria: totalTesoreria,
          porcentaje_traders: totalAcciones > 0 ? (totalTraders / totalAcciones) * 100 : 0,
          porcentaje_tesoreria: totalAcciones > 0 ? (totalTesoreria / totalAcciones) * 100 : 0
        })
      }

      toast({
        title: "✅ Distribución cargada",
        description: `Análisis ${nivel === "mercado" ? "del mercado" : "por empresa"} completado`,
      })
    } catch (error: any) {
      toast({
        title: " Error",
        description: error.message || "Error al cargar distribución",
        variant: "destructive",
      })
      setDistribucion([])
      setResumen(null)
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar
  const handleLimpiar = () => {
    setMercadoSeleccionado("")
    setNivel("mercado")
    setDistribucion([])
    setResumen(null)
  }

  return (
    <div className="space-y-6">
      {/* Filtros de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Selector de nivel */}
            <div>
              <Label htmlFor="nivel">Nivel de Análisis</Label>
              <Select value={nivel} onValueChange={setNivel}>
                <SelectTrigger id="nivel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mercado">Por Mercado</SelectItem>
                  <SelectItem value="empresa">Por Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 items-end">
              <Button onClick={handleCargarDistribucion} disabled={loading} className="flex-1">
                {loading ? "Cargando..." : "Cargar"}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Total Acciones
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_acciones?.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <Users className="h-4 w-4" />
                Traders
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_traders?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{resumen.porcentaje_traders?.toFixed(2)}% del total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                <Vault className="h-4 w-4" />
                Tesorería
              </div>
              <div className="text-2xl font-bold mt-2">{resumen.total_tesoreria?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{resumen.porcentaje_tesoreria?.toFixed(2)}% del total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                {nivel === "empresa" ? (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                )}
                {nivel === "empresa" ? "Empresas" : "Mercados"}
              </div>
              <div className="text-2xl font-bold mt-2">{distribucion.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de distribución */}
      {distribucion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución de Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{nivel === "empresa" ? "Empresa (Ticker)" : "Mercado"}</TableHead>
                    <TableHead className="text-right">Total Acciones</TableHead>
                    <TableHead className="text-right">Acciones Traders</TableHead>
                    <TableHead className="text-right">% Traders</TableHead>
                    <TableHead className="text-right">Acciones Tesorería</TableHead>
                    <TableHead className="text-right">% Tesorería</TableHead>
                    <TableHead className="text-center">Predominio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nivel === "empresa" && distribucion.length > 0 && 'empresa' in distribucion[0] && (distribucion as ItemDistribucionEmpresa[]).map((item, idx) => {
                    const predominioTraders = item.en_traders.porcentaje > item.en_tesoreria.porcentaje
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.empresa.nombre}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.empresa.total_acciones.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {item.en_traders.cantidad.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-blue-600">
                              {item.en_traders.porcentaje.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-purple-600">
                          {item.en_tesoreria.cantidad.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-purple-600">
                              {item.en_tesoreria.porcentaje.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={predominioTraders ? "default" : "secondary"}>
                            {predominioTraders ? "Traders" : "Tesorería"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  
                  {nivel === "mercado" && distribucion.length > 0 && 'totales' in distribucion[0] && (distribucion as ItemDistribucionMercado[]).map((item, idx) => {
                    const predominioTraders = item.porcentajes.traders > item.porcentajes.tesoreria
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.mercado.nombre}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.totales.total_acciones.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {item.totales.en_traders.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-blue-600">
                              {item.porcentajes.traders.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-purple-600">
                          {item.totales.en_tesoreria.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Percent className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold text-purple-600">
                              {item.porcentajes.tesoreria.toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={predominioTraders ? "default" : "secondary"}>
                            {predominioTraders ? "Traders" : "Tesorería"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Resumen visual con barras de progreso */}
            {resumen && (
              <div className="mt-4 p-4 bg-muted rounded-md space-y-4">
                <h4 className="font-semibold text-sm">📊 Resumen General</h4>
                
                {/* Barra de distribución visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Traders: {resumen.porcentaje_traders?.toFixed(2)}%</span>
                    <span className="text-purple-600 font-medium">Tesorería: {resumen.porcentaje_tesoreria?.toFixed(2)}%</span>
                  </div>
                  <div className="h-6 flex rounded-md overflow-hidden border">
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${resumen.porcentaje_traders}%` }}
                    >
                      {resumen.porcentaje_traders > 10 && `${resumen.porcentaje_traders.toFixed(0)}%`}
                    </div>
                    <div
                      className="bg-purple-500 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${resumen.porcentaje_tesoreria}%` }}
                    >
                      {resumen.porcentaje_tesoreria > 10 && `${resumen.porcentaje_tesoreria.toFixed(0)}%`}
                    </div>
                  </div>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground">Total Acciones:</span>{" "}
                    <span className="font-bold">{resumen.total_acciones?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">En Traders:</span>{" "}
                    <span className="font-bold text-blue-600">{resumen.total_traders?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">En Tesorería:</span>{" "}
                    <span className="font-bold text-purple-600">{resumen.total_tesoreria?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!loading && distribucion.length === 0 && resumen === null && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay distribución para mostrar</h3>
              <p className="text-muted-foreground">
                Selecciona un mercado y un nivel de análisis para ver la distribución de acciones
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
