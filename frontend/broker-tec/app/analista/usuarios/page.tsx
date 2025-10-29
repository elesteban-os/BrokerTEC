"use client"

import { useState, useMemo } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react"

export default function UsuarioPage() {
  const { transactions, companies, users } = useData()
  const [searchAlias, setSearchAlias] = useState("")
  const [selectedAlias, setSelectedAlias] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "company" | "type">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell" | "liquidation">("all")
  const [error, setError] = useState("")

  // Get unique aliases from users
  const aliases = useMemo(() => users.map((u) => u.alias), [users])

  // Handle search
  const handleSearch = () => {
    setError("")
    const aliasExists = aliases.some((a) => a.toLowerCase() === searchAlias.toLowerCase())
    if (!aliasExists) {
      setError("alias inexistente")
      setSelectedAlias(null)
      return
    }
    const user = users.find((u) => u.alias.toLowerCase() === searchAlias.toLowerCase())
    if (user) {
      setSelectedAlias(user.id)
    }
  }

  // Get transactions for selected user
  const userTransactions = useMemo(() => {
    if (!selectedAlias) return []

    let filtered = transactions.filter((t) => t.userId === selectedAlias)

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      } else if (sortBy === "company") {
        const companyA = companies.find((c) => c.id === a.companyId)?.name || ""
        const companyB = companies.find((c) => c.id === b.companyId)?.name || ""
        return sortOrder === "asc" ? companyA.localeCompare(companyB) : companyB.localeCompare(companyA)
      } else if (sortBy === "type") {
        return sortOrder === "asc" ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type)
      }
      return 0
    })

    return filtered
  }, [selectedAlias, transactions, filterType, sortBy, sortOrder, companies])

  const toggleSort = (field: "date" | "company" | "type") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const selectedUser = users.find((u) => u.id === selectedAlias)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Usuario (Alias)</h1>
        <p className="text-muted-foreground">Revisar el comportamiento de un usuario por alias</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Usuario</CardTitle>
          <CardDescription>Ingresa el alias del usuario para ver su historial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="alias">Alias del Usuario</Label>
              <Input
                id="alias"
                placeholder="Ej: TradeMaster"
                value={searchAlias}
                onChange={(e) => setSearchAlias(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* User Info and Filters */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historial de {selectedUser.alias}</CardTitle>
                <CardDescription>
                  Rol: {selectedUser.role} | Estado: {selectedUser.status} | Categoría: {selectedUser.category}
                </CardDescription>
              </div>
              <Badge variant={selectedUser.status === "active" ? "default" : "secondary"}>
                {selectedUser.status === "active" ? "Activo" : "Deshabilitado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label>Filtrar por Tipo</Label>
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="buy">Compra</SelectItem>
                    <SelectItem value="sell">Venta</SelectItem>
                    <SelectItem value="liquidation">Liquidación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("date")} className="h-8 px-2">
                        Fecha/Hora
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("company")} className="h-8 px-2">
                        Empresa
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" onClick={() => toggleSort("type")} className="h-8 px-2">
                        Tipo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay transacciones para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    userTransactions.map((transaction) => {
                      const company = companies.find((c) => c.id === transaction.companyId)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.createdAt.toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}{" "}
                            {transaction.createdAt.toLocaleTimeString("es-MX", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{company?.name || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{company?.ticker || "N/A"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "buy"
                                  ? "default"
                                  : transaction.type === "sell"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {transaction.type === "buy" ? (
                                <>
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Compra
                                </>
                              ) : transaction.type === "sell" ? (
                                <>
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  Venta
                                </>
                              ) : (
                                "Liquidación"
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">{transaction.shares.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">${transaction.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            ${transaction.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            {userTransactions.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transacciones</p>
                    <p className="text-2xl font-bold">{userTransactions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compras</p>
                    <p className="text-2xl font-bold text-green-600">
                      {userTransactions.filter((t) => t.type === "buy").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {userTransactions.filter((t) => t.type === "sell").length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
