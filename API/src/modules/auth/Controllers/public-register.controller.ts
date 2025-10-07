import { Router, Request, Response } from 'express';
import { PublicRegisterService } from '../Services/public-register.service';
import { RegisterPublicDto } from '../DTOs/public-register.dto';
import { validateDto } from '../../../common/validate-dto';

/**
 * @swagger
 * tags:
 *   name: Public Registration
 *   description: Endpoints de registro público (solo para rol TRADER)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro público de nuevo usuario TRADER
 *     description: Permite el registro público de nuevos usuarios con rol TRADER
 *     tags: [Public Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPublicDto'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                   example: "Usuario registrado exitosamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     alias:
 *                       type: string
 *                       example: "nuevo_trader"
 *                     email:
 *                       type: string
 *                       example: "trader@brokertec.com"
 *                     nombre:
 *                       type: string
 *                       example: "Juan"
 *                     apellido1:
 *                       type: string
 *                       example: "Pérez"
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
const publicRegisterService = new PublicRegisterService();

router.post('/register', validateDto(RegisterPublicDto), async (req: Request, res: Response) => {
  try {
    const registerDto: RegisterPublicDto = req.body;
    const result = await publicRegisterService.registerPublic(registerDto);
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error en registro público:', error);
    
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