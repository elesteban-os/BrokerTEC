// Controller para actualizar el perfil del usuario autenticado (sin contraseña)
import { Router, Response } from 'express';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { validateDto } from '../../../common/validate-dto';
import { EditUserDto } from '../DTOs/edit_user.dto';
import { EditUserService } from '../Services/edit_user.service';

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado (sin contraseña)
 *     tags: [Gestión de Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditUserDto'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       409:
 *         description: Alias o email ya existen
 *       404:
 *         description: Usuario no encontrado
 */
const router = Router();
const service = new EditUserService();

router.put('/me', JwtAuthGuard.middleware(), validateDto(EditUserDto), async (req: any, res: Response) => {
  try {
    const userId = req.user.id_user as number;
    const dto: EditUserDto = req.body;
    const result = await service.updateMe(userId, dto);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (error.message === 'ALIAS_ALREADY_EXISTS') {
      return res.status(409).json({ success: false, message: 'El alias ya existe' });
    }
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({ success: false, message: 'El email ya existe' });
    }
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;

