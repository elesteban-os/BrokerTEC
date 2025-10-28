// frontend/broker-tec/lib/trader-api.ts
export interface ApiCompany {
  id_empresa: number
  nombre: string
  ticker: string
  precio_actual: number
  cantidad_acciones: number
  capitalizacion: number
}

const API_BASE_URL = "http://localhost:3000/api/trader"; 

export async function fetchTopCompanies(token: string): Promise<ApiCompany[]> {
  const response = await fetch(`${API_BASE_URL}/portada`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // Incluir el token de autenticación
    },
  })

  if (!response.ok) {
    throw new Error("Error al obtener la lista de empresas")
  }

  const json = await response.json()

  // Si la respuesta tiene el formato de TradingController.getPortada()
  if (json.success && Array.isArray(json.data)) {
    // Cada elemento del array representa un mercado, con sus empresas top
    const empresas = json.data.flatMap((mercado: any) =>
      mercado.top_empresas.map((e: any) => ({
        id_empresa: e.id_empresa,
        nombre: e.nombre,
        ticker: e.ticker ?? e.nombre.slice(0, 3).toUpperCase(),
        precio_actual: e.precio_actual,
        cantidad_acciones: e.cantidad_acciones,
        capitalizacion: e.capitalizacion,
      }))
    )

    // Devolvemos solo las 5 más grandes (ordenadas)
    return empresas.sort((a, b) => b.capitalizacion - a.capitalizacion).slice(0, 5)
  }

  throw new Error("Formato de datos inesperado en la respuesta del servidor")
}
