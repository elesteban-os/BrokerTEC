"use client"

import type React from "react"

import { Building2, DollarSign, LayoutDashboard, LogOut, UserCircle, Users, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { DataProvider } from "@/lib/data-context"


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const router = useRouter()

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
      <aside className={`${isSidebarOpen ? 'w-58' : 'w-14'} relative transition-all duration-150 border-r bg-card overflow-hidden`}>
        <div className="flex h-16 items-center border-b px-3 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen((s) => !s)} aria-label="Toggle sidebar">
            <Menu className="h-5 w-5" />
          </Button>
          {isSidebarOpen && <h1 className="text-xl font-bold text-primary">BrokerTEC</h1>}
        </div>
        <nav className="flex flex-col gap-2 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <div key={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    // programmatic navigation to allow extra behavior (close sidebar)
                    setIsSidebarOpen(false)
                    router.push(item.href)
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Button>
              </div>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-2 right-2">
          <Link href="/">
            <Button variant="outline" className="justify-start gap-3 bg-transparent w-full">
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span>Cerrar Sesión</span>}
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
