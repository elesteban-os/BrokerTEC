"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"

// lazy import to avoid loading dialog unless needed
const RegisterForm = dynamic(() => import("@/components/register-form"), { ssr: false }) as any

export function LoginForm() {
  const [alias, setAlias] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const router = useRouter()

  // ---------------------------------------------
  // FUNCIÓN PRINCIPAL DE LOGIN
  // ---------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ alias, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Credenciales inválidas")
      }

      console.log("✅ Login exitoso:", data)

      // ------------------------------------------------
      // GUARDAR TODOS LOS DATOS IMPORTANTES EN LOCALSTORAGE
      // ------------------------------------------------
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("authToken", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)

      // Datos del usuario
      localStorage.setItem("user_id", String(data.user.id_user))
      localStorage.setItem("user_alias", data.user.alias)
      localStorage.setItem("user_email", data.user.email)
      localStorage.setItem("user_nombre", data.user.nombre || "")
      localStorage.setItem("user_apellido1", data.user.apellido1 || "")
      localStorage.setItem("user_role_id", String(data.user.role.id_role))
      localStorage.setItem("user_role_name", data.user.role.role_name)

      // ------------------------------------------------
      // REDIRECCIONAR SEGÚN EL ROL
      // ------------------------------------------------
      const roleName = data.user.role.role_name?.toUpperCase()

      if (roleName === "ADMINISTRADOR") {
        router.push("/admin")
      } else if (roleName === "ANALISTA") {
        router.push("/analista")
      } else if (roleName === "TRADER") {
        router.push("/trader")
      } else {
        setError("Rol de usuario desconocido. Contacte al administrador.")
      }

    } catch (err: any) {
      console.error("❌ Error en login:", err)
      setError(err.message || "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------
  // INTERFAZ DE USUARIO
  // ---------------------------------------------
  return (
    <div className="space-y-8">
      {/* Logo y encabezado */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-foreground">BrokerTEC</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de vuelta</h2>
        <p className="text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              type="text"
              placeholder="Usuario"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Botón de enviar */}
        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        <div className="flex items-center justify-center mt-2 ">
          <Button variant="ghost" type="button" onClick={() => setShowRegister(true)}>
            Registrarse
          </Button>
        </div>
      </form>
      <RegisterForm open={showRegister} onClose={() => setShowRegister(false)} onResult={(r:any)=>{
        if(r.success){
          // optionally show a success message in the login form
          setError(null)
        } else {
          setError(r.message)
        }
      }} />
    </div>
  )
}
