"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Plus, X, UserCircle } from "lucide-react"
import { fetchUserProfile, updateUserProfile, changeUserPassword } from "@/lib/trader-api"

export default function TraderProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [phones, setPhones] = useState<string[]>([])
  const [newPhone, setNewPhone] = useState("")

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null

  // ------------------------------------------------------------
  // Cargar datos del perfil
  // ------------------------------------------------------------
  useEffect(() => {
  const loadProfile = async () => {
    try {
      if (!token) throw new Error("Token no encontrado")
      const user = await fetchUserProfile(token)
      setProfile(user)
      setPhones(user.telefono ? [user.telefono] : [])
    } catch (err: any) {
      console.error("Error al cargar perfil:", err)
      setProfileMessage({ type: "error", text: err.message })
    }
  }
  loadProfile()
}, [token])


  // ------------------------------------------------------------
  // Añadir y eliminar teléfono
  // ------------------------------------------------------------
  const handleAddPhone = () => {
    if (newPhone.trim() === "") {
      setProfileMessage({ type: "error", text: "Ingrese un número válido" })
      return
    }
    setPhones([...phones, newPhone.trim()])
    setNewPhone("")
  }

  const handleRemovePhone = (index: number) => {
    const updated = phones.filter((_, i) => i !== index)
    setPhones(updated)
  }

  // ------------------------------------------------------------
  // Guardar cambios del perfil
  // ------------------------------------------------------------
  const handleSaveProfile = async () => {
    try {
      if (!token) throw new Error("Token no encontrado")
      const updatedProfile = { ...profile, telefono: phones[0] || "" }
      const result = await updateUserProfile(token, updatedProfile)
      setProfileMessage({ type: "success", text: "Perfil actualizado correctamente" })
      setProfile(result)
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message })
    }
  }

  // ------------------------------------------------------------
  // Cambiar contraseña
  // ------------------------------------------------------------
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }

    try {
      if (!token) throw new Error("Token no encontrado")
      await changeUserPassword(token, passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente" })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message })
    }
  }

  // ------------------------------------------------------------
  // Renderizado
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Perfil del Trader</h1>
        </div>
        <Button variant="outline" className="h-9 text-sm" onClick={() => router.push("/trader")}>
          Volver al Dashboard
        </Button>
      </header>

      {/* Información personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tus datos personales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {["nombre", "alias", "direccion", "pais", "correo"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    <Input
                      id={field}
                      value={profile[field] || ""}
                      onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                      placeholder={`Ingrese su ${field}`}
                    />
                  </div>
                ))}
              </div>

              {/* Teléfonos */}
              <div className="space-y-2">
                <Label>Número de teléfono</Label>
                {phones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={phone} disabled className="flex-1" />
                    <Button type="button" variant="outline" size="icon" onClick={() => handleRemovePhone(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+506 8888 8888"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddPhone()}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleAddPhone}>
                    <Plus className="w-4 h-4" />
                  </Button>
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
                <Button className="h-9 text-sm" onClick={handleSaveProfile}>
                  Guardar Cambios
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Cargando datos...</p>
          )}
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>
                {field === "currentPassword"
                  ? "Contraseña actual"
                  : field === "newPassword"
                  ? "Nueva contraseña"
                  : "Confirmar nueva contraseña"}
              </Label>
              <div className="relative">
                <Input
                  id={field}
                  type={showPass[field as keyof typeof showPass] ? "text" : "password"}
                  value={passwordForm[field as keyof typeof passwordForm]}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, [field]: e.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() =>
                    setShowPass({ ...showPass, [field]: !showPass[field as keyof typeof showPass] })
                  }
                >
                  {showPass[field as keyof typeof showPass] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}

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
            <Button className="h-9 text-sm" onClick={handleChangePassword}>
              Cambiar Contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
