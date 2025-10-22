"use client"

import type React from "react"

import { Building2, DollarSign, LayoutDashboard, LogOut, UserCircle, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataProvider } from "@/lib/data-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/catalogos",
      label: "Catálogos",
      icon: Building2,
    },
    {
      href: "/admin/precios",
      label: "Precios y Carga",
      icon: DollarSign,
    },
    {
      href: "/admin/usuarios",
      label: "Usuarios y Cuentas",
      icon: Users,
    },
    {
      href: "/admin/perfil",
      label: "Perfil Personal",
      icon: UserCircle,
    },
  ]

  return (
    <DataProvider>
      <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">BrokerTEC</h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-3">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/">
            <Button variant="outline" className="justify-start gap-3 bg-transparent w-1/5">
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
      </div>
    </DataProvider>
  )
}
