"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserX, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function UsuariosPage() {
  const { users, markets, companies, positions, addUser, updateUser, disableUser } = useData()
  const { toast } = useToast()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [disableReason, setDisableReason] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    alias: "",
    email: "",
    role: "trader" as "admin" | "trader",
    wallet: "10000",
    category: "basic" as "basic" | "intermediate" | "advanced",
    operationLimit: "20000",
    enabledMarkets: [] as string[],
  })

  const handleAddUser = () => {
    if (!formData.alias || !formData.email) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    addUser({
      alias: formData.alias,
      email: formData.email,
      role: formData.role,
      status: "active",
      wallet: Number.parseFloat(formData.wallet),
      enabledMarkets: formData.enabledMarkets,
      category: formData.category,
      operationLimit: Number.parseFloat(formData.operationLimit),
    })

    toast({
      title: "Éxito",
      description: "Usuario creado exitosamente",
    })

    setShowAddDialog(false)
    setFormData({
      alias: "",
      email: "",
      role: "trader",
      wallet: "10000",
      category: "basic",
      operationLimit: "20000",
      enabledMarkets: [],
    })
  }

  const handleEditUser = () => {
    if (!formData.alias || !formData.email) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    updateUser(selectedUser, {
      alias: formData.alias,
      email: formData.email,
      role: formData.role,
      wallet: Number.parseFloat(formData.wallet),
      enabledMarkets: formData.enabledMarkets,
      category: formData.category,
      operationLimit: Number.parseFloat(formData.operationLimit),
    })

    toast({
      title: "Éxito",
      description: "Usuario actualizado exitosamente",
    })

    setShowEditDialog(false)
    setSelectedUser("")
    setFormData({
      alias: "",
      email: "",
      role: "trader",
      wallet: "10000",
      category: "basic",
      operationLimit: "20000",
      enabledMarkets: [],
    })
  }

  const handleDisableUser = async () => {
    if (!disableReason.trim()) {
      toast({
        title: "Error",
        description: "justificación requerida",
        variant: "destructive",
      })
      return
    }

    const result = await disableUser(selectedUser, disableReason)

    if (result.success) {
      toast({
        title: "Éxito",
        description: result.message,
      })
      setShowDisableDialog(false)
      setDisableReason("")
      setSelectedUser("")
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const getUserStockValue = (userId: string) => {
    const userPositions = positions.filter((p) => p.userId === userId)
    return userPositions.reduce((total, position) => {
      const company = companies.find((c) => c.id === position.companyId)
      return total + (company?.currentPrice || 0) * position.shares
    }, 0)
  }

  const getTopTradersByWallet = () => {
    return [...users]
      .sort((a, b) => b.wallet - a.wallet)
      .slice(0, 5)
      .map((u) => ({
        name: u.alias,
        value: u.wallet,
      }))
  }

  const getTopTradersByStocks = () => {
    return [...users]
      .map((u) => ({
        name: u.alias,
        value: getUserStockValue(u.id),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  const handleOpenEditDialog = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setFormData({
        alias: user.alias,
        email: user.email,
        role: user.role,
        wallet: user.wallet.toString(),
        category: user.category,
        operationLimit: user.operationLimit.toString(),
        enabledMarkets: user.enabledMarkets,
      })
      setSelectedUser(userId)
      setShowEditDialog(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuarios y Cuentas</h1>
          <p className="text-muted-foreground">Gestiona usuarios y sus límites de operación</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Ingresa los datos del nuevo usuario</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Alias</Label>
                <Input
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  placeholder="TradeMaster"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="trader@example.com"
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "trader") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "basic" | "intermediate" | "advanced") =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Wallet Inicial (USD)</Label>
                <Input
                  type="number"
                  value={formData.wallet}
                  onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                />
              </div>
              <div>
                <Label>Límite de Operación (USD)</Label>
                <Input
                  type="number"
                  value={formData.operationLimit}
                  onChange={(e) => setFormData({ ...formData, operationLimit: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Mercados Habilitados</Label>
                <div className="flex gap-2 mt-2">
                  {markets.map((market) => (
                    <Button
                      key={market.id}
                      variant={formData.enabledMarkets.includes(market.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const enabled = formData.enabledMarkets.includes(market.id)
                        setFormData({
                          ...formData,
                          enabledMarkets: enabled
                            ? formData.enabledMarkets.filter((id) => id !== market.id)
                            : [...formData.enabledMarkets, market.id],
                        })
                      }}
                    >
                      {market.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddUser}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>Actualiza los datos del usuario</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Alias</Label>
                <Input
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  placeholder="TradeMaster"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="trader@example.com"
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "trader") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: "basic" | "intermediate" | "advanced") =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Wallet (USD)</Label>
                <Input
                  type="number"
                  value={formData.wallet}
                  onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
                />
              </div>
              <div>
                <Label>Límite de Operación (USD)</Label>
                <Input
                  type="number"
                  value={formData.operationLimit}
                  onChange={(e) => setFormData({ ...formData, operationLimit: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Mercados Habilitados</Label>
                <div className="flex gap-2 mt-2">
                  {markets.map((market) => (
                    <Button
                      key={market.id}
                      variant={formData.enabledMarkets.includes(market.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const enabled = formData.enabledMarkets.includes(market.id)
                        setFormData({
                          ...formData,
                          enabledMarkets: enabled
                            ? formData.enabledMarkets.filter((id) => id !== market.id)
                            : [...formData.enabledMarkets, market.id],
                        })
                      }}
                    >
                      {market.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditUser}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Dinero en Wallet</CardTitle>
            <CardDescription>Traders con mayor saldo disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTopTradersByWallet()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Valor en Acciones</CardTitle>
            <CardDescription>Traders con mayor valor en posiciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTopTradersByStocks()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Usuarios</CardTitle>
          <CardDescription>Gestiona usuarios y sus cuentas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Wallet</TableHead>
                <TableHead className="text-right">Valor en Acciones</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Límite</TableHead>
                <TableHead>Mercados</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.alias}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status === "active" ? "Activo" : "Deshabilitado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">${user.wallet.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">${getUserStockValue(user.id).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{user.category}</TableCell>
                  <TableCell className="text-right font-mono">${user.operationLimit.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {user.enabledMarkets.map((marketId) => {
                        const market = markets.find((m) => m.id === marketId)
                        return (
                          <Badge key={marketId} variant="outline" className="text-xs">
                            {market?.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      {user.status === "active" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(user.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={showDisableDialog && selectedUser === user.id}
                            onOpenChange={(open) => {
                              setShowDisableDialog(open)
                              if (open) setSelectedUser(user.id)
                              else {
                                setSelectedUser("")
                                setDisableReason("")
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Deshabilitar Usuario</DialogTitle>
                                <DialogDescription>
                                  Esta acción liquidará todas las posiciones del usuario al precio actual y lo dejará en
                                  modo solo lectura.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Usuario</Label>
                                  <Input value={user.alias} disabled />
                                </div>
                                <div>
                                  <Label>Justificación *</Label>
                                  <Textarea
                                    placeholder="Ingresa la razón para deshabilitar este usuario..."
                                    value={disableReason}
                                    onChange={(e) => setDisableReason(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowDisableDialog(false)
                                    setDisableReason("")
                                    setSelectedUser("")
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDisableUser}>
                                  Deshabilitar Usuario
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
