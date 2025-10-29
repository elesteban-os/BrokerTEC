"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, DollarSign } from "lucide-react"
import { useParams, useRouter } from "next/dist/client/components/navigation"

export default function AdminDashboard() {
  const { markets, companies, positions } = useData()
  const router = useRouter()
  const params = useParams()

  const activeCompanies = companies.filter((c) => c.isActive).length
  const totalMarketCap = companies.filter((c) => c.isActive).reduce((sum, c) => sum + c.marketCap, 0)
  const totalPositions = positions.length

  const stats = [
    {
      title: "Mercados Activos",
      value: markets.length,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Empresas Activas",
      value: activeCompanies,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Posiciones Abiertas",
      value: totalPositions,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Cap. de Mercado Total",
      value: `$${(totalMarketCap / 1e12).toFixed(2)}T`,
      icon: DollarSign,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Desde aquí puedes gestionar los catálogos de mercados y empresas. Utiliza el menú lateral para navegar entre
            las diferentes secciones.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
