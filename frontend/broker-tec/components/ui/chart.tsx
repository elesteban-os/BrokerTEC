"use client"

import * as React from "react"
import { TooltipProps, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

/**
 * Contenedor base para gráficos
 * Ajusta automáticamente su tamaño y aplica padding.
 */
export function ChartContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("h-[300px] w-full p-2", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Tooltip base: envuelve el contenido mostrado en hover
 */
export function ChartTooltip({
  active,
  payload,
  label,
  content,
}: TooltipProps<any, any> & { content?: React.ReactNode }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="rounded-md bg-card p-2 shadow-md border border-border">
      {content ? (
        content
      ) : (
        <ChartTooltipContent label={label} payload={payload} />
      )}
    </div>
  )
}

/**
 * Componente reutilizable para mostrar el contenido del tooltip
 */
export function ChartTooltipContent({
  label,
  payload,
}: {
  label?: string
  payload?: { name: string; value: number; color?: string }[]
}) {
  return (
    <div className="space-y-1">
      {label && (
        <p className="text-sm font-medium text-foreground">{label}</p>
      )}
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || "var(--color-chart-1)" }}
          />
          <span className="text-muted-foreground">
            {entry.name}:{" "}
            <span className="font-semibold text-primary">
              {entry.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}
