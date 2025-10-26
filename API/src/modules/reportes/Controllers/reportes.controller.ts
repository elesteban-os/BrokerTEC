import { Request, Response, Router } from 'express';
import { ReportesService } from '../Services/reportes.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';

/**
 * Controlador de Reportes Administrativos
 * Solo accesible por usuarios con rol ADMINISTRADOR
 * 
 * Endpoints:
 * - GET /api/admin/reportes/top-traders - Top traders por ganancias
 * - GET /api/admin/reportes/estadisticas - Estadísticas generales del sistema
 */
export class ReportesController {
  public router: Router;
  private reportesService: ReportesService;

  constructor() {
    this.router = Router();
    this.reportesService = new ReportesService();
    this.initializeRoutes();
  }

  /**
   * Configurar rutas del controlador
   * Todas las rutas requieren autenticación JWT y rol de ADMINISTRADOR
   */
  private initializeRoutes() {
    /**
     * @swagger
     * /api/admin/reportes/top-traders:
     *   get:
     *     summary: Obtener top traders por ganancias/pérdidas
     *     description: |
     *       **Solo administradores**
     *       
     *       Retorna un ranking de traders ordenados por sus ganancias o pérdidas totales.
     *       Incluye información detallada de cada trader, sus posiciones y cálculos de rendimiento.
     *     tags:
     *       - Reportes Admin
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *           minimum: 1
     *           maximum: 100
     *         description: Número máximo de traders a retornar en el ranking
     *     responses:
     *       200:
     *         description: Top traders obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 total_traders:
     *                   type: integer
     *                   description: Total de traders activos en el sistema
     *                 top_traders:
     *                   type: array
     *                   description: Lista de traders ordenados por ganancias
     *                   items:
     *                     type: object
     *                     properties:
     *                       id_user:
     *                         type: integer
     *                       alias:
     *                         type: string
     *                       nombre:
     *                         type: string
     *                       apellido:
     *                         type: string
     *                       categoria:
     *                         type: string
     *                         enum: [JUNIOR, MID, SENIOR]
     *                       saldo_disponible:
     *                         type: number
     *                         description: Saldo en efectivo disponible
     *                       valor_posiciones:
     *                         type: number
     *                         description: Valor total de todas las posiciones al precio actual
     *                       ganancia_perdida_total:
     *                         type: number
     *                         description: Ganancia o pérdida total (puede ser negativa)
     *                       numero_posiciones:
     *                         type: integer
     *                         description: Cantidad de posiciones abiertas
     *                       posiciones:
     *                         type: array
     *                         description: Detalle de cada posición
     *                         items:
     *                           type: object
     *                           properties:
     *                             empresa:
     *                               type: string
     *                             cantidad:
     *                               type: integer
     *                             costo_promedio:
     *                               type: number
     *                             precio_actual:
     *                               type: number
     *                             ganancia_perdida:
     *                               type: number
     *                 fecha_consulta:
     *                   type: string
     *                   format: date-time
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes permisos de administrador
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/top-traders',
      JwtAuthGuard.middleware(),
      RolesGuard.adminOnly(),
      this.getTopTraders.bind(this)
    );

    /**
     * @swagger
     * /api/admin/reportes/estadisticas:
     *   get:
     *     summary: Obtener estadísticas generales del sistema
     *     description: |
     *       **Solo administradores**
     *       
     *       Retorna un resumen completo de las estadísticas del sistema de trading:
     *       - Total de traders (activos e inactivos)
     *       - Estadísticas del mercado (posiciones, valores, ganancias)
     *       - Información de wallets del sistema
     *     tags:
     *       - Reportes Admin
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Estadísticas obtenidas exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 traders:
     *                   type: object
     *                   properties:
     *                     activos:
     *                       type: integer
     *                       description: Número de traders activos
     *                     inactivos:
     *                       type: integer
     *                       description: Número de traders deshabilitados
     *                     total:
     *                       type: integer
     *                       description: Total de traders en el sistema
     *                 mercado:
     *                   type: object
     *                   properties:
     *                     posiciones_abiertas:
     *                       type: integer
     *                       description: Total de posiciones activas en el sistema
     *                     valor_invertido:
     *                       type: number
     *                       description: Suma total del valor invertido originalmente
     *                     valor_actual:
     *                       type: number
     *                       description: Valor actual de todas las posiciones al precio de mercado
     *                     ganancia_perdida_total:
     *                       type: number
     *                       description: Ganancia o pérdida total del sistema
     *                 wallets:
     *                   type: object
     *                   properties:
     *                     saldo_total_sistema:
     *                       type: number
     *                       description: Suma de todos los saldos en efectivo
     *                     numero_wallets:
     *                       type: integer
     *                       description: Cantidad total de wallets creadas
     *                 fecha_consulta:
     *                   type: string
     *                   format: date-time
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes permisos de administrador
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/estadisticas',
      JwtAuthGuard.middleware(),
      RolesGuard.adminOnly(),
      this.getEstadisticas.bind(this)
    );
  }

  /**
   * GET /api/admin/reportes/top-traders
   * Obtiene el ranking de traders por ganancias/pérdidas
   */
  private async getTopTraders(req: Request, res: Response): Promise<void> {
    try {
      // Obtener parámetro de límite (por defecto 10)
      const limit = parseInt(req.query.limit as string) || 10;

      // Validar que el límite sea un número positivo
      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'El límite debe ser un número entre 1 y 100'
        });
        return;
      }

      // Obtener el reporte de top traders
      const resultado = await this.reportesService.getTopTraders(limit);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener top traders:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de top traders',
        error: error.message
      });
    }
  }

  /**
   * GET /api/admin/reportes/estadisticas
   * Obtiene estadísticas generales del sistema
   */
  private async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      // Obtener estadísticas generales
      const estadisticas = await this.reportesService.getEstadisticasGenerales();

      res.status(200).json({
        success: true,
        data: estadisticas
      });

    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error al generar estadísticas del sistema',
        error: error.message
      });
    }
  }
}
