// Controller para obtener el perfil del usuario autenticado
import { Router, Response } from 'express';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { GetUserService } from '../Services/get_user.service';

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Gestión de Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
const router = Router();
const service = new GetUserService();

router.get('/me', JwtAuthGuard.middleware(), async (req: any, res: Response) => {
  try {
    const userId = req.user.id_user as number;
    const user = await service.getMe(userId);
    res.status(200).json(user);
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;

