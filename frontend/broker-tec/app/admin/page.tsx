"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, DollarSign } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function AdminDashboard() {
  const router = useRouter()
  const params = useParams()
  const calledRef = useRef(false)
  
  const [data, setData] = useState<any>({
    traders: { activos: 0, inactivos: 0 },
    mercado: { valor_actual: 0, valor_invertido: 0, posiciones_abiertas: 0 },
    wallets: { saldo_total_sistema: 0, numero_wallets: 0 },
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const res = await fetch("/api/admin/reportes/estadisticas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.message || `HTTP ${res.status}`)
      }
  const payload = await res.json()
  const payload_data = payload.data
  console.log("Fetched stats:", payload_data)
  // Merge payload into existing state so missing sections don't wipe out defaults
  setData((prev: any) => ({ ...prev, ...payload_data }))
    } catch (err: any) {
      console.error("Failed to load stats", err)
      setError(err?.message || "Error al cargar estadísticas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (calledRef.current) return
        calledRef.current = true
    void getStats()
  }, [])

  const stats = [
    {
      title: "Info. Traders",
      value: data?.traders?.activos ?? 0,
      value2: data?.traders?.inactivos ?? 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Valor del mercado",
      value: data?.mercado?.valor_actual ?? 0,
      value2: data?.mercado?.valor_invertido ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Info. Wallets",
      value: data?.wallets?.saldo_total_sistema ?? 0,
      value2: data?.wallets?.numero_wallets ?? 0,
      icon: DollarSign,
      color: "text-orange-600",
    },
    {
      title: "Posiciones Abiertas",
      value: data?.mercado?.posiciones_abiertas ?? 0,
      icon: Users,
      color: "text-purple-600",
    },
  ]

  // Helper to format numbers in shorthand (K = thousands, M = millions)
  // Examples: 1200 => "1.2K", 10000 => "10K", 1500000 => "1.5M"
  const formatK = (val: any) => {
    const n = Number(val ?? 0)
    if (!isFinite(n)) return String(val ?? 0)
    const abs = Math.abs(n)
    if (abs >= 1_000_000) {
      const v = n / 1_000_000
      return Math.abs(v % 1) < 1e-9 ? `${v.toFixed(0)}M` : `${v.toFixed(1).replace(/\.0$/, "")}M`
    }
    if (abs >= 1000) {
      const v = n / 1000
      return Math.abs(v % 1) < 1e-9 ? `${v.toFixed(0)}K` : `${v.toFixed(1).replace(/\.0$/, "")}K`
    }
    return n.toString()
  }


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
              <CardHeader className="flex flex-row items-center justify-between ">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
                  <CardContent>
                    {/* Special layout for Info. Traders */}
                    {stat.title === "Info. Traders" || stat.title === "Valor del mercado" || stat.title === "Info. Wallets" ? (
                      <div className="flex gap-4">
                        <div className="flex-1 rounded-md bg-muted p-3 text-center">
                          <div className="text-sm text-muted-foreground"> {stat.title === "Info. Traders" ? "Activos" : 
                                                                           stat.title === "Info. Wallets" ? "Saldo total" : "Actual"} </div>
                          <div className="mt-1 text-2xl font-bold">{formatK(stat.value)}</div>
                        </div>
                        <div className="flex-1 rounded-md bg-muted p-3 text-center">
                           <div className="text-sm text-muted-foreground"> {stat.title === "Info. Traders" ? "Inactivos" : 
                                                                            stat.title === "Info. Wallets" ? "Cant. Wallets" : "Invertido"} </div>
                          <div className="mt-1 text-2xl font-bold">{formatK(stat.value2 ?? 0)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex-1 rounded-md bg-muted p-5 text-center">
                          {/* <div className="text-sm text-muted-foreground">Activos</div> */}
                          <div className="mt-1 text-2xl font-bold">{formatK(stat.value)}</div>
                        </div>
                      </div>
                    )}
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
