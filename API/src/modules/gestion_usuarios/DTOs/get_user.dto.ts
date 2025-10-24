// Respuesta para GET /api/users/me (no incluye contraseña)
export interface GetUserResponse {
  id_user: number;
  alias: string;
  email: string;
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  country_origin: string;
  status: boolean;
  role: {
    id_role: number;
    role_name: string;
  };
}

