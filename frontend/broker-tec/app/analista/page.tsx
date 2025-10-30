"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Building2, PieChart } from "lucide-react"
import {
  TransaccionesEmpresaView,
  TransaccionesUsuarioView,
  InventarioTesoreriaView,
  TenedoresView,
  DistribucionMercadoView,
} from "@/components/analista"

/**
 * Página principal del módulo de Analista
 * Muestra 5 reportes principales en formato de tabs
 */
export default function AnalistaPage() {
  const [activeTab, setActiveTab] = useState("empresa-transacciones")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h2>
          <p className="text-muted-foreground">
            Consulta estadísticas, transacciones y distribución de acciones del sistema
          </p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="empresa-transacciones" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="usuario-transacciones" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuario</span>
          </TabsTrigger>
          <TabsTrigger value="inventario" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Inventario</span>
          </TabsTrigger>
          <TabsTrigger value="tenedores" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Tenedores</span>
          </TabsTrigger>
          <TabsTrigger value="distribucion" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Distribución</span>
          </TabsTrigger>
        </TabsList>

        {/* Vista 1: Transacciones por Empresa */}
        <TabsContent value="empresa-transacciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones por Empresa</CardTitle>
              <CardDescription>
                Consulta todas las operaciones de compra/venta de una empresa específica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransaccionesEmpresaView />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista 2: Transacciones por Usuario */}
        <TabsContent value="usuario-transacciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones por Usuario</CardTitle>
              <CardDescription>
                Revisa el comportamiento de trading de un usuario específico (por alias)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransaccionesUsuarioView />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista 3: Inventario de Tesorería */}
        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Tesorería</CardTitle>
              <CardDescription>
                Acciones disponibles (no vendidas) por empresa en la Tesorería
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventarioTesoreriaView />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista 4: Mayor Tenedor por Empresa */}
        <TabsContent value="tenedores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Tenedores</CardTitle>
              <CardDescription>
                Consulta quién posee más acciones de una empresa específica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TenedoresView />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista 5: Distribución de Acciones en el Mercado */}
        <TabsContent value="distribucion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Acciones</CardTitle>
              <CardDescription>
                Porcentaje de acciones en manos de traders vs. Tesorería
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistribucionMercadoView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
