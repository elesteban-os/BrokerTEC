"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import TradeInterface from "@/components/trader/trade-interface"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ApiCompanyDetail {
  id_empresa: number
  nombre: string
  ticker: string
  precio_actual: number
  cantidad_acciones: number
  capitalizacion: number
}

export default function TradePage() {
  const { id } = useParams() // ID de empresa desde la URL
  const router = useRouter()
  const [company, setCompany] = useState<ApiCompanyDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------------------------------
  // Cargar los datos de la empresa desde la API
  // -----------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      setError("Sesión no válida. Por favor, inicia sesión de nuevo.")
      setIsLoading(false)
      setTimeout(() => router.push("/"), 2000)
      return
    }

    const fetchCompanyDetail = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:3000/api/trader/empresas/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const msg = await response.text()
          throw new Error(`Error al obtener la empresa: ${msg}`)
        }

        const json = await response.json()
        if (json.success && json.data) {
          setCompany(json.data)
        } else {
          throw new Error(json.message || "Datos de empresa no disponibles.")
        }
      } catch (err: any) {
        console.error("Error al cargar empresa:", err)
        setError(err.message || "Error desconocido al cargar los datos de la empresa.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyDetail()
  }, [id, router])

  // -----------------------------------------------------
  // Manejo de estados de carga o error
  // -----------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-xl font-semibold text-foreground">
          Cargando datos de la empresa...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 border-red-500 shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">
            Error de carga
          </CardTitle>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
          <Button
            onClick={() => router.push("/trader")}
            variant="default"
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Volver al Panel
          </Button>
        </Card>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">
          No se encontraron datos de la empresa.
        </p>
      </div>
    )
  }

  // -----------------------------------------------------
  // ✅ Render principal — Interfaz de Trading
  // -----------------------------------------------------
  return (
    <TradeInterface
      key={company.id_empresa}
      // Puedes pasar props si quieres mostrar algo extra en el header, pero
      // el TradeInterface ya obtiene la empresa internamente con el mismo id
    />
  )
}
