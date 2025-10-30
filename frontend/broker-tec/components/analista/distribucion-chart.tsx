"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DistribucionChartProps {
  porcentajeTraders: number;
  porcentajeTesoreria: number;
  nivel: "empresa" | "mercado";
  titulo?: string;
}

const COLORS = {
  traders: "#3b82f6", // Azul (blue-500)
  tesoreria: "#a855f7", // Púrpura (purple-500)
};

export function DistribucionChart({
  porcentajeTraders,
  porcentajeTesoreria,
  nivel,
  titulo,
}: DistribucionChartProps) {
  // Preparar datos para el gráfico
  const data = [
    {
      name: "Traders",
      value: porcentajeTraders,
      fill: COLORS.traders,
    },
    {
      name: "Tesorería",
      value: porcentajeTesoreria,
      fill: COLORS.tesoreria,
    },
  ];

  // Custom label para mostrar porcentajes dentro del gráfico
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>
          {titulo || `Distribución de Acciones - ${nivel === "empresa" ? "Por Empresa" : "Por Mercado"}`}
        </CardTitle>
        <CardDescription>
          Comparación entre acciones en poder de Traders vs. Tesorería (Administración)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gráfico de pastel */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Estadísticas detalladas */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="border-l-4 pl-4" style={{ borderColor: COLORS.traders }}>
              <p className="text-sm font-medium text-muted-foreground">Traders (Inversionistas)</p>
              <p className="text-3xl font-bold">{porcentajeTraders.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Acciones en manos de inversionistas privados
              </p>
            </div>

            <div className="border-l-4 pl-4" style={{ borderColor: COLORS.tesoreria }}>
              <p className="text-sm font-medium text-muted-foreground">Tesorería (Administración)</p>
              <p className="text-3xl font-bold">{porcentajeTesoreria.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Acciones disponibles sin vender
              </p>
            </div>

            {/* Indicador de predominancia */}
            <div className="pt-4 border-t">
              {porcentajeTraders > porcentajeTesoreria ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.traders }} />
                  <span className="font-medium">
                    Predominancia de Traders (+{(porcentajeTraders - porcentajeTesoreria).toFixed(2)}%)
                  </span>
                </div>
              ) : porcentajeTesoreria > porcentajeTraders ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.tesoreria }} />
                  <span className="font-medium">
                    Predominancia de Tesorería (+{(porcentajeTesoreria - porcentajeTraders).toFixed(2)}%)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Distribución Equilibrada (50/50)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
