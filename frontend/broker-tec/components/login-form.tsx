"use client"

import type React from "react"

import { useState } from "react"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ "alias": alias, "password": password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Credenciales inválidas")
      }
      const data = await res.json()
      console.log("Login exitoso", data)
      // TODO: redirigir (por ejemplo, usando router.push('/dashboard'))
      // Guardar datos de sesión en localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("authToken", data.access_token)
      localStorage.setItem("refreshToken", data.refresh_token)

      const role = data.user?.role?.role_name
      console.log("User role:", role)
      if (role === "ADMINISTRADOR") {
        window.location.href = "/admin"
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}")
      console.log("User data:", user)
    } catch (err: any) {
      setError(err.message || "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Logo and Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-foreground">BrokerTEC</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Bienvenido de vuelta</h2>
        <p className="text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
      </div>

      {/* Login Form */}
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
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
          Iniciar sesión
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