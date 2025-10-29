"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Mail, MapPin, Globe, Phone, Lock, Plus, X } from "lucide-react"

export function PerfilForm() {
  // Mock analyst profile data
  const [profile, setProfile] = useState({
    name: "Analista Principal",
    alias: "AnalistaPro",
    email: "analista@brokertec.com",
    address: "Av. Reforma 456, Col. Juárez",
    country: "México",
    phones: ["+52 555 234 5678", "+52 555 876 5432"],
  })

  const [newPhone, setNewPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleUpdateProfile = () => {
    setMessage("")
    setError("")

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profile.email)) {
      setError("email inválido")
      return
    }

    // In a real app, check for duplicate alias
    // For demo, we'll just show success
    setMessage("Perfil actualizado exitosamente")
  }

  const handleAddPhone = () => {
    if (newPhone.trim()) {
      setProfile({ ...profile, phones: [...profile.phones, newPhone.trim()] })
      setNewPhone("")
    }
  }

  const handleRemovePhone = (index: number) => {
    setProfile({
      ...profile,
      phones: profile.phones.filter((_, i) => i !== index),
    })
  }

  const handleChangePassword = () => {
    setMessage("")
    setError("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos son requeridos")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      setError("contraseña débil")
      return
    }

    setMessage("Contraseña actualizada exitosamente")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Perfil Personal</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tus datos personales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-2" />
                Nombre Completo
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">
                <User className="w-4 h-4 inline mr-2" />
                Alias (único)
              </Label>
              <Input
                id="alias"
                value={profile.alias}
                onChange={(e) => setProfile({ ...profile, alias: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <MapPin className="w-4 h-4 inline mr-2" />
              Dirección
            </Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">
              <Globe className="w-4 h-4 inline mr-2" />
              País de Origen
            </Label>
            <Input
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            />
          </div>

          {/* Phone Numbers */}
          <div className="space-y-2">
            <Label>
              <Phone className="w-4 h-4 inline mr-2" />
              Números de Teléfono
            </Label>
            <div className="space-y-2">
              {profile.phones.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={phone} readOnly />
                  <Button variant="outline" size="icon" onClick={() => handleRemovePhone(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar nuevo teléfono"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPhone()}
                />
                <Button variant="outline" size="icon" onClick={handleAddPhone}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <Button onClick={handleUpdateProfile} className="w-full">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              <Lock className="w-4 h-4 inline mr-2" />
              Contraseña Actual
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">
              <Lock className="w-4 h-4 inline mr-2" />
              Nueva Contraseña
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirmar Nueva Contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleChangePassword} className="w-full" variant="secondary">
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
