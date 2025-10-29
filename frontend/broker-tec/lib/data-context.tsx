"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { get, set } from "react-hook-form"

export interface Market {
  id: string
  name: string
  currency: string
  enabled: boolean
  createdAt: Date
}

export interface Company {
  id: string
  name: string
  marketId: string
  currentPrice: number
  totalShares: number
  marketCap: number
  isActive: boolean
  enabled: boolean // Added enabled field to track if company is enabled
  createdAt: Date
}

export interface Position {
  id: string
  userId: string
  companyId: string
  shares: number
  averagePrice: number
}

export interface Transaction {
  id: string
  userId: string
  companyId: string
  type: "buy" | "sell" | "liquidation"
  shares: number
  price: number
  total: number
  reason?: string
  createdAt: Date
}

export interface User {
  id: string
  alias: string
  email: string
  nombre: string
  apellido1: string
  apellido2: string
  countryOrigin: string
  phones: string[]
  role: "admin" | "trader" | "analista"
  status: "active" | "disabled"
  wallet?: number
  enabledMarkets?: string[]
  category?: "basic" | "intermediate" | "advanced"
  operationLimit?: number
  createdAt: Date
}

export interface UserCreation {
  id: string
  alias: string
  email: string
  nombre: string
  apellido1: string
  apellido2: string
  countryOrigin: string
  password: string
  phones: string[]
  role: "admin" | "trader" | "analista"
  status: "active" | "disabled"
  wallet?: number
  enabledMarkets?: string[]
  category?: "basic" | "intermediate" | "advanced"
  operationLimit?: number
  createdAt: Date
}

export interface PriceHistory {
  id: string
  companyId: string
  price: number
  timestamp: Date
}

export interface UserProfile {
  id: string
  name: string
  surname1: string
  surname2: string
  alias: string
  email: string
  address: string
  country: string
  phones: string[]
  passwordHash: string
}

interface DataContextType {
  markets: Market[]
  companies: Company[]
  positions: Position[]
  transactions: Transaction[]
  users: User[]
  priceHistory: PriceHistory[]
  currentProfile: UserProfile
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  addMarket: (market: Omit<Market, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>
  updateMarket: (id: string, name: string, market: Partial<Market>) => Promise<{ success: boolean; message: string }>
  getMarkets: () => Promise<{ success: boolean; message: string }>
  deleteMarket: (id: string) => Promise<void>
  addCompany: (company: Omit<Company, "id" | "createdAt" | "enabled">) => Promise<{ success: boolean; message: string }>
  updateCompany: (id: string, company: Partial<Company>) => Promise<{ success: boolean; message: string }>
  deleteCompany: (id: string) => void
  delistCompany: (id: string, reason: string) => Promise<{ success: boolean; message: string }>
  getCompanies: () => Promise<{ success: boolean; message: string }>
  getUsers: () => Promise<{ success: boolean; message: string }>
  addUser: (user: Omit<UserCreation, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>
  updateUser: (id: string, user: Partial<User>) => void
  disableUser: (id: string, reason: string) => Promise<{ success: boolean; message: string }>
  addPriceHistory: (price: Omit<PriceHistory, "id">) => void
  updatePriceManual: (companyId: string, price: number) => Promise<{ success: boolean; message: string }>
  loadMultiplePrices: (prices: { companyId: string; price: number }[]) => Promise<{ success: boolean; message: string }>
  loadPricesFromAPI: (apiKey: string) => Promise<{ success: boolean; message: string }>
  getPriceHistory: (companyId: string) => PriceHistory[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [markets, setMarkets] = useState<Market[]>([])
  // GET markets helper (exposed) - puedes llamarla para refrescar en cualquier parte
  const getMarkets = async (): Promise<{ success: boolean; message: string }> => {
    console.log("Fetching markets from API...")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const res = await fetch("/api/admin/mercados", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })

      const payload = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error("Failed to fetch markets:", payload)
        return { success: false, message: payload?.message || "Fallo al obtener mercados" }
      }

      const list = (payload.data || payload || []).map((m: any) => ({
        id: m.id_mercado ?? (m.id ? String(m.id) : String(Date.now())),
        name: m.nombre ?? m.name ?? "",
        currency: m.moneda ?? m.currency ?? "USD",
        enabled: typeof m.habilitado !== "undefined" ? Boolean(m.habilitado) : true,
        createdAt: m.fecha_creacion ? new Date(m.fecha_creacion) : new Date(),
      })) as Market[]
      console.log("Fetched markets:", list)

      setMarkets(list)
      return { success: true, message: "Mercados cargados" }
    } catch (err) {
      console.error("Error fetching markets:", err)
      const e = err as Error
      return { success: false, message: e.message || "Error al cargar mercados" }
    }
  }

  // // Cargar los mercados al montar
  // useEffect(() => {
  //   void getMarkets()
  // }, [])

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "Apple Inc.",
      marketId: "1",
      currentPrice: 178.5,
      totalShares: 15000000000,
      marketCap: 2677500000000,
      isActive: true,
      enabled: true, // Added enabled field
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Microsoft Corporation",
      marketId: "1",
      currentPrice: 420.3,
      totalShares: 7430000000,
      marketCap: 3122829000000,
      isActive: true,
      enabled: true, // Added enabled field
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "3",
      name: "Tesla Inc.",
      marketId: "1",
      currentPrice: 245.6,
      totalShares: 3180000000,
      marketCap: 780888000000,
      isActive: true,
      enabled: true, // Added enabled field
      createdAt: new Date("2024-01-20"),
    },
  ])
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([
    // Apple (AAPL) history
    {
      id: "1",
      companyId: "1",
      price: 170.5,
      timestamp: new Date("2024-02-25T10:00:00"),
    },
    {
      id: "2",
      companyId: "1",
      price: 172.3,
      timestamp: new Date("2024-02-26T10:00:00"),
    },
    {
      id: "3",
      companyId: "1",
      price: 175.2,
      timestamp: new Date("2024-02-27T10:00:00"),
    },
    {
      id: "4",
      companyId: "1",
      price: 176.8,
      timestamp: new Date("2024-02-28T10:00:00"),
    },
    {
      id: "5",
      companyId: "1",
      price: 178.5,
      timestamp: new Date("2024-02-29T10:00:00"),
    },
    // Microsoft (MSFT) history
    {
      id: "6",
      companyId: "2",
      price: 410.2,
      timestamp: new Date("2024-02-25T10:00:00"),
    },
    {
      id: "7",
      companyId: "2",
      price: 412.5,
      timestamp: new Date("2024-02-26T10:00:00"),
    },
    {
      id: "8",
      companyId: "2",
      price: 415.8,
      timestamp: new Date("2024-02-27T10:00:00"),
    },
  ])
  // GET companies helper (exposed) - puedes llamarla para refrescar en cualquier parte
  const getCompanies = async (): Promise<{ success: boolean; message: string }> => {
    console.log("Fetching companies from API...")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const res = await fetch("/api/admin/empresas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })

      const payload = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error("Failed to fetch companies:", payload)
        return { success: false, message: payload?.message || "Fallo al obtener empresas" }
      }

      console.log("Raw companies payload:", payload)

      const list = (payload.data || payload || []).map((c: any) => ({
        id: c.id_empresa ?? (c.id ? String(c.id) : String(Date.now())),
        name: c.nombre ?? "",
        marketId: c.id_mercado ?? "",
        currentPrice: c.precio_actual ?? 0,
        totalShares: c.cantidad_acciones ?? 0,
        marketCap: (c.precio_actual ?? 0) * (c.cantidad_acciones ?? 0),
        isActive: typeof c.habilitado !== "undefined" ? Boolean(c.habilitado) : true,
        enabled: typeof c.habilitado !== "undefined" ? Boolean(c.habilitado) : true,
        createdAt: c.fecha_creacion ? new Date(c.fecha_creacion) : new Date(),
    
      })) as Company[]
      console.log("Fetched companies:", list)

      // Reemplazar el historial de precios en un solo set (más eficiente)
      const newHistories: PriceHistory[] = []
      for (const company of payload.data || []) {
        const history = company.precios_historicos || []
        for (const p of history) {
          newHistories.push({
            id: p.id_precio ?? String(Date.now()),
            companyId: company.id_empresa ?? "",
            price: p.precio ?? 0,
            timestamp: p.fecha_hora ? new Date(p.fecha_hora) : new Date(),
          })
        }
      }
      setPriceHistory(newHistories)

      setCompanies(list)
      return { success: true, message: "Empresas cargadas" }
    } catch (err) {
      console.error("Error fetching companies:", err)
      const e = err as Error
      return { success: false, message: e.message || "Error al cargar empresas" }
    }
  }

  const [positions, setPositions] = useState<Position[]>([
    {
      id: "1",
      userId: "user1",
      companyId: "1",
      shares: 100,
      averagePrice: 170.0,
    },
    {
      id: "2",
      userId: "user2",
      companyId: "1",
      shares: 50,
      averagePrice: 172.5,
    },
    {
      id: "3",
      userId: "user1",
      companyId: "3",
      shares: 25,
      averagePrice: 230.0,
    },
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([])

  const getUsers = async (): Promise<{ success: boolean; message: string }> => {
    // Obtener traders desde la API
    console.log("Fetching traders from API...")
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const res = await fetch("/api/admin/traders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })

      const payload = await res.json().catch(() => ({}))
      const payload2 = payload.data || payload || []

      if (!res.ok) {
        console.error("Failed to fetch users:", payload)
        throw new Error(payload?.message || "Fallo al obtener usuarios")
      }

      console.log("Raw users payload:", payload)

      const list = (payload.data || payload || []).map((u: any) => ({
        id: String(u.id_user) ?? (u.id ? String(u.id) : String(Date.now())),
        alias: u.alias ?? "",
        email: u.email ?? "",
        nombre: u.nombre_completo ?? "",
        apellido1: "",
        apellido2: "",
        countryOrigin: u.pais_origen ?? "",
        phones: u.telefonos ?? [],
        role: "trader",
        status:
          typeof u.habilitado !== "undefined"
            ? (Boolean(u.habilitado) ? "active" : "disabled")
            : typeof u.status !== "undefined"
            ? (u.status === "active" || u.status === true ? "active" : "disabled")
            : "active",
        wallet: u.wallet.saldo ?? 0,
        enabledMarkets: u.mercados_habilitados ?? [],
        category: u.wallet.categoria ?? "basic",
        operationLimit: u.wallet.limite_diario ?? 0,
        createdAt: u.fecha_creacion ? new Date(u.fecha_creacion) : new Date(),
      })) as User[]
      console.log("Fetched users:", list)

      const listHistory = (payload2.data || payload2 || []).map((u: any) => ({
        id: u.id ? String(Date.now()) : String(Date.now()),
        userId: String(u.id_user) ?? (u.id ? String(u.id) : String(Date.now())),
        companyId: String(u.id_empresa) ?? (u.id ? String(u.id) : String(Date.now())),
        shares: 1,
        averagePrice: u.valor_actual_portafolio ?? 0,
      })) as Position[]

      console.log("Fetched price histories:", listHistory)

      setPositions(listHistory)
      setUsers(list)
      return { success: true, message: "Usuarios cargados" }
    } catch (err) {
      console.error("Error fetching users:", err)
      const e = err as Error
      return { success: false, message: e.message || "Error al cargar usuarios" }
    }
  }

  const [users, setUsers] = useState<User[]>([
    {
      id: "user1",
      alias: "TradeMaster",
      email: "trader1@example.com",
      nombre: "Juan",
      apellido1: "García",
      apellido2: "López",
      countryOrigin: "México",
      phones: ["+52 555 123 4567"],
      role: "trader",
      status: "active",
      wallet: 50000,
      enabledMarkets: ["1", "2"],
      category: "advanced",
      operationLimit: 100000,
      createdAt: new Date("2024-01-10"),
    },
    {
      id: "user2",
      alias: "InvestorPro",
      email: "trader2@example.com",
      nombre: "María",
      apellido1: "Rodríguez",
      apellido2: "Martínez",
      countryOrigin: "España",
      phones: ["+34 612 345 678", "+34 687 654 321"],
      role: "trader",
      status: "active",
      wallet: 25000,
      enabledMarkets: ["1"],
      category: "intermediate",
      operationLimit: 50000,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "user3",
      alias: "NewbieTrade",
      email: "trader3@example.com",
      nombre: "Carlos",
      apellido1: "Hernández",
      apellido2: "Pérez",
      countryOrigin: "Colombia",
      phones: ["+57 300 123 4567"],
      role: "trader",
      status: "active",
      wallet: 10000,
      enabledMarkets: ["1"],
      category: "basic",
      operationLimit: 20000,
      createdAt: new Date("2024-02-01"),
    },
    {
      id: "admin1",
      alias: "AdminBroker",
      email: "admin@brokertec.com",
      nombre: "Ana",
      apellido1: "Sánchez",
      apellido2: "Torres",
      countryOrigin: "México",
      phones: ["+52 555 987 6543"],
      role: "admin",
      status: "active",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "analyst1",
      alias: "DataAnalyst",
      email: "analyst@brokertec.com",
      nombre: "Luis",
      apellido1: "Ramírez",
      apellido2: "Gómez",
      countryOrigin: "Argentina",
      phones: ["+54 11 2345 6789"],
      role: "analista",
      status: "active",
      createdAt: new Date("2024-01-05"),
    },
  ])


  const [currentProfile, setCurrentProfile] = useState<UserProfile>({
    
    id: "",
    name: "",
    surname1: "",
    surname2: "",
    alias: "",
    email: "",
    address: "",
    country: "",
    phones: [],
    passwordHash: "", // In real app, this would be properly hashed
  })

  // Para obtener el perfil desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")

      if (raw) {
        const JSONdata = JSON.parse(raw)
        const niceData = {
          id: JSONdata.id_user || "",
          name: JSONdata.nombre || "",
          surname1: "",
          surname2: "",
          alias: JSONdata.alias || "",
          email: JSONdata.email || "",
          address: "",
          country: "",
          phones: [],
          passwordHash: ""
        }
        setCurrentProfile(niceData)
      }
    } catch {
      /* ignore */
    }

    // Obtener el resto de datos en la API
    ;(async () => {
      try {
        // Obtener token de auth
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
        console.log("Using token:", token)
        console.log("Using refresh token:", refreshToken)
        
        const res = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        if (!res.ok) {
          throw new Error("Failed to fetch profile data")
        }
        const data = await res.json()
        console.log("Fetched profile data:", data)
      
        const niceData = {
          id: data.id_user || "",
          name: data.nombre || "",
          surname1: data.apellido1 || "",
          surname2: data.apellido2 || "",
          alias: data.alias || "",
          email: data.email || "",
          address: "",
          country: data.country_origin || "",
          phones: [],
          passwordHash: ""
        }
        setCurrentProfile(niceData)

      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    })()
  }, [])




  const addMarket = async (
    market: Omit<Market, "id" | "createdAt">
  ): Promise<{ success: boolean; message: string }> => {
    const newMarket: Market = {
      ...market,
      id: Date.now().toString(),
      createdAt: new Date(),
      // Ensure new markets are enabled by default
      enabled: true,
    }

    // Obtener token de auth
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    // Crear JSON que API espera
    const bodyJSON = {
      "nombre": newMarket.name,
    }

    // Llamar a la API para crear el mercado en el backend
    try {
      const response = await fetch("/api/admin/mercados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })

      const data = await response.json()
      console.log("API response:", data)

      if (response.ok) {
        const newMarketAdd: Market = {
          id: data.data.id_mercado,
          name: data.data.nombre,
          currency: newMarket.currency,
          enabled: data.data.habilitado,
          createdAt: data.data.fecha_creacion ? new Date(data.data.fecha_creacion) : new Date(),
        }

        console.log("New market to add:", newMarketAdd)
        setMarkets([...markets, newMarketAdd])
        // Refresh from API to ensure server state is authoritative
        try {
          await getMarkets()
        } catch {
          /* ignore refresh errors */
        }
        return { success: true, message: data?.message || "Mercado creado exitosamente" }
      } else {
        throw new Error(data?.message || "Fallo al crear mercado")
      }
    } catch (error) {
      console.error("Error creating market:", error)
      const err = error as Error
      return { success: false, message: err?.message || "Fallo al crear mercado" }
    }
    // fallback
    return { success: false, message: "Fallo al crear mercado" }
  }
      

  const updateMarket = async (
    id: string,
    name: string,
    market: Partial<Market>,
  ): Promise<{ success: boolean; message: string }> => {
    
    // Llamar a la API para actualizar el mercado en el backend
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    const bodyJSON = {
      "nombre": name,
      "habilitado": market.enabled,
      
    }

    try {
      const response = await fetch(`/api/admin/mercados/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })
      const data = await response.json()
      console.log("API response:", data)

      if (!response.ok) {
        throw new Error(data?.message || "Fallo al actualizar mercado")
      }

      // Refresh list to mirror server state
      try {
        await getMarkets()
      } catch {
        /* ignore refresh errors */
      }
      return { success: true, message: "Mercado actualizado correctamente" }
    } catch (error) {
      console.error("Error updating market:", error)
      const err = error as Error
      return { success: false, message: err?.message || "Fallo al actualizar mercado" }
    }
  }

  const deleteMarket = async (id: string): Promise<void> => {

    // Llamar a la API para eliminar el mercado en el backend
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    try {
      const response = await fetch(`/api/admin/mercados/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        setMarkets(markets.filter((m) => m.id !== id))
      } else {
        console.error("Fallo al eliminar mercado")
      }
    } catch (error) {
      console.error("Error deleting market:", error)
    }
  }

    const addCompany = async (
    company: Omit<Company, "id" | "createdAt" | "enabled">,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/companies', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(company)
      // })
      // const data = await response.json()
      // if (!data.success) return data

      const id_mercado = parseInt(company.marketId)
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const bodyJSON = {
        "nombre": company.name,
        "id_mercado": id_mercado,
        "precio_actual": company.currentPrice,
        "cantidad_acciones": company.totalShares,
      }

      const response = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data?.message || "Fallo al crear empresa")
      }
      
      await getCompanies()

      return { success: true, message: "Empresa creada exitosamente" }
    } catch (error) {
      return { success: false, message: "Error al crear la empresa" }
    }
  }

  const updateCompany = async (
    id: string,
    company: Partial<Company>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const idmercado = company.marketId ? parseInt(company.marketId) : undefined
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const bodyJSON = {
        "nombre": company.name,
        "id_mercado": idmercado,
        "precio_actual": company.currentPrice,
        "cantidad_acciones": company.totalShares,
        "habilitado": company.enabled,
      }
      console.log("Updating company with data:", bodyJSON)
      const response = await fetch(`/api/admin/empresas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data?.message || "Fallo al actualizar empresa")
      }

      await getCompanies()

      return { success: true, message: "Empresa actualizada exitosamente" }
    } catch (error) {
      return { success: false, message: "Error al actualizar la empresa" }
    }
  }

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id))
  }

  const delistCompany = async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/companies/${id}/delist`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reason })
      // })
      // const data = await response.json()
      // if (!data.success) return data

      console.log("Delisting company with ID:", id, "Reason:", reason)
      const bodyJSON = {
        "justificacion": reason,
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const response = await fetch(`/api/admin/empresas/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data?.message || "Fallo al deslistar empresa")
      }

      getCompanies()

      return { success: true, message: "Empresa deslistada exitosamente" }
      
    } catch (error) {
      return { success: false, message: "Error al deslistar la empresa" }
    }
  }

  // Para registro de nuevos usuarios
  const addUser = async (
    user: Omit<UserCreation, "id" | "createdAt">,
  ): Promise<{ success: boolean; message: string }> => {
    const newUser: UserCreation = {
      ...user,
      id: `user${Date.now()}`,
      createdAt: new Date(),
    }

    // Verificar tipo de usuario y guardar en BD por medio de API
    if (newUser.role === "admin") {
      // Crear JSON que API espera
      const bodyJSON = {
        "alias": newUser.alias,
        "email": newUser.email,
        "nombre": newUser.nombre,
        "apellido1": newUser.apellido1,
        "apellido2": newUser.apellido2,
        "password": newUser.password,
        "country_origin": newUser.countryOrigin,
        "id_role": 1 // admin
      }

      // Obtener token de auth
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

      // Llamar a la API
      try {
        const res = await fetch("/api/auth/admin/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyJSON),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.message || "Fallo al registrar admin")
        }
        setUsers([...users, newUser])
        return { success: true, message: data?.message || "Admin registrado correctamente" }

      } catch (err) {
        const error = err as Error
        console.error("Fallo al registrar admin:", error)
        return { success: false, message: error?.message || "Fallo al registrar admin" }
      }
    }

    // Fallback: for traders/analysts or when no API is needed, add locally
    setUsers([...users, newUser])
    return { success: true, message: "Usuario creado localmente" }
  }

  const updateUser = (id: string, user: Partial<User>) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, ...user } : u)))
  }

  const disableUser = async (id: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const user = users.find((u) => u.id === id)
    if (!user) {
      return { success: false, message: "Usuario no encontrado" }
    }

    if (user.status === "disabled") {
      return { success: false, message: "usuario ya deshabilitado" }
    }

    if (!reason || reason.trim() === "") {
      return { success: false, message: "justificación requerida" }
    }

    if (user.role === "trader") {
      // Find user positions
      const userPositions = positions.filter((p) => p.userId === id)

      if (userPositions.length > 0) {
        // Liquidate all positions at current price
        const newTransactions: Transaction[] = userPositions.map((position) => {
          const company = companies.find((c) => c.id === position.companyId)
          const liquidationPrice = company?.currentPrice || 0
          return {
            id: `${Date.now()}-${position.id}`,
            userId: id,
            companyId: position.companyId,
            type: "liquidation" as const,
            shares: position.shares,
            price: liquidationPrice,
            total: position.shares * liquidationPrice,
            reason: `Usuario deshabilitado: ${reason}`,
            createdAt: new Date(),
          }
        })

        // Calculate total liquidation value
        const totalLiquidation = newTransactions.reduce((sum, t) => sum + t.total, 0)

        // Add transactions
        setTransactions([...transactions, ...newTransactions])

        // Remove positions
        setPositions(positions.filter((p) => p.userId !== id))

        // Update user wallet and status
        setUsers(
          users.map((u) =>
            u.id === id ? { ...u, status: "disabled" as const, wallet: (u.wallet || 0) + totalLiquidation } : u,
          ),
        )

        return {
          success: true,
          message: `Usuario deshabilitado. ${userPositions.length} posiciones liquidadas por $${totalLiquidation.toFixed(2)}.`,
        }
      }
    }

    // No positions or not a trader, just disable
    setUsers(users.map((u) => (u.id === id ? { ...u, status: "disabled" as const } : u)))

    return {
      success: true,
      message: "Usuario deshabilitado exitosamente.",
    }
  }

  const addPriceHistory = (price: Omit<PriceHistory, "id">) => {
    const newPrice: PriceHistory = {
      ...price,
      id: Date.now().toString(),
    }
    setPriceHistory([...priceHistory, newPrice])

    // Update company current price
    updateCompany(price.companyId, { currentPrice: price.price })
  }

  const loadPricesFromAPI = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API authentication
    if (apiKey !== "ADMIN_API_KEY") {
      return { success: false, message: "auth fallida" }
    }

    // Simulate API loading prices
    const mockPrices = companies.map((company) => ({
      companyId: company.id,
      price: company.currentPrice * (1 + (Math.random() - 0.5) * 0.05), // ±5% variation
      timestamp: new Date(),
      loadedBy: "api",
      loadMethod: "api" as const,
    }))

    mockPrices.forEach((price) => {
      addPriceHistory(price)
    })

    return {
      success: true,
      message: `${mockPrices.length} precios cargados exitosamente desde API.`,
    }
  }

  const updatePriceManual = async (
    companyId: string,
    price: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (price <= 0) {
        return { success: false, message: "precio inválido" }
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const bodyJSON = {
        "precio_actual": price,
      }
      const response = await fetch(`/api/admin/empresas/${companyId}/precio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || "Fallo al actualizar precio")
      }

      // Add to price history
      addPriceHistory({
        companyId,
        price,
        timestamp: new Date(),
      })

      return { success: true, message: "Precio actualizado exitosamente" }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Error al actualizar el precio"}
    }
  }

  const loadMultiplePrices = async (
    prices: { companyId: string; price: number }[],
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/prices/bulk', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prices })
      // })
      // const data = await response.json()
      // if (!data.success) return data

      // Validate all prices
      for (const item of prices) {
        if (item.price <= 0) {
          return { success: false, message: `precio inválido para empresa ${item.companyId}` }
        }
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const bodyJSON = {
          "precios": prices.map((p) => ({
            "id_empresa": p.companyId,
            "precio_actual": p.price,
          }))
      }

      console.log("Sending bulk price update with data:", JSON.stringify(bodyJSON))

      const response = await fetch(`/api/admin/empresas/precios/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyJSON),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || "Fallo al actualizar precios múltiples")
      }
      // Add all prices to history
      prices.forEach((item) => {
        addPriceHistory({
          companyId: item.companyId,
          price: item.price,
          timestamp: new Date(),
        })
      })

      return { success: true, message: `${prices.length} precios cargados exitosamente` }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Error al cargar precios múltiples"}
    }
  }

  const updateProfile = async (profile: Partial<UserProfile>): Promise<{ success: boolean; message: string }> => {
    // Validate email format
    if (profile.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(profile.email)) {
        return { success: false, message: "email inválido" }
      }
    }

    // Validate unique alias
    // if (profile.alias && profile.alias !== currentProfile.alias) {
    //   const aliasExists = users.some((u) => u.alias === profile.alias)
    //   if (aliasExists) {
    //     return { success: false, message: "alias duplicado" }
    //   }
    // }

    // Realizar put en la API para actualizar el perfil
    try {
      // Obtener token de auth
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      console.log("Using token for profile update:", token)

      // Realizar JSON para el body
      const bodyJSON = {
        "alias": profile.alias,
        "email": profile.email,
        "nombre": profile.name,
        "apellido1": profile.surname1,
        "apellido2": profile.surname2,
        "country_origin": profile.country
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(bodyJSON),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const dataStatus = res.status
        if (dataStatus === 400) {
          throw new Error(data?.message || "Error: Datos inválidos")
        }
        else if (dataStatus === 401) {
          throw new Error(data?.message || "Error: No autenticado")
        }
        else if (dataStatus === 404) {
          throw new Error(data?.message || "Error: Usuario no encontrado")
        }
        else if (dataStatus === 409) {
          throw new Error(data?.message || "Error: Alias o email ya existen")
        } else {
          throw new Error(data?.message || "Fallo al actualizar el perfil")
        }
      }
      const data = await res.json()
      console.log("Profile updated successfully:", data)
      // Update profile
      setCurrentProfile({ ...currentProfile, ...profile })
      return { success: true, message: "Perfil actualizado exitosamente" }
    } catch (error: any) {
      return { success: false, message: error.message || "Error al actualizar el perfil" }
    }

    
  }



  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    // In a real app, you would verify the current password against the hash
    // For demo purposes, we'll just validate the new password strength

    // Validate password strength (at least 6 chars)
    const passwordRegex = /^.{6,}$/
    if (!passwordRegex.test(newPassword)) {
      return {
        success: false,
        message: "Contraseña débil",
      }
    }

    // Cambiar contraseña en la API
    try {
      // Obtener token de auth
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      console.log("Using token for password change:", token)

      const bodyJSON = {
        "current_password": currentPassword,
        "new_password": newPassword
      }

      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(bodyJSON),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const dataStatus = res.status

        console.log("Password change response status:", data)
        throw new Error(data?.message || "Fallo al cambiar la contraseña")
                
        
      }
      const data = await res.json()
      console.log("Password changed successfully:", data)
      // Update profile passwordHash (for demo purposes)
      setCurrentProfile({ ...currentProfile, passwordHash: `hashed_${newPassword}` })

      return { success: true, message: "Contraseña actualizada exitosamente" }
    } catch (error: any) {
      return { success: false, message: error.message || "Error al cambiar la contraseña" }
    }

    
  }

  const getPriceHistory = (companyId: string): PriceHistory[] => {
    return priceHistory
      .filter((p) => p.companyId === companyId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  return (
    <DataContext.Provider
      value={{
        markets,
        getMarkets,
        companies,
        positions,
        transactions,
        users,
        priceHistory,
        currentProfile,
        updateProfile,
        changePassword,
        addMarket,
        updateMarket,
        deleteMarket,
        addCompany,
        updateCompany,
        deleteCompany,
        delistCompany,
        getCompanies,
        getUsers,
        addUser,
        updateUser,
        disableUser,
        addPriceHistory,
        loadPricesFromAPI,
        getPriceHistory,
        updatePriceManual,
        loadMultiplePrices,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
