import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BrokerTEC",
  description: "Plataforma de trading para Traders — BrokerTEC",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Activa diseño responsive en móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body
        className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}
      >
        {/* Contenido principal de la app */}
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 flex flex-col">{children}</main>
        </div>

        {/* Sistema de notificaciones global */}
        <Toaster />
      </body>
    </html>
  )
}
