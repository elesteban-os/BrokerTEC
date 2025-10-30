<<<<<<< HEAD
// lib/trader-api.ts
const API_BASE_URL = "http://localhost:3000/api/trader"

// ==================================================
// Tipos
// ==================================================
=======
// frontend/broker-tec/lib/trader-api.ts

>>>>>>> 5fbdc0360a951f1c738a06a8d635d7680e9e876c
export interface ApiCompany {
  id_empresa: number
  nombre: string
  ticker: string
  precio_actual: number
  cantidad_acciones: number
  capitalizacion: number
  variacion?: number
}

<<<<<<< HEAD
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
=======
// =============================================
// CONFIGURACIÓN BASE
// =============================================
const API_BASE_URL = "http://localhost:3000/api"

// =============================================
// TOP 5 EMPRESAS POR CAPITALIZACIÓN
// =============================================
export async function fetchTopCompanies(token: string): Promise<ApiCompany[]> {
  const response = await fetch(`${API_BASE_URL}/trader/portada`, {
>>>>>>> 5fbdc0360a951f1c738a06a8d635d7680e9e876c
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error("Error al obtener los datos del mercado")

  const json = await res.json()

  if (json.success && Array.isArray(json.data)) {
<<<<<<< HEAD
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
=======
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

    return empresas.sort((a, b) => b.capitalizacion - a.capitalizacion).slice(0, 5)
>>>>>>> 5fbdc0360a951f1c738a06a8d635d7680e9e876c
  }

  throw new Error("Formato de datos inesperado en respuesta del servidor")
}

// =============================================
// OBTENCION PERFIL DEL USUARIO
// =============================================
export async function fetchUserProfile(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      text.startsWith("<")
        ? `Error ${res.status}: El servidor devolvió HTML (backend apagado o puerto incorrecto)`
        : text
    )
  }

  try {
    // Tu backend devuelve el JSON del usuario directamente
    const data = await res.json()
    return data
  } catch {
    throw new Error("Respuesta del servidor no es JSON válido o formato inesperado")
  }
}

// =============================================
// ACTUALIZACION PERFIL DEL USUARIO
// =============================================
export async function updateUserProfile(token: string, profile: any) {
  const res = await fetch(`${API_BASE_URL}/users/${profile.id_user}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      text.startsWith("<")
        ? `Error ${res.status}: El servidor devolvió HTML (backend apagado o ruta incorrecta)`
        : text
    )
  }

  try {
    const data = await res.json()
    return data // backend devuelve JSON plano
  } catch {
    throw new Error("Respuesta del servidor no es JSON válido o formato inesperado")
  }
}

// =============================================
// CAMBIO DE CONTRASEÑA
// =============================================
export async function changeUserPassword(token: string, oldPass: string, newPass: string) {
  const res = await fetch(`${API_BASE_URL}/users/update-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPass, newPass }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      text.startsWith("<")
        ? `Error ${res.status}: El servidor devolvió HTML (backend apagado o ruta incorrecta)`
        : text
    )
  }

  try {
    const data = await res.json()
    return data // backend devuelve respuesta directa
  } catch {
    throw new Error("Respuesta del servidor no es JSON válido o formato inesperado")
  }
}
