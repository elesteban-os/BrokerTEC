import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Transaction, User } from "@/lib/data-context"

interface EmpresaTransactionsTableProps {
  transactions: Transaction[]
  users: User[]
  selectedCompanyId: string
}

export function EmpresaTransactionsTable({ transactions, users, selectedCompanyId }: EmpresaTransactionsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-ES").format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Transacciones</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Fecha y Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const user = users.find((u) => u.id === tx.userId)
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{user?.alias || "desconocido"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          tx.type === "buy"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : tx.type === "sell"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {tx.type === "buy" ? "Compra" : tx.type === "sell" ? "Venta" : "Liquidación"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(tx.shares)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(tx.price)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(tx.total)}</TableCell>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            {selectedCompanyId ? "No hay transacciones en el rango seleccionado" : "Selecciona una empresa"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
