"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CompanyDetail } from "@/components/trader/company-detail"

export default function CompanyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/")
      return
    }

    const fetchCompany = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/trader/empresas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.message || "Error al cargar la empresa")
        }

        if (!json.data) {
          throw new Error("No se recibieron datos de la empresa")
        }

        setCompany(json.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCompany()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-semibold">
        Cargando información de la empresa...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error al cargar datos</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/trader")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver al panel
          </button>
        </div>
      </div>
    )
  }

  return <CompanyDetail company={company} />
}
