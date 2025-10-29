import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface DistributionData {
  name: string
  fullName?: string
  traderPercent: number
  adminPercent: number
  traderShares: number
  adminShares: number
  totalShares: number
}

interface DistributionTableProps {
  data: DistributionData[]
  viewLevel: "market" | "company"
}

export function DistributionTable({ data, viewLevel }: DistributionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Distribución</CardTitle>
        <CardDescription>Detalles de tenencia por {viewLevel === "market" ? "mercado" : "empresa"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{viewLevel === "market" ? "Mercado" : "Empresa"}</TableHead>
              <TableHead className="text-right">Total Acciones</TableHead>
              <TableHead className="text-right">Traders</TableHead>
              <TableHead className="text-right">Administración</TableHead>
              <TableHead>Distribución</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {viewLevel === "company" && item.fullName && (
                      <div className="text-sm text-muted-foreground">{item.fullName}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{item.totalShares.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="font-mono">{item.traderShares.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{item.traderPercent.toFixed(2)}%</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-mono">{item.adminShares.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{item.adminPercent.toFixed(2)}%</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20">Traders:</span>
                      <Progress value={item.traderPercent} className="flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20">Admin:</span>
                      <Progress value={item.adminPercent} className="flex-1 [&>div]:bg-muted-foreground" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
