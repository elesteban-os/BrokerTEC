"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Loader2, Activity } from "lucide-react";

interface PrecioHistoricoData {
  precio: number;
  fecha_hora: string;
}

interface HistorialPreciosResponse {
  empresa: {
    id_empresa: number;
    nombre: string;
    precio_actual: number;
  };
  estadisticas: {
    precio_actual: number;
    precio_max: number;
    precio_min: number;
    precio_promedio: number;
    variacion_monto: number;
    variacion_porcentaje: number;
    total_registros: number;
  };
  historial: PrecioHistoricoData[];
}

interface PrecioVsTiempoChartProps {
  nombreEmpresa: string;
  token: string;
}

export function PrecioVsTiempoChart({ nombreEmpresa, token }: PrecioVsTiempoChartProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HistorialPreciosResponse | null>(null);
  const [open, setOpen] = useState(false);

  const fetchHistorialPrecios = async () => {
    if (!nombreEmpresa || !token) return;

    setLoading(true);
    setError(null);

    try {
      const encodedNombre = encodeURIComponent(nombreEmpresa);
      const response = await fetch(
        `/api/analista/reportes/empresa/${encodedNombre}/historial-precios?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener historial de precios");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      console.error("Error fetching historial precios:", err);
      setError(err.message || "Error al cargar el historial de precios");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al abrir el diálogo
  useEffect(() => {
    if (open) {
      fetchHistorialPrecios();
    }
  }, [open]);

  // Formatear datos para el gráfico
  const chartData = data?.historial.map((item) => ({
    fecha: new Date(item.fecha_hora).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    precio: item.precio,
  })) || [];

  const variacionPositiva = (data?.estadisticas.variacion_porcentaje || 0) >= 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Activity className="h-4 w-4" />
          Ver Gráfico de Precios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Precios - {nombreEmpresa}</DialogTitle>
          <DialogDescription>
            Gráfico de Precio vs. Tiempo (últimos 50 registros)
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando historial...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-4">
            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Precio Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${data.estadisticas.precio_actual.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Variación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center gap-1 ${variacionPositiva ? "text-green-600" : "text-red-600"}`}>
                    {variacionPositiva ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <p className="text-2xl font-bold">
                      {variacionPositiva ? "+" : ""}
                      {data.estadisticas.variacion_porcentaje.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${data.estadisticas.variacion_monto > 0 ? "+" : ""}
                    {data.estadisticas.variacion_monto.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Máximo / Mínimo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-green-600">
                    Max: ${data.estadisticas.precio_max.toFixed(2)}
                  </p>
                  <p className="text-sm font-semibold text-red-600">
                    Min: ${data.estadisticas.precio_min.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Precio Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${data.estadisticas.precio_promedio.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.estadisticas.total_registros} registros
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de línea */}
            <Card>
              <CardHeader>
                <CardTitle>Evolución del Precio</CardTitle>
                <CardDescription>
                  Precio de la acción a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{ value: "Precio (USD)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Precio"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="precio"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 5 }}
                      activeDot={{ r: 8 }}
                      name="Precio"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
