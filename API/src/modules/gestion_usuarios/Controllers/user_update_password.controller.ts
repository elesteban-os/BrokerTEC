// Controller para endpoint de cambio de contraseña del usuario autenticado
import { Router, Request, Response } from 'express';
import { validateDto } from '../../../common/validate-dto';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { ChangePasswordDto } from '../DTOs/user_update_password.dto';
import { UserUpdatePasswordService } from '../Services/user_update_password.service';

/**
 * @swagger
 * tags:
 *   name: Gestión de Usuario
 *   description: Endpoints de gestión del usuario autenticado
 */

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Cambiar contraseña del usuario autenticado
 *     description: Requiere la contraseña actual para confirmar identidad. Invalida los tokens activos.
 *     tags: [Gestión de Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordDto'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
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
 *                   example: "Contraseña actualizada correctamente"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token inválido o contraseña actual incorrecta
 *       500:
 *         description: Error interno del servidor
 */
const router = Router();
const service = new UserUpdatePasswordService();

// Ruta protegida con JWT. Sólo el usuario autenticado puede cambiar su contraseña
router.put(
  '/me/password',
  JwtAuthGuard.middleware(),
  validateDto(ChangePasswordDto),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.id_user as number;
      const dto: ChangePasswordDto = req.body;
      const result = await service.changeMyPassword(userId, dto);
      res.status(200).json(result);
    } catch (error: any) {
      // Mapeo de errores esperados a HTTP codes
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      if (error.message === 'CURRENT_PASSWORD_INVALID') {
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
      }
      console.error('Error en cambio de contraseña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
);

export default router;

