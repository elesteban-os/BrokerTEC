// Guard para control de acceso basado en roles (RBAC)
import { Request, Response, NextFunction } from 'express';

export class RoleGuard {
  // TODO: Implementar guards de roles específicos
  
  /**
   * Solo administradores pueden acceder
   */
  static adminOnly = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Verificar que user.role.id_role === 1
    next();
  };

  /**
   * Solo analistas pueden acceder
   */
  static analystOnly = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Verificar que user.role.id_role === 2
    next();
  };

  /**
   * Solo traders pueden acceder
   */
  static traderOnly = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Verificar que user.role.id_role === 3
    next();
  };

  /**
   * Admin y Analista pueden acceder
   */
  static adminOrAnalyst = (req: Request, res: Response, next: NextFunction) => {
    // TODO: Verificar que user.role.id_role === 1 || user.role.id_role === 2
    next();
  };

  /**
   * Verificar roles personalizados
   */
  static hasRole = (allowedRoles: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // TODO: Verificar que user.role.id_role esté en allowedRoles
      next();
    };
  };
}