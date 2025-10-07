// Tipos e interfaces para autenticación
export interface JwtPayload {
  id_user: string;
  alias: string;
  email: string;
  role: {
    id_role: number;
    role_name: string;
  };
  token_version: number;
  iat?: number; // issued at
  exp?: number; // expiration time
}

export interface AuthenticatedUser {
  id_user: string;
  alias: string;
  email: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  role: {
    id_role: number;
    role_name: string;
  };
  token_version: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export enum AuthErrors {
  INVALID_CREDENTIALS = 'Credenciales inválidas',
  USER_NOT_FOUND = 'Usuario no encontrado',
  USER_DISABLED = 'Usuario deshabilitado',
  TOKEN_EXPIRED = 'Token expirado',
  TOKEN_INVALID = 'Token inválido',
  TOKEN_REVOKED = 'Token revocado',
  INSUFFICIENT_PERMISSIONS = 'Permisos insuficientes',
  EMAIL_ALREADY_EXISTS = 'Email ya existe',
  ALIAS_ALREADY_EXISTS = 'Alias ya existe'
}