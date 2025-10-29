"use client"

import { useEffect, useRef, useState } from "react"
import { useData } from "@/lib/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserX, Pencil, Plus, X } from "lucide-react"
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
  const { users, markets, companies, positions, addUser, updateUser, disableUser, getUsers, getCompanies } = useData()
  const { toast } = useToast()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [disableReason, setDisableReason] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "trader" | "admin" | "analista">("trader")

  // Resultado de la operación (modal)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null)
  const [resultMessage, setResultMessage] = useState("")

  const calledRef = useRef(false)

  useEffect(() => {
        if (calledRef.current) return
        calledRef.current = true
        getUsers().catch((e) => console.error("getUsers failed", e))
        getCompanies().catch((e) => console.error("getCompanies failed", e))
  }, [getUsers])

  const [formData, setFormData] = useState({
    alias: "",
    email: "",
    nombre: "",
    apellido1: "",
    apellido2: "",
    countryOrigin: "",
    phones: [""],
    password: "",
    role: "analista" as "admin" | "trader" | "analista",
    wallet: "10000",
    category: "basic" as "basic" | "intermediate" | "advanced",
    operationLimit: "20000",
    enabledMarkets: [] as string[],
  })

  const addPhone = () => {
    setFormData({ ...formData, phones: [...formData.phones, ""] })
  }

  const removePhone = (index: number) => {
    setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== index) })
  }

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...formData.phones]
    newPhones[index] = value
    setFormData({ ...formData, phones: newPhones })
  }

  const handleAddUser = async () => {
    if (!formData.alias || !formData.email || !formData.nombre || !formData.apellido1 || !formData.password) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const validPhones = formData.phones.filter((p) => p.trim() !== "")

    const newUser: any = {
      alias: formData.alias,
      email: formData.email,
      nombre: formData.nombre,
      apellido1: formData.apellido1,
      apellido2: formData.apellido2,
      countryOrigin: formData.countryOrigin,
      password: formData.password,
      phones: validPhones,
      role: formData.role,
      status: "active",
    }

    if (formData.role === "trader") {
      newUser.wallet = Number.parseFloat(formData.wallet)
      newUser.enabledMarkets = formData.enabledMarkets
      newUser.category = formData.category
      newUser.operationLimit = Number.parseFloat(formData.operationLimit)
    }

    const res = await addUser(newUser)

    // show result modal
    setResultSuccess(res.success)
    setResultMessage(res.message || (res.success ? "Usuario creado" : "Error al crear usuario"))
    setResultDialogOpen(true)

    if (res.success) {
      toast({ title: "Éxito", description: res.message })
      setShowAddDialog(false)
      setFormData({
        alias: "",
        email: "",
        nombre: "",
        apellido1: "",
        apellido2: "",
        countryOrigin: "",
        phones: [""],
        password: "",
        role: "trader",
        wallet: "10000",
        category: "basic",
        operationLimit: "20000",
        enabledMarkets: [],
      })
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" })
    }
  }

  const handleEditUser = () => {
    if (!formData.alias || !formData.email || !formData.nombre || !formData.apellido1) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    const validPhones = formData.phones.filter((p) => p.trim() !== "")

    const updatedUser: any = {
      alias: formData.alias,
      email: formData.email,
      nombre: formData.nombre,
      apellido1: formData.apellido1,
      apellido2: formData.apellido2,
      countryOrigin: formData.countryOrigin,
      phones: validPhones,
      role: formData.role,
    }

    if (formData.role === "trader") {
      updatedUser.wallet = Number.parseFloat(formData.wallet)
      updatedUser.enabledMarkets = formData.enabledMarkets
      updatedUser.category = formData.category
      updatedUser.operationLimit = Number.parseFloat(formData.operationLimit)
    }

    updateUser(selectedUser, updatedUser)

    toast({
      title: "Éxito",
      description: "Usuario actualizado exitosamente",
    })

    setShowEditDialog(false)
    setSelectedUser("")
    setFormData({
      alias: "",
      email: "",
      nombre: "",
      apellido1: "",
      apellido2: "",
      countryOrigin: "",
      phones: [""],
      password: "",
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
      return total + position.averagePrice * position.shares
    }, 0)
  }

  const getTopTradersByWallet = () => {
    return [...users]
      .filter((u) => u.role === "trader")
      .sort((a, b) => (b.wallet || 0) - (a.wallet || 0))
      .slice(0, 5)
      .map((u) => ({
        name: u.alias,
        value: u.wallet || 0,
      }))
  }

  const getTopTradersByStocks = () => {
    return [...users]
      .filter((u) => u.role === "trader")
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
        nombre: user.nombre,
        apellido1: user.apellido1,
        apellido2: user.apellido2,
        countryOrigin: user.countryOrigin,
        phones: user.phones.length > 0 ? user.phones : [""],
        password: "",
        role: user.role,
        wallet: (user.wallet || 10000).toString(),
        category: user.category || "basic",
        operationLimit: (user.operationLimit || 20000).toString(),
        enabledMarkets: user.enabledMarkets || [],
      })
      setSelectedUser(userId)
      setShowEditDialog(true)
    }
  }

  const filteredUsers = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter)

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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  placeholder="usuario@example.com"
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div>
                <Label>Apellido 1</Label>
                <Input
                  value={formData.apellido1}
                  onChange={(e) => setFormData({ ...formData, apellido1: e.target.value })}
                  placeholder="García"
                />
              </div>
              <div>
                <Label>Apellido 2</Label>
                <Input
                  value={formData.apellido2}
                  onChange={(e) => setFormData({ ...formData, apellido2: e.target.value })}
                  placeholder="López"
                />
              </div>
              <div>
                <Label>País de Origen</Label>
                <Input
                  value={formData.countryOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOrigin: e.target.value })}
                  placeholder="México"
                />
              </div>
              <div>
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "trader" | "analista") => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Números de Teléfono</Label>
                <div className="space-y-2 mt-2">
                  {formData.phones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={phone}
                        onChange={(e) => updatePhone(index, e.target.value)}
                        placeholder="+52 555 123 4567"
                      />
                      {formData.phones.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removePhone(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addPhone}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Teléfono
                  </Button>
                </div>
              </div>

              {formData.role === "trader" && (
                <>
                  <div className="col-span-2">
                    <hr className="my-2" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Configuración de Trader</h3>
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
                </>
              )}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {formData.role === "trader" && (
                <>
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Configuración de Trader</h3>
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
                </>
              )}
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

      {/* Resultado de la operación: modal */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resultSuccess ? "Éxito" : "Error"}</DialogTitle>
            <DialogDescription>{resultMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setResultDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Usuarios</CardTitle>
              <CardDescription>Gestiona usuarios y sus cuentas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alias</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                {(roleFilter === "all" || roleFilter === "trader") && (
                  <>
                    <TableHead className="text-right">Wallet</TableHead>
                    <TableHead className="text-right">Valor en Acciones</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Límite</TableHead>
                    <TableHead>Mercados</TableHead>
                  </>
                )}
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.alias}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : user.role === "analista" ? "outline" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status === "active" ? "Activo" : "Deshabilitado"}
                    </Badge>
                  </TableCell>
                  {(roleFilter === "all" || roleFilter === "trader") && (
                    <>
                      <TableCell className="text-right font-mono">
                        {user.role === "trader" ? `$${(user.wallet || 0).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {user.role === "trader" ? `$${getUserStockValue(user.id).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="capitalize">{user.role === "trader" ? user.category : "-"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {user.role === "trader" ? `$${(user.operationLimit || 0).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        {user.role === "trader" && user.enabledMarkets ? (
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
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  )}
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
                                  {user.role === "trader"
                                    ? "Esta acción liquidará todas las posiciones del usuario al precio actual y lo dejará en modo solo lectura."
                                    : "Esta acción deshabilitará el usuario y lo dejará en modo solo lectura."}
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
