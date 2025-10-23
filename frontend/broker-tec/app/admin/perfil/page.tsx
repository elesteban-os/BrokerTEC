"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Plus, X } from "lucide-react"

export default function PerfilPage() {
  const { currentProfile, updateProfile, changePassword } = useData()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentProfile.name,
    surname1: currentProfile.surname1,
    surname2: currentProfile.surname2,
    alias: currentProfile.alias,
    email: currentProfile.email,
    address: currentProfile.address,
    country: currentProfile.country,
    phones: currentProfile.phones,
  })

  const [newPhone, setNewPhone] = useState("")

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleAddPhone = () => {
    if (newPhone.trim() === "") {
      setProfileMessage({ type: "error", text: "Ingrese un número de teléfono válido" })
      return
    }
    setProfileForm({ ...profileForm, phones: [...profileForm.phones, newPhone.trim()] })
    setNewPhone("")
    setProfileMessage(null)
  }

  const handleRemovePhone = (index: number) => {
    const updatedPhones = profileForm.phones.filter((_, i) => i !== index)
    setProfileForm({ ...profileForm, phones: updatedPhones })
  }

  const handleProfileUpdate = async () => {
    setProfileMessage(null)

    const result = await updateProfile(profileForm)

    if (result.success) {
      setProfileMessage({ type: "success", text: result.message })
    } else {
      setProfileMessage({ type: "error", text: result.message })
    }
  }

  const handlePasswordChange = async () => {
    setPasswordMessage(null)

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }

    // Validate current password is provided
    if (!passwordForm.currentPassword) {
      setPasswordMessage({ type: "error", text: "Ingrese su contraseña actual" })
      return
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)

    if (result.success) {
      setPasswordMessage({ type: "success", text: result.message })
      // Clear password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Back to login
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)

    } else {
      setPasswordMessage({ type: "error", text: result.message })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil Personal</h1>
        <p className="text-muted-foreground">Administra tu información personal y seguridad</p>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tus datos personales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Ingrese su nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname1">Apellido 1</Label>
              <Input
                id="surname1"
                value={profileForm.surname1}
                onChange={(e) => setProfileForm({ ...profileForm, surname1: e.target.value })}
                placeholder="Ingrese su primer apellido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname2">Apellido 2</Label>
              <Input
                id="surname2"
                value={profileForm.surname2}
                onChange={(e) => setProfileForm({ ...profileForm, surname2: e.target.value })}
                placeholder="Ingrese su segundo apellido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={profileForm.alias}
                onChange={(e) => setProfileForm({ ...profileForm, alias: e.target.value })}
                placeholder="Ingrese su alias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País de Origen</Label>
              <Input
                id="country"
                value={profileForm.country}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                placeholder="México"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Números de Teléfono</Label>
            <div className="space-y-2">
              {profileForm.phones.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={phone} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemovePhone(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+52 555 123 4567"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddPhone()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddPhone}
                  className="shrink-0 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {profileMessage && (
            <Alert variant={profileMessage.type === "error" ? "destructive" : "default"}>
              {profileMessage.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{profileMessage.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate}>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Ingrese su contraseña actual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Ingrese su nueva contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirme su nueva contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {passwordMessage && (
            <Alert variant={passwordMessage.type === "error" ? "destructive" : "default"}>
              {passwordMessage.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertDescription>{passwordMessage.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handlePasswordChange}>Cambiar Contraseña</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
