import { Router, Response } from 'express';
import { WalletService } from '../Services/wallet.service';
import { WalletTopUpDto } from '../DTOs/wallet.dto';
import { validateDto } from '../../../common/validate-dto';
import { JwtAuthGuard } from '../Guards/jwt-auth.guard';

const router = Router();
const walletService = new WalletService();

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Operaciones de wallet (status y recargas con límite diario)
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Obtener estado de la wallet del usuario autenticado
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet encontrada
 *       404:
 *         description: Wallet no encontrada
 */
router.get('/wallet',
  JwtAuthGuard.middleware(),
  async (req: any, res: Response) => {
    try {
      const userId: string = req.user.id_user;
      const wallet = await walletService.getWalletByUserId(userId);
      return res.json(wallet);
    } catch (error: any) {
      const status = error.message === 'WALLET_NOT_FOUND' ? 404 : 400;
      return res.status(status).json({ success: false, message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/wallet/top-up:
 *   post:
 *     summary: Recargar saldo de la wallet (respeta límite diario por categoría)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: Recarga exitosa
 *       400:
 *         description: Límite diario alcanzado o monto inválido
 *       404:
 *         description: Wallet no encontrada
 */
router.post('/wallet/top-up',
  JwtAuthGuard.middleware(),
  validateDto(WalletTopUpDto),
  async (req: any, res: Response) => {
    try {
      const userId: string = req.user.id_user;
      const dto: WalletTopUpDto = req.body;
      const result = await walletService.topUpWallet(userId, dto);
      return res.json(result);
    } catch (error: any) {
      const msg = error.message || 'Error en recarga';
      if (msg.includes('Disponible hoy') || msg.toLowerCase().includes('límite')) {
        return res.status(400).json({ success: false, message: msg });
      }
      if (msg === 'WALLET_NOT_FOUND') {
        return res.status(404).json({ success: false, message: 'Wallet no encontrada' });
      }
      if (msg === 'INVALID_AMOUNT') {
        return res.status(400).json({ success: false, message: 'Monto inválido' });
      }
      return res.status(400).json({ success: false, message: msg });
    }
  }
);

export default router;

