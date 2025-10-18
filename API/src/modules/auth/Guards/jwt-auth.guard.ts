import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../Services/jwt.service';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { Repository } from 'typeorm';

/**
 * Interfaz para extender Request con información del usuario autenticado
 */
// Ajuste: id_user ahora es entero (int) en toda la app
export interface AuthenticatedRequest extends Request {
  user?: {
    id_user: number; // antes: string (uuid)
    alias: string;
    email: string;
    role: {
      id_role: number;
      role_name: string;
    };
    token_version: number;
  };
}

/**
 * Guard de autenticación JWT
 * Verifica que el usuario tenga un token JWT válido
 */
export class JwtAuthGuard {
  private jwtService: JwtService;
  private userRepository: Repository<User>;

  constructor() {
    this.jwtService = new JwtService();
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Middleware para verificar autenticación JWT
   */
  async authenticate(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.authorization;
      const token = this.jwtService.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token de autorización requerido',
          error: 'MISSING_TOKEN'
        });
        return;
      }

      // Verificar y decodificar token
      const decoded = await this.jwtService.verifyToken(token, false);

      // Verificar que el usuario existe y está activo
      const user = await this.userRepository.findOne({
        where: { 
          id_user: decoded.id_user,
          token_version: decoded.token_version,
          status: true
        },
        relations: ['role']
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido o usuario no encontrado',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      // Agregar información del usuario al request
      req.user = {
        id_user: user.id_user,
        alias: user.alias,
        email: user.email,
        role: {
          id_role: user.role.id_role,
          role_name: user.role.role_name
        },
        token_version: user.token_version
      };

      next();
    } catch (error: any) {
      console.error('Error en autenticación JWT:', error);

      // Manejo específico de errores JWT
      if (error.message === 'Token expirado') {
        res.status(401).json({
          success: false,
          message: 'Token expirado',
          error: 'TOKEN_EXPIRED'
        });
        return;
      }

      if (error.message === 'Token inválido') {
        res.status(401).json({
          success: false,
          message: 'Token inválido',
          error: 'TOKEN_INVALID'
        });
        return;
      }

      // Error genérico
      res.status(401).json({
        success: false,
        message: 'Error de autenticación',
        error: 'AUTHENTICATION_ERROR'
      });
    }
  }

  /**
   * Método estático para usar como middleware de Express
   */
  static middleware() {
    const guard = new JwtAuthGuard();
    return (req: any, res: Response, next: NextFunction) => {
      return guard.authenticate(req, res, next);
    };
  }
}
