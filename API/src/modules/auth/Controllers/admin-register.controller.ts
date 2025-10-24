import { Router, Request, Response } from 'express';
import { AdminRegisterService } from '../Services/admin-register.service';
import { AdminRegisterDto } from '../DTOs/admin-register.dto';
import { validateDto } from '../../../common/validate-dto';
import { JwtAuthGuard, AuthenticatedRequest } from '../Guards/jwt-auth.guard';
import { RolesGuard } from '../Guards/roles.guard';

/**
 * @swagger
 * tags:
 *   name: Admin Registration
 *   description: Endpoints de registro administrativo (solo para ADMIN y ANALISTA)
 */

/**
 * @swagger
 * /api/auth/admin/register:
 *   post:
 *     summary: Registro administrativo de nuevo usuario ADMIN o ANALISTA
 *     description: Permite el registro de nuevos usuarios con rol ADMIN o ANALISTA (requiere autenticación de administrador)
 *     tags: [Admin Registration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminRegisterDto'
 *     responses:
 *       201:
 *         description: Usuario administrativo registrado exitosamente
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
 *                   example: "Usuario ADMINISTRADOR registrado exitosamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: integer
 *                       format: int32
 *                       example: 1
 *                     alias:
 *                       type: string
 *                       example: "nuevo_admin"
 *                     email:
 *                       type: string
 *                       example: "admin@brokertec.com"
 *                     nombre:
 *                       type: string
 *                       example: "Carlos"
 *                     apellido1:
 *                       type: string
 *                       example: "López"
 *                     role_name:
 *                       type: string
 *                       example: "ADMINISTRADOR"
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Token de acceso JWT
 *                     refreshToken:
 *                       type: string
 *                       description: Token de actualización JWT
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
 *         description: No autorizado - Token JWT inválido o faltante
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
 *       403:
 *         description: Prohibido - Permisos insuficientes
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
 *                   example: "Permisos insuficientes para esta acción"
 *       409:
 *         description: Conflicto - Usuario ya existe
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
 *                   example: "El alias o email ya existe"
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

const router = Router();
const adminRegisterService = new AdminRegisterService();

router.post('/admin/register', 
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(AdminRegisterDto), 
  async (req: any, res: Response) => {
  try {
    const registerDto: AdminRegisterDto = req.body;
    const result = await adminRegisterService.registerAdmin(registerDto);
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error en registro administrativo:', error);
    
    // Manejo específico de errores conocidos
    if (error.message === 'ALIAS_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'El alias ya existe'
      });
    }
    
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'El email ya existe'
      });
    }
    
    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
