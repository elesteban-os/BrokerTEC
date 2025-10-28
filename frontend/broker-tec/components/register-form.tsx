"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

interface RegisterFormProps {
  open: boolean
  onClose: () => void
  onResult?: (result: { success: boolean; message: string }) => void
}

export default function RegisterForm({ open, onClose, onResult }: RegisterFormProps) {
  const [alias, setAlias] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
      alias: "",
      email: "",
      nombre: "",
      apellido1: "",
      apellido2: "",
      password: "",
      country_origin: "",
      phone_numbers: [""],
})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    console.log("Submitting register form with data:", formData)

    if (!formData.alias.trim() || !formData.email.trim() || !formData.password || !formData.nombre.trim() || !formData.apellido1.trim() || !formData.apellido2.trim() || !formData.country_origin.trim() || !formData.phone_numbers[0].trim()) {
      setError("Completa todos los campos")
      return
    }

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      setError("Email inválido")
      return
    }

    setLoading(true)
     try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.message || "Error al registrar"
        setError(msg)
        onResult?.({ success: false, message: msg })
        return
      }
      console.log("Register data:", formData)
      onResult?.({ success: true, message: data?.message || "Registro exitoso" })
      //onResult?.({ success: true, message: "Registro exitoso" })
      // close modal on success
      onClose()
    } catch (err: any) {
      setError(err?.message || "Error al procesar")
      onResult?.({ success: false, message: err?.message || "Error" })
    } finally {
      setLoading(false)
    }
  }

  const addPhone = () => {
    setFormData({ ...formData, phone_numbers: [...formData.phone_numbers, ""] })
  }

  const removePhone = (index: number) => {
    setFormData({ ...formData, phone_numbers: formData.phone_numbers.filter((_, i) => i !== index) })
  }

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...formData.phone_numbers]
    newPhones[index] = value
    setFormData({ ...formData, phone_numbers: newPhones })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrarse</DialogTitle>
          <DialogDescription>Crear una nueva cuenta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="reg-alias">Alias</Label>
                <Input id="reg-alias" value={formData.alias} onChange={(e) => setFormData({ ...formData, alias: e.target.value })} required />
            </div>
        
            <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Nombre</Label>
            <Input id="reg-name" type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
          </div>

        
          <div className="space-y-2">
            <Label htmlFor="reg-surname1">Apellido 1</Label>
            <Input id="reg-surname1" type="text" value={formData.apellido1} onChange={(e) => setFormData({ ...formData, apellido1: e.target.value })} required />
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="reg-surname2">Apellido 2</Label>
            <Input id="reg-surname2" type="text" value={formData.apellido2} onChange={(e) => setFormData({ ...formData, apellido2: e.target.value })} required />
          </div>
        </div>

          <div className="space-y-2">
            <Label htmlFor="reg-country">País</Label>
            <Input id="reg-country" type="text" value={formData.country_origin} onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })} required />
          </div>

            <div className="col-span-2">
                <Label>Números de Teléfono</Label>
                <div className="space-y-2 mt-2">
                  {formData.phone_numbers.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={phone}
                        onChange={(e) => updatePhone(index, e.target.value)}
                        placeholder="1234-5678"
                      />
                      {formData.phone_numbers.length > 1 && (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input id="reg-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirmar</Label>
              <Input id="reg-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
