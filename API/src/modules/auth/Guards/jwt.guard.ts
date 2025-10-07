// Guard para verificar JWT tokens
import { Request, Response, NextFunction } from 'express';

// Extender el tipo Request para incluir información del usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id_user: string;
        alias: string;
        email: string;
        role: {
          id_role: number;
          role_name: string;
        };
        token_version: number;
      };
    }
  }
}

export class JwtGuard {
  // TODO: Implementar middleware de autenticación JWT
  
  /**
   * Middleware para verificar JWT token
   */
  static authenticate = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implementar verificación de token
    next();
  };

  /**
   * Middleware para verificar que el usuario es Admin
   */
  static requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implementar verificación de rol Admin
    next();
  };

  /**
   * Middleware para verificar que el usuario es Admin o Analista
   */
  static requireAdminOrAnalyst = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implementar verificación de rol Admin o Analista
    next();
  };

  /**
   * Middleware genérico para verificar roles específicos
   */
  static requireRole = (allowedRoles: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // TODO: Implementar verificación de roles específicos
      next();
    };
  };
}