import { Router, Response } from 'express';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { validateDto } from '../../../common/validate-dto';
import { ChangeCategoryDto } from '../DTOs/change-category.dto';
import { DisableTraderDto } from '../DTOs/disable-trader.dto';
import { TraderManagementService } from '../Services/trader-management.service';

/**
 * @swagger
 * tags:
 *   name: Admin - Gestión de Traders
 *   description: Endpoints para que administradores gestionen traders (Solo ADMINISTRADORES)
 */

const router = Router();
const service = new TraderManagementService();

/**
 * @swagger
 * /api/admin/traders:
 *   get:
 *     summary: Listar todos los traders del sistema
 *     description: Obtiene la lista completa de traders con información de sus wallets y posiciones (Solo ADMINISTRADORES)
 *     tags: [Admin - Gestión de Traders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true = activos, false = deshabilitados)
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [JUNIOR, MID, SENIOR]
 *         description: Filtrar por categoría de wallet
 *     responses:
 *       200:
 *         description: Lista de traders obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 */
router.get(
  '/',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  async (req: any, res: Response) => {
    try {
      // Extraer filtros de query params
      const filtros: any = {};
      
      if (req.query.status !== undefined) {
        filtros.status = req.query.status === 'true';
      }
      
      if (req.query.categoria) {
        filtros.categoria = req.query.categoria;
      }

      const traders = await service.listTraders(filtros);

      res.json({
        success: true,
        message: 'Lista de traders obtenida exitosamente',
        data: traders,
        total: traders.length
      });
    } catch (error: any) {
      console.error('Error al listar traders:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error al listar traders',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/traders/{id}:
 *   get:
 *     summary: Obtener detalle de un trader específico
 *     description: Obtiene información detallada de un trader incluyendo wallet, posiciones y estadísticas (Solo ADMINISTRADORES)
 *     tags: [Admin - Gestión de Traders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trader
 *     responses:
 *       200:
 *         description: Detalle del trader obtenido exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Trader no encontrado
 */
router.get(
  '/:id',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const trader = await service.getTraderDetail(id);

      res.json({
        success: true,
        message: 'Detalle del trader obtenido exitosamente',
        data: trader
      });
    } catch (error: any) {
      console.error('Error al obtener detalle del trader:', error);
      
      if (error.message === 'Trader no encontrado' || error.message === 'El usuario no es un trader') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle del trader',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/traders/{id}/categoria:
 *   patch:
 *     summary: Cambiar categoría de wallet de un trader
 *     description: Actualiza la categoría (JUNIOR/MID/SENIOR) y límite diario del wallet de un trader (Solo ADMINISTRADORES)
 *     tags: [Admin - Gestión de Traders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trader
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nueva_categoria:
 *                 type: string
 *                 enum: [JUNIOR, MID, SENIOR]
 *                 example: MID
 *             required:
 *               - nueva_categoria
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       400:
 *         description: Datos inválidos o trader ya tiene esa categoría
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Trader no encontrado o sin wallet
 */
router.patch(
  '/:id/categoria',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(ChangeCategoryDto),
  async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const dto: ChangeCategoryDto = req.body;
      
      // Obtener información del admin desde el JWT
      const adminId = req.user.id_user;
      const adminAlias = req.user.alias;
      const adminRole = req.user.role.role_name;

      const resultado = await service.changeCategory(id, dto, adminId, adminAlias, adminRole);

      res.json({
        success: true,
        message: `Categoría actualizada de ${resultado.categoria_anterior} a ${resultado.wallet.categoria}`,
        data: {
          wallet: {
            id_wallet: resultado.wallet.id_wallet,
            categoria: resultado.wallet.categoria,
            limite_diario: resultado.wallet.limite_diario,
            saldo: resultado.wallet.saldo
          },
          categoria_anterior: resultado.categoria_anterior
        }
      });
    } catch (error: any) {
      console.error('Error al cambiar categoría:', error);
      
      if (
        error.message === 'Trader no encontrado' ||
        error.message === 'El usuario no es un trader' ||
        error.message === 'El trader no tiene wallet asociado' ||
        error.message.includes('ya tiene la categoría')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al cambiar categoría',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/traders/{id}/deshabilitar:
 *   delete:
 *     summary: Deshabilitar un trader y liquidar sus posiciones
 *     description: Deshabilita un trader, liquida automáticamente todas sus posiciones y devuelve el dinero a su wallet (Solo ADMINISTRADORES)
 *     tags: [Admin - Gestión de Traders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trader
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               justificacion:
 *                 type: string
 *                 minLength: 10
 *                 example: Trader realizó operaciones fraudulentas y violó los términos de servicio
 *             required:
 *               - justificacion
 *     responses:
 *       200:
 *         description: Trader deshabilitado y posiciones liquidadas exitosamente
 *       400:
 *         description: Datos inválidos o trader ya está deshabilitado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Trader no encontrado
 */
router.delete(
  '/:id/deshabilitar',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(DisableTraderDto),
  async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const dto: DisableTraderDto = req.body;
      
      // Obtener información del admin desde el JWT
      const adminId = req.user.id_user;
      const adminAlias = req.user.alias;
      const adminRole = req.user.role.role_name;

      const resultado = await service.disableTrader(id, dto, adminId, adminAlias, adminRole);

      res.json({
        success: true,
        message: resultado.mensaje,
        data: {
          posiciones_liquidadas: resultado.posiciones_liquidadas,
          monto_liquidado: resultado.monto_liquidado
        }
      });
    } catch (error: any) {
      console.error('Error al deshabilitar trader:', error);
      
      if (
        error.message === 'Trader no encontrado' ||
        error.message === 'El usuario no es un trader' ||
        error.message === 'El trader ya está deshabilitado'
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al deshabilitar trader',
        error: error.message
      });
    }
  }
);

export default router;
