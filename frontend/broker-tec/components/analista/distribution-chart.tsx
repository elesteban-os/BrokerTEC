import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  Traders: number
  Administración: number
}

interface DistributionChartProps {
  data: ChartData[]
  viewLevel: "market" | "company"
}

export function DistributionChart({ data, viewLevel }: DistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Tenencia (%)</CardTitle>
        <CardDescription>
          Porcentaje de acciones en traders vs. administración por {viewLevel === "market" ? "mercado" : "empresa"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
            <Bar dataKey="Traders" fill="rgba(1, 63, 96)" />
            <Bar dataKey="Administración" fill="black" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
