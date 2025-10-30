"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart2, User, LogOut, Settings, ShieldAlert, Loader2, Key, Mail, AtSign } from "lucide-react";

interface UserData {
  alias: string;
  email: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  country_origin: string;
  role?: {
    nombre: string;
  };
}

export function AnalistaHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [userAlias, setUserAlias] = useState("Cargando...");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para diálogos
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showChangeAliasDialog, setShowChangeAliasDialog] = useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Estados para formulario de edición
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    country_origin: "",
  });

  // Estados para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Estados para cambio de alias/email
  const [newAlias, setNewAlias] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Estado para contraseña de desactivación
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    const alias = localStorage.getItem("user_alias");
    if (alias) {
      setUserAlias(alias);
    }
  }, []);

  // Cargar datos del usuario
  const loadUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar datos del usuario");
      }

      const result = await response.json();
      setUserData(result);
      setEditForm({
        nombre: result.nombre || "",
        apellido1: result.apellido1 || "",
        apellido2: result.apellido2 || "",
        country_origin: result.country_origin || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los datos del usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar perfil");
      }

      toast({
        title: "✅ Perfil actualizado",
        description: "Tus datos se han actualizado correctamente",
      });

      setShowEditDialog(false);
      await loadUserData(); // Recargar datos
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar contraseña");
      }

      toast({
        title: " Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente",
      });

      setShowChangePasswordDialog(false);
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cambiar alias
  const handleChangeAlias = async () => {
    if (!newAlias.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nuevo alias",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias: newAlias }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar alias");
      }

      toast({
        title: " Alias actualizado",
        description: "Tu alias se ha cambiado correctamente. Actualiza tu sesión.",
      });

      // Actualizar el alias en localStorage
      localStorage.setItem("user_alias", newAlias);
      setUserAlias(newAlias);
      
      setShowChangeAliasDialog(false);
      setNewAlias("");
      await loadUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el alias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cambiar email
  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nuevo correo",
        variant: "destructive",
      });
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un correo electrónico válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar email");
      }

      toast({
        title: " Email actualizado",
        description: "Tu correo se ha cambiado correctamente",
      });

      setShowChangeEmailDialog(false);
      setNewEmail("");
      await loadUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Desactivar cuenta
  const handleDeactivateAccount = async () => {
    if (!deletePassword.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa tu contraseña para confirmar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al desactivar cuenta");
      }

      toast({
        title: " Cuenta desactivada",
        description: "Tu cuenta ha sido desactivada. Redirigiendo...",
      });

      setTimeout(() => {
        localStorage.clear();
        router.push("/");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo desactivar la cuenta",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Abrir diálogo de perfil
  const handleOpenProfile = () => {
    setShowProfileDialog(true);
    loadUserData();
  };

  // Abrir diálogo de edición
  const handleOpenEdit = () => {
    setShowProfileDialog(false);
    setShowEditDialog(true);
    if (!userData) loadUserData();
  };

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">BrokerTEC</span>
              <p className="text-sm text-muted-foreground">Analista: {userAlias}</p>
            </div>
          </div>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Mi Cuenta</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Cuenta de Analista</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleOpenProfile}>
                <User className="mr-2 h-4 w-4" />
                Ver Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenEdit}>
                <Settings className="mr-2 h-4 w-4" />
                Editar Datos Personales
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowChangePasswordDialog(true)}>
                <Key className="mr-2 h-4 w-4" />
                Cambiar Contraseña
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowChangeAliasDialog(true)}>
                <AtSign className="mr-2 h-4 w-4" />
                Cambiar Alias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowChangeEmailDialog(true)}>
                <Mail className="mr-2 h-4 w-4" />
                Cambiar Correo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeactivateDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Desactivar Cuenta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Diálogo: Ver Perfil */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mi Perfil</DialogTitle>
            <DialogDescription>Información de tu cuenta de analista</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userData ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Alias</Label>
                <p className="text-base font-semibold">{userData.alias}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
                <p className="text-base">
                  {`${userData.nombre} ${userData.apellido1}${userData.apellido2 ? ' ' + userData.apellido2 : ''}`}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Correo</Label>
                <p className="text-base">{userData.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">País de Origen</Label>
                <p className="text-base">{userData.country_origin}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
                <p className="text-base font-semibold text-primary">{userData.role?.nombre || "ANALISTA"}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No se pudieron cargar los datos
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Cerrar
            </Button>
            <Button onClick={handleOpenEdit}>Editar Datos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Editar Perfil */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal (no puedes cambiar alias ni correo)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={editForm.nombre}
                onChange={(e) =>
                  setEditForm({ ...editForm, nombre: e.target.value })
                }
                placeholder="Juan"
              />
            </div>
            <div>
              <Label htmlFor="apellido1">Primer Apellido</Label>
              <Input
                id="apellido1"
                value={editForm.apellido1}
                onChange={(e) => setEditForm({ ...editForm, apellido1: e.target.value })}
                placeholder="Pérez"
              />
            </div>
            <div>
              <Label htmlFor="apellido2">Segundo Apellido (Opcional)</Label>
              <Input
                id="apellido2"
                value={editForm.apellido2}
                onChange={(e) => setEditForm({ ...editForm, apellido2: e.target.value })}
                placeholder="González"
              />
            </div>
            <div>
              <Label htmlFor="country_origin">País de Origen</Label>
              <Input
                id="country_origin"
                value={editForm.country_origin}
                onChange={(e) => setEditForm({ ...editForm, country_origin: e.target.value })}
                placeholder="Costa Rica"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Cambiar Contraseña */}
      <Dialog open={showChangePasswordDialog} onOpenChange={(open) => {
        setShowChangePasswordDialog(open);
        if (!open) setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y tu nueva contraseña
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current_password">Contraseña Actual</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                placeholder="Tu contraseña actual"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="new_password">Nueva Contraseña</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                placeholder="Repite tu nueva contraseña"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePasswordDialog(false);
                setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Cambiar Alias */}
      <Dialog open={showChangeAliasDialog} onOpenChange={(open) => {
        setShowChangeAliasDialog(open);
        if (!open) setNewAlias("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Alias</DialogTitle>
            <DialogDescription>
              Ingresa tu nuevo alias (nombre de usuario)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current_alias">Alias Actual</Label>
              <Input
                id="current_alias"
                value={userData?.alias || userAlias}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="new_alias">Nuevo Alias</Label>
              <Input
                id="new_alias"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                placeholder="Ingresa tu nuevo alias"
                disabled={loading}
                maxLength={50}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangeAliasDialog(false);
                setNewAlias("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangeAlias} disabled={loading || !newAlias.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar Alias"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Cambiar Email */}
      <Dialog open={showChangeEmailDialog} onOpenChange={(open) => {
        setShowChangeEmailDialog(open);
        if (!open) setNewEmail("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Correo Electrónico</DialogTitle>
            <DialogDescription>
              Ingresa tu nuevo correo electrónico
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current_email">Email Actual</Label>
              <Input
                id="current_email"
                value={userData?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="new_email">Nuevo Email</Label>
              <Input
                id="new_email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo@email.com"
                disabled={loading}
                maxLength={100}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangeEmailDialog(false);
                setNewEmail("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangeEmail} disabled={loading || !newEmail.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Cambiar Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Confirmar Desactivación */}
      <Dialog open={showDeactivateDialog} onOpenChange={(open) => {
        setShowDeactivateDialog(open);
        if (!open) setDeletePassword(""); // Limpiar contraseña al cerrar
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">⚠️ Desactivar Cuenta</DialogTitle>
            <DialogDescription>
              Esta acción deshabilitará tu cuenta permanentemente. No podrás volver a iniciar
              sesión hasta que un administrador la reactive.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <p className="text-sm text-destructive font-medium">
              ¿Estás seguro de que deseas desactivar tu cuenta?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-password">Confirma tu contraseña</Label>
            <Input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeactivateDialog(false);
                setDeletePassword("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateAccount}
              disabled={loading || !deletePassword.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desactivando...
                </>
              ) : (
                "Sí, Desactivar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
