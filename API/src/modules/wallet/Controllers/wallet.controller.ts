import { Request, Response, Router } from 'express';
import { WalletService } from '../Services/wallet.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { RecargarWalletDto } from '../DTOs/recargar-wallet.dto';
import { validateDto } from '../../../common/validate-dto';

/**
 * Controlador para gestión del wallet de traders
 * Solo accesible por usuarios con rol TRADER
 * 
 * Endpoints:
 * - GET /api/trader/wallet - Ver información del wallet
 * - POST /api/trader/wallet/recargar - Recargar saldo del wallet
 */
export class WalletController {
  public router: Router;
  private walletService: WalletService;

  constructor() {
    this.router = Router();
    this.walletService = new WalletService();
    this.initializeRoutes();
  }

  /**
   * Configurar rutas del controlador
   * Todas las rutas requieren autenticación JWT y rol de TRADER
   */
  private initializeRoutes() {
    /**
     * @swagger
     * /api/trader/wallet:
     *   get:
     *     summary: Ver información del wallet del trader
     *     description: |
     *       **Solo traders autenticados**
     *       
     *       Retorna la información completa del wallet del trader logueado:
     *       - Saldo disponible
     *       - Categoría (JUNIOR/MID/SENIOR)
     *       - Límite diario de recarga
     *       - Consumo del día actual
     *       - Disponible para recargar hoy
     *       - Fecha de última recarga
     *     tags:
     *       - Wallet Trader
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Información del wallet obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     id_wallet:
     *                       type: integer
     *                     saldo:
     *                       type: number
     *                       description: Saldo disponible en USD
     *                     categoria:
     *                       type: string
     *                       enum: [JUNIOR, MID, SENIOR]
     *                       description: Categoría del trader
     *                     limite_diario:
     *                       type: number
     *                       description: Límite máximo de recarga diaria según categoría
     *                     consumo_dia:
     *                       type: number
     *                       description: Monto ya recargado en el día actual
     *                     disponible_hoy:
     *                       type: number
     *                       description: Cuánto puede recargar hoy aún
     *                     fecha_ultima_recarga:
     *                       type: string
     *                       format: date-time
     *                       nullable: true
     *                     fecha_creacion:
     *                       type: string
     *                       format: date-time
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes rol de TRADER
     *       404:
     *         description: Wallet no encontrado (contacta al administrador)
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      this.getWallet.bind(this)
    );

    /**
     * @swagger
     * /api/trader/wallet/recargar:
     *   post:
     *     summary: Recargar saldo del wallet
     *     description: |
     *       **Solo traders autenticados**
     *       
     *       Permite al trader recargar su wallet con efectivo.
     *       
     *       **Límites diarios por categoría:**
     *       - JUNIOR: $5,000 USD/día
     *       - MID: $10,000 USD/día
     *       - SENIOR: $50,000 USD/día
     *       
     *       El consumo diario se resetea automáticamente cada día.
     *       Si se intenta exceder el límite, la operación será rechazada.
     *     tags:
     *       - Wallet Trader
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - monto
     *             properties:
     *               monto:
     *                 type: number
     *                 minimum: 1
     *                 description: Monto a recargar (mínimo $1.00)
     *                 example: 1000.00
     *     responses:
     *       200:
     *         description: Recarga exitosa
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
     *                   example: "Recarga exitosa de $1,000.00"
     *                 data:
     *                   type: object
     *                   properties:
     *                     id_wallet:
     *                       type: integer
     *                     saldo:
     *                       type: number
     *                       description: Nuevo saldo después de la recarga
     *                     categoria:
     *                       type: string
     *                     limite_diario:
     *                       type: number
     *                     consumo_dia:
     *                       type: number
     *                       description: Total recargado hoy
     *                     disponible_hoy:
     *                       type: number
     *                       description: Cuánto puede recargar aún hoy
     *                     fecha_ultima_recarga:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Validación fallida o límite diario excedido
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes rol de TRADER
     *       404:
     *         description: Wallet no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    this.router.post(
      '/recargar',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      validateDto(RecargarWalletDto),
      this.recargarWallet.bind(this)
    );
  }

  /**
   * GET /api/trader/wallet
   * Obtiene la información del wallet del trader autenticado
   */
  private async getWallet(req: Request, res: Response): Promise<void> {
    try {
      // Obtener ID del usuario autenticado desde el token JWT
      const id_user = req.user!.id_user;

      // Obtener información del wallet
      const wallet = await this.walletService.getWallet(id_user);

      res.status(200).json({
        success: true,
        data: wallet
      });

    } catch (error: any) {
      console.error('Error al obtener wallet:', error);

      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al obtener información del wallet',
        error: error.message
      });
    }
  }

  /**
   * POST /api/trader/wallet/recargar
   * Recarga el saldo del wallet del trader
   */
  private async recargarWallet(req: any, res: Response): Promise<void> {
    try {
      // El DTO ya viene validado por el middleware validateDto
      const dto: RecargarWalletDto = req.dto;

      // Obtener información del usuario autenticado
      const id_user = req.user!.id_user;
      const alias = req.user!.alias;

      // Realizar la recarga
      const walletActualizado = await this.walletService.recargarWallet(
        id_user,
        dto.monto,
        alias
      );

      res.status(200).json({
        success: true,
        message: `Recarga exitosa de $${dto.monto.toFixed(2)}`,
        data: walletActualizado
      });

    } catch (error: any) {
      console.error('Error al recargar wallet:', error);

      // Error de límite diario excedido
      if (error.message.includes('límite diario')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      // Error de wallet no encontrado
      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Error al recargar wallet',
        error: error.message
      });
    }
  }
}
