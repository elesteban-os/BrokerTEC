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
 * - GET /api/trader/wallet/historial - Ver historial de recargas
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
    // 🔹 Obtener información del wallet
    this.router.get(
      '/',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      this.getWallet.bind(this)
    );

    // 🔹 Recargar el wallet
    this.router.post(
      '/recargar',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      validateDto(RecargarWalletDto),
      this.recargarWallet.bind(this)
    );

    // 🔹 Obtener historial de recargas
    this.router.get(
      '/historial',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      this.getHistorialRecargas.bind(this)
    );
  }

  /**
   * GET /api/trader/wallet
   * Obtiene la información del wallet del trader autenticado
   */
  private async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const id_user = req.user!.id_user;
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
      const dto: RecargarWalletDto = req.dto;
      const id_user = req.user!.id_user;
      const alias = req.user!.alias;

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

      if (error.message.includes('límite diario')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('no encontrado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al recargar wallet',
        error: error.message
      });
    }
  }

  /**
   * GET /api/trader/wallet/historial
   * Obtiene el historial de recargas del trader autenticado
   */
  private async getHistorialRecargas(req: any, res: Response): Promise<void> {
    try {
      const id_user = req.user!.id_user;
      const historial = await this.walletService.getHistorialRecargas(id_user);

      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error: any) {
      console.error('Error al obtener historial de recargas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cargar el historial de recargas',
        error: error.message
      });
    }
  }
}
