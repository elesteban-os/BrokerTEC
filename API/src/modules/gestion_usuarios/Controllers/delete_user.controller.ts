// Controller para eliminar la cuenta del usuario autenticado
import { Router, Response } from 'express';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { validateDto } from '../../../common/validate-dto';
import { DeleteAccountDto } from '../DTOs/delete_user.dto';
import { DeleteUserService } from '../Services/delete_user.service';

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Eliminar cuenta (usuario autenticado)
 *     description: Requiere contraseña para confirmar. Realiza soft delete e invalida tokens.
 *     tags: ["Gestión de Usuario"]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteAccountDto'
 *     responses:
 *       200:
 *         description: Cuenta eliminada correctamente
 *       401:
 *         description: Token inválido o contraseña incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno
 */
const router = Router();
const service = new DeleteUserService();

router.delete(
  '/me',
  JwtAuthGuard.middleware(),
  validateDto(DeleteAccountDto),
  async (req: any, res: Response) => {
    try {
      const userId = req.user.id_user as number; // ID se toma del JWT, no del body
      const { password } = req.body as DeleteAccountDto;
      const result = await service.deleteMyAccount(userId, password);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      if (error.message === 'CURRENT_PASSWORD_INVALID') {
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
      }
      console.error('Error al eliminar cuenta:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
);

export default router;

