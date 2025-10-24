"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

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
  ticker: string
  marketId: string
  currentPrice: number
  previousPrice: number
  totalShares: number
  marketCap: number
  isActive: boolean
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
  loadedBy: string
  loadMethod: "manual" | "api"
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
  updateMarket: (id: string, market: Partial<Market>) => Promise<{ success: boolean; message: string }>
  deleteMarket: (id: string) => void
  addCompany: (company: Omit<Company, "id" | "createdAt">) => void
  updateCompany: (id: string, company: Partial<Company>) => void
  deleteCompany: (id: string) => void
  delistCompany: (
    id: string,
    liquidationPrice: number,
    reason: string,
  ) => Promise<{ success: boolean; message: string }>
  addUser: (user: Omit<UserCreation, "id" | "createdAt">) => Promise<{ success: boolean; message: string }>
  updateUser: (id: string, user: Partial<User>) => void
  disableUser: (id: string, reason: string) => Promise<{ success: boolean; message: string }>
  addPriceHistory: (price: Omit<PriceHistory, "id">) => void
  loadPricesFromAPI: (apiKey: string) => Promise<{ success: boolean; message: string }>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [markets, setMarkets] = useState<Market[]>([
    {
      id: "1",
      name: "NASDAQ",
      currency: "USD",
      enabled: true,
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "NYSE",
      currency: "USD",
      enabled: false,
      createdAt: new Date("2024-01-01"),
    },
  ])

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: "1",
      name: "Apple Inc.",
      ticker: "AAPL",
      marketId: "1",
      currentPrice: 178.5,
      previousPrice: 175.2,
      totalShares: 15000000000,
      marketCap: 2677500000000,
      isActive: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Microsoft Corporation",
      ticker: "MSFT",
      marketId: "1",
      currentPrice: 420.3,
      previousPrice: 415.8,
      totalShares: 7430000000,
      marketCap: 3122829000000,
      isActive: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "3",
      name: "Tesla Inc.",
      ticker: "TSLA",
      marketId: "1",
      currentPrice: 245.6,
      previousPrice: 238.9,
      totalShares: 3180000000,
      marketCap: 780888000000,
      isActive: true,
      createdAt: new Date("2024-01-20"),
    },
  ])

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

  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([
    // Apple (AAPL) history
    {
      id: "1",
      companyId: "1",
      price: 170.5,
      timestamp: new Date("2024-02-25T10:00:00"),
      loadedBy: "admin",
      loadMethod: "manual",
    },
    {
      id: "2",
      companyId: "1",
      price: 172.3,
      timestamp: new Date("2024-02-26T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    {
      id: "3",
      companyId: "1",
      price: 175.2,
      timestamp: new Date("2024-02-27T10:00:00"),
      loadedBy: "admin",
      loadMethod: "manual",
    },
    {
      id: "4",
      companyId: "1",
      price: 176.8,
      timestamp: new Date("2024-02-28T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    {
      id: "5",
      companyId: "1",
      price: 178.5,
      timestamp: new Date("2024-02-29T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    // Microsoft (MSFT) history
    {
      id: "6",
      companyId: "2",
      price: 410.2,
      timestamp: new Date("2024-02-25T10:00:00"),
      loadedBy: "admin",
      loadMethod: "manual",
    },
    {
      id: "7",
      companyId: "2",
      price: 412.5,
      timestamp: new Date("2024-02-26T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    {
      id: "8",
      companyId: "2",
      price: 415.8,
      timestamp: new Date("2024-02-27T10:00:00"),
      loadedBy: "admin",
      loadMethod: "manual",
    },
    {
      id: "9",
      companyId: "2",
      price: 418.1,
      timestamp: new Date("2024-02-28T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    {
      id: "10",
      companyId: "2",
      price: 420.3,
      timestamp: new Date("2024-02-29T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    // Tesla (TSLA) history
    {
      id: "11",
      companyId: "3",
      price: 235.4,
      timestamp: new Date("2024-02-25T10:00:00"),
      loadedBy: "admin",
      loadMethod: "manual",
    },
    {
      id: "12",
      companyId: "3",
      price: 238.9,
      timestamp: new Date("2024-02-26T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    {
      id: "13",
      companyId: "3",
      price: 241.2,
      timestamp: new Date("2024-02-27T10:00:00"),
      loadedBy: "admin",
      loadMethod: "manual",
    },
    {
      id: "14",
      companyId: "3",
      price: 243.5,
      timestamp: new Date("2024-02-28T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
    },
    {
      id: "15",
      companyId: "3",
      price: 245.6,
      timestamp: new Date("2024-02-29T10:00:00"),
      loadedBy: "admin",
      loadMethod: "api",
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

      if (response.ok) {
        setMarkets([...markets, newMarket])
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
    market: Partial<Market>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setMarkets(markets.map((m) => (m.id === id ? { ...m, ...market } : m)))
      return { success: true, message: "Mercado actualizado correctamente" }
    } catch (error) {
      console.error("Error updating market:", error)
      const err = error as Error
      return { success: false, message: err?.message || "Fallo al actualizar mercado" }
    }
  }

  const deleteMarket = (id: string) => {
    setMarkets(markets.filter((m) => m.id !== id))
  }

  const addCompany = (company: Omit<Company, "id" | "createdAt">) => {
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setCompanies([...companies, newCompany])
  }

  const updateCompany = (id: string, company: Partial<Company>) => {
    setCompanies(companies.map((c) => (c.id === id ? { ...c, ...company } : c)))
  }

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id))
  }

  const delistCompany = async (
    id: string,
    liquidationPrice: number,
    reason: string,
  ): Promise<{ success: boolean; message: string }> => {
    // Find company
    const company = companies.find((c) => c.id === id)
    if (!company) {
      return { success: false, message: "Empresa no encontrada" }
    }

    // Find positions for this company
    const companyPositions = positions.filter((p) => p.companyId === id)

    if (companyPositions.length > 0) {
      // Create liquidation transactions
      const newTransactions: Transaction[] = companyPositions.map((position) => ({
        id: `${Date.now()}-${position.id}`,
        userId: position.userId,
        companyId: id,
        type: "liquidation",
        shares: position.shares,
        price: liquidationPrice,
        total: position.shares * liquidationPrice,
        reason,
        createdAt: new Date(),
      }))

      // Add transactions
      setTransactions([...transactions, ...newTransactions])

      // Remove positions
      setPositions(positions.filter((p) => p.companyId !== id))
    }

    // Mark company as inactive
    setCompanies(companies.map((c) => (c.id === id ? { ...c, isActive: false } : c)))

    return {
      success: true,
      message:
        companyPositions.length > 0
          ? `Empresa deslistada. ${companyPositions.length} posiciones liquidadas.`
          : "Empresa deslistada exitosamente.",
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

  return (
    <DataContext.Provider
      value={{
        markets,
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
        addUser,
        updateUser,
        disableUser,
        addPriceHistory,
        loadPricesFromAPI,
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
