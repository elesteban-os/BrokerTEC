import { Router, Request, Response } from 'express';
import { LoginService } from '../Services/login.service';
import { LoginDto } from '../DTOs/login.dto';
import { RefreshTokenDto } from '../DTOs/refresh-token.dto';
import { validateDto } from '../../../common/validate-dto';
import { JwtAuthGuard } from '../Guards/jwt-auth.guard';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints de autenticación (login, refresh, logout)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autenticar usuario y obtener tokens JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos de entrada inválidos"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Credenciales inválidas"
 *       403:
 *         description: Usuario deshabilitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario deshabilitado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar tokens
 *     description: Obtener nuevos tokens JWT usando refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenDto'
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Refresh token inválido"
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalidar tokens JWT del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada exitosamente"
 *       401:
 *         description: Token JWT inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token de autorización requerido"
 *       500:
 *         description: Error interno del servidor
 */

const router = Router();
const loginService = new LoginService();

// Login
router.post('/login', validateDto(LoginDto), async (req: Request, res: Response) => {
  try {
    const loginDto: LoginDto = req.body;
    const result = await loginService.login(loginDto);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error en login:', error);
    
    // Manejo específico de errores conocidos
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    if (error.message === 'USER_DISABLED') {
      return res.status(403).json({
        success: false,
        message: 'Usuario deshabilitado'
      });
    }
    
    if (error.message === 'USER_ROLE_NOT_FOUND') {
      return res.status(500).json({
        success: false,
        message: 'Error de configuración de usuario'
      });
    }
    
    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Refresh token
router.post('/refresh', validateDto(RefreshTokenDto), async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    const result = await loginService.refreshToken(refresh_token);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error en refresh token:', error);
    
    if (error.message === 'INVALID_REFRESH_TOKEN') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Logout (requiere JWT middleware)
router.post('/logout', JwtAuthGuard.middleware(), async (req: any, res: Response) => {
  try {
    const userId = req.user.id_user;
    await loginService.logout(userId);
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en logout:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;