import { Router, Request, Response, NextFunction } from 'express';
import { PreciosService } from '../Services/precios.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { validateDto } from '../../../common/validate-dto';
import { UpdatePrecioDto } from '../DTOs/update-precio.dto';
import { BulkUpdatePreciosDto } from '../DTOs/bulk-update-precios.dto';

const router = Router();
const preciosService = new PreciosService();

/**
 * @swagger
 * /api/admin/empresas/{id}/precio:
 *   put:
 *     summary: Actualizar precio de una empresa (manual)
 *     tags: [Admin - Precios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precio_actual:
 *                 type: number
 *                 example: 150.75
 *     responses:
 *       200:
 *         description: Precio actualizado exitosamente
 *       400:
 *         description: Precio inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 *       404:
 *         description: Empresa no encontrada
 */
router.put(
  '/:id/precio',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(UpdatePrecioDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdatePrecioDto = req.body;
      const user = (req as any).user;

      const resultado = await preciosService.updatePrecio(id, dto, user, false);

      res.json({
        success: true,
        message: 'Precio actualizado exitosamente',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/empresas/precios/bulk:
 *   post:
 *     summary: Actualizar precios de múltiples empresas (API)
 *     tags: [Admin - Precios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_empresa:
 *                       type: integer
 *                       example: 1
 *                     precio_actual:
 *                       type: number
 *                       example: 150.75
 *     responses:
 *       200:
 *         description: Precios actualizados exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 */
router.post(
  '/precios/bulk',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(BulkUpdatePreciosDto),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: BulkUpdatePreciosDto = req.body;
      const user = (req as any).user;

      const resultado = await preciosService.bulkUpdatePrecios(dto, user);

      res.json({
        success: true,
        message: `${resultado.exitosos} precios actualizados exitosamente`,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/admin/empresas/{id}/historial-precios:
 *   get:
 *     summary: Obtener historial de precios de una empresa (gráfico precio vs. tiempo)
 *     tags: [Admin - Precios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número máximo de registros
 *     responses:
 *       200:
 *         description: Historial de precios obtenido exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos de administrador
 *       404:
 *         description: Empresa no encontrada
 */
router.get(
  '/:id/historial-precios',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const historial = await preciosService.getHistorialPrecios(id, limit);

      res.json({
        success: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
