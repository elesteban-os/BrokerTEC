// lib/trader-api.ts
const API_BASE_URL = "http://localhost:3000/api/trader"

// ==================================================
// Tipos
// ==================================================
export interface ApiCompany {
  id_empresa: number
  nombre: string
  ticker: string
  precio_actual: number
  cantidad_acciones: number
  capitalizacion: number
  variacion?: number
}

export interface ApiMarket {
  id_mercado: number
  nombre: string
  habilitado: boolean
  top_empresas: ApiCompany[]
}

// ==================================================
// Función para obtener los mercados con sus top empresas
// ==================================================
export async function fetchTopCompanies(token: string): Promise<ApiMarket[]> {
  const res = await fetch(`${API_BASE_URL}/portada`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error("Error al obtener los datos del mercado")

  const json = await res.json()

  if (json.success && Array.isArray(json.data)) {
    return json.data.map((mercado: any) => ({
      id_mercado: mercado.id_mercado,
      nombre: mercado.nombre,
      habilitado: mercado.habilitado,
      top_empresas: mercado.top_empresas.map((e: any) => ({
        id_empresa: e.id_empresa,
        nombre: e.nombre,
        ticker: e.ticker ?? e.nombre.slice(0, 3).toUpperCase(),
        precio_actual: Number(e.precio_actual) || 0,
        cantidad_acciones: Number(e.cantidad_acciones) || 0,
        capitalizacion: Number(e.capitalizacion) || 0,
        variacion: Number(e.variacion ?? 0),
      })),
    }))
  }

  throw new Error("Formato de datos inesperado en respuesta del servidor")
}
