"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Building2, Users, TrendingUp, User } from "lucide-react"

export default function AnalistaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  const navItems = [
    { href: "/analista", label: "Dashboard", icon: BarChart3 },
    { href: "/analista/empresa", label: "Empresa", icon: Building2 },
    { href: "/analista/usuario", label: "Usuario", icon: Users },
    { href: "/analista/estadisticas", label: "Estadísticas", icon: TrendingUp },
    { href: "/analista/perfil", label: "Perfil", icon: User },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">BrokerTEC</span>
              <p className="text-sm text-muted-foreground">Analista: analista_principal</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="h-10 bg-transparent">
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`h-12 rounded-none border-b-2 transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
