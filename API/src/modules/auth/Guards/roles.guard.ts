import { Response, NextFunction } from 'express';

/**
 * Guard de autorización por roles
 * Verifica que el usuario autenticado tenga uno de los roles permitidos
 */
export class RolesGuard {
  /**
   * Verifica que el usuario tenga uno de los roles permitidos
   */
  static hasRole(allowedRoles: string[]) {
    return (req: any, res: Response, next: NextFunction): void => {
      try {
        // Verificar que el usuario esté autenticado (debería venir del JwtAuthGuard)
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Usuario no autenticado',
            error: 'NOT_AUTHENTICATED'
          });
          return;
        }

        // Verificar que el usuario tenga uno de los roles permitidos
        const userRole = req.user.role.role_name;
        
        if (!allowedRoles.includes(userRole)) {
          res.status(403).json({
            success: false,
            message: `Permisos insuficientes. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
            error: 'INSUFFICIENT_PERMISSIONS',
            required_roles: allowedRoles,
            user_role: userRole
          });
          return;
        }

        // Usuario autorizado, continuar
        next();
      } catch (error) {
        console.error('Error en verificación de roles:', error);
        
        res.status(500).json({
          success: false,
          message: 'Error interno en verificación de permisos',
          error: 'ROLE_CHECK_ERROR'
        });
      }
    };
  }

  /**
   * Guard específico para administradores únicamente
   */
  static adminOnly() {
    return RolesGuard.hasRole(['ADMINISTRADOR']);
  }

  /**
   * Guard para administradores y analistas
   */
  static adminOrAnalyst() {
    return RolesGuard.hasRole(['ADMINISTRADOR', 'ANALISTA']);
  }

  /**
   * Guard para todos los roles autenticados (solo verificar que esté logueado)
   */
  static anyAuthenticated() {
    return RolesGuard.hasRole(['ADMINISTRADOR', 'ANALISTA', 'TRADER']);
  }
}