import { Request, Response, Router } from 'express';
import { TradingService } from '../Services/trading.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';

/**
 * Controlador para consultas de trading de traders
 * Solo accesible por usuarios con rol TRADER
 * 
 * Endpoints:
 * - GET /api/trader/portada - Portada con top empresas por mercado
 * - GET /api/trader/empresas/:id - Detalle completo de una empresa
 */
export class TradingController {
  public router: Router;
  private tradingService: TradingService;

  constructor() {
    this.router = Router();
    this.tradingService = new TradingService();
    this.initializeRoutes();
  }

  /**
   * Configurar rutas del controlador
   * Todas las rutas requieren autenticación JWT y rol de TRADER
   */
  private initializeRoutes() {
    /**
     * @swagger
     * /api/trader/portada:
     *   get:
     *     summary: Obtener portada con top empresas por mercado
     *     description: |
     *       **Solo traders autenticados**
     *       
     *       Retorna una lista de mercados habilitados, cada uno con sus top empresas ordenadas por capitalización.
     *       Solo se muestran mercados y empresas que estén habilitados.
     *       
     *       Útil para mostrar al trader un overview del mercado antes de operar.
     *     tags:
     *       - Trading Trader
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Portada obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id_mercado:
     *                         type: integer
     *                       nombre_mercado:
     *                         type: string
     *                         example: "NASDAQ"
     *                       cantidad_empresas:
     *                         type: integer
     *                         description: Cantidad de empresas habilitadas en este mercado
     *                       top_empresas:
     *                         type: array
     *                         description: Top 10 empresas del mercado por capitalización
     *                         items:
     *                           type: object
     *                           properties:
     *                             id_empresa:
     *                               type: integer
     *                             nombre:
     *                               type: string
     *                               example: "Apple Inc."
     *                             precio_actual:
     *                               type: number
     *                               example: 175.50
     *                             cantidad_acciones:
     *                               type: integer
     *                               example: 1000000
     *                             capitalizacion:
     *                               type: number
     *                               description: Valor total de la empresa (precio × cantidad)
     *                               example: 175500000
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes rol de TRADER
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/portada',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      this.getPortada.bind(this)
    );

    /**
     * @swagger
     * /api/trader/empresas/{id}:
     *   get:
     *     summary: Obtener detalle completo de una empresa
     *     description: |
     *       **Solo traders autenticados**
     *       
     *       Retorna información completa de una empresa específica:
     *       - Datos generales (nombre, precio actual, capitalización)
     *       - Información del mercado al que pertenece
     *       - Histórico de precios (últimos 30 días por defecto)
     *       
     *       Solo se puede consultar empresas habilitadas.
     *     tags:
     *       - Trading Trader
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID de la empresa a consultar
     *       - in: query
     *         name: dias
     *         schema:
     *           type: integer
     *           default: 30
     *           minimum: 1
     *           maximum: 365
     *         description: Número de días de histórico de precios a retornar
     *     responses:
     *       200:
     *         description: Detalle de empresa obtenido exitosamente
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
     *                     id_empresa:
     *                       type: integer
     *                     nombre:
     *                       type: string
     *                       example: "Apple Inc."
     *                     precio_actual:
     *                       type: number
     *                       example: 175.50
     *                     cantidad_acciones:
     *                       type: integer
     *                       example: 1000000
     *                     capitalizacion:
     *                       type: number
     *                       example: 175500000
     *                     habilitado:
     *                       type: boolean
     *                     fecha_creacion:
     *                       type: string
     *                       format: date-time
     *                     mercado:
     *                       type: object
     *                       properties:
     *                         id_mercado:
     *                           type: integer
     *                         nombre:
     *                           type: string
     *                           example: "NASDAQ"
     *                         habilitado:
     *                           type: boolean
     *                     historico_precios:
     *                       type: array
     *                       description: Últimos N días de precios
     *                       items:
     *                         type: object
     *                         properties:
     *                           precio:
     *                             type: number
     *                           fecha_hora:
     *                             type: string
     *                             format: date-time
     *       400:
     *         description: ID de empresa inválido
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes rol de TRADER
     *       404:
     *         description: Empresa no encontrada o está deshabilitada
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/empresas/:id',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      this.getDetalleEmpresa.bind(this)
    );
  }

  /**
   * GET /api/trader/portada
   * Obtiene la portada con top empresas agrupadas por mercado
   */
  private async getPortada(req: Request, res: Response): Promise<void> {
    try {
      const portada = await this.tradingService.getPortada();

      res.status(200).json({
        success: true,
        data: portada
      });

    } catch (error: any) {
      console.error('Error al obtener portada:', error);

      res.status(500).json({
        success: false,
        message: 'Error al cargar la portada',
        error: error.message
      });
    }
  }

  /**
   * GET /api/trader/empresas/:id
   * Obtiene el detalle completo de una empresa específica
   */
  private async getDetalleEmpresa(req: Request, res: Response): Promise<void> {
    try {
      // Validar ID de empresa
      const id_empresa = parseInt(req.params.id);
      if (isNaN(id_empresa) || id_empresa <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de empresa inválido'
        });
        return;
      }

      // Obtener parámetro opcional de días de histórico
      const dias = parseInt(req.query.dias as string) || 30;
      if (dias < 1 || dias > 365) {
        res.status(400).json({
          success: false,
          message: 'El parámetro "dias" debe estar entre 1 y 365'
        });
        return;
      }

      // Obtener detalle de la empresa
      const detalle = await this.tradingService.getDetalleEmpresa(id_empresa, dias);

      res.status(200).json({
        success: true,
        data: detalle
      });

    } catch (error: any) {
      console.error('Error al obtener detalle de empresa:', error);

      // Empresa no encontrada o deshabilitada
      if (error.message.includes('no encontrada') || error.message.includes('deshabilitada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle de empresa',
        error: error.message
      });
    }
  }
}
