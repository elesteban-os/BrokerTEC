import { Request, Response, Router } from 'express';
import { TradingService } from '../Services/trading.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { validateDto } from '../../../common/validate-dto';
import { ComprarAccionesDto } from '../DTOs/comprar-acciones.dto';
import { VenderAccionesDto } from '../DTOs/vender-acciones.dto';

/**
 * Controlador para trading de traders
 * Solo accesible por usuarios con rol TRADER
 * 
 * Endpoints:
 * - GET /api/trader/portada - Portada con top empresas por mercado
 * - GET /api/trader/empresas/:id - Detalle completo de una empresa
 * - POST /api/trader/trading/comprar - Comprar acciones
 * - POST /api/trader/trading/vender - Vender acciones
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

    /**
     * @swagger
     * /api/trader/trading/comprar:
     *   post:
     *     summary: Comprar acciones de una empresa
     *     description: |
     *       **Solo traders autenticados**
     *       
     *       Realiza una compra de acciones validando:
     *       - Mercado y empresa habilitados
     *       - Precio actual disponible
     *       - Acciones disponibles en Tesorería
     *       - Fondos suficientes en wallet del trader
     *       
     *       La operación es **atómica**: actualiza wallet, posición del trader, e inventario de Tesorería en una sola transacción.
     *       
     *       Si el trader ya posee acciones de esta empresa, se calcula el nuevo **costo promedio ponderado**.
     *       
     *       Si no hay fondos suficientes, se informa el **máximo comprable**.
     *     tags:
     *       - Trading Trader
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_empresa
     *               - cantidad
     *             properties:
     *               id_empresa:
     *                 type: integer
     *                 description: ID de la empresa a comprar
     *                 example: 5
     *               cantidad:
     *                 type: integer
     *                 minimum: 1
     *                 description: Cantidad de acciones a comprar
     *                 example: 10
     *     responses:
     *       200:
     *         description: Compra realizada exitosamente
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
     *                   example: "Compra exitosa: 10 acciones a $175.50 c/u. Total: $1755.00. Costo promedio: $175.50"
     *       400:
     *         description: Validación fallida (datos inválidos, saldo insuficiente, acciones no disponibles, etc.)
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes rol de TRADER
     *       500:
     *         description: Error interno del servidor
     */
    this.router.post(
      '/trading/comprar',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      validateDto(ComprarAccionesDto),
      this.comprarAcciones.bind(this)
    );

    /**
     * @swagger
     * /api/trader/trading/vender:
     *   post:
     *     summary: Vender acciones de una empresa
     *     description: |
     *       **Solo traders autenticados**
     *       
     *       Realiza una venta de acciones validando:
     *       - El trader posee suficientes acciones de esa empresa
     *       - Precio actual disponible
     *       
     *       La operación es **atómica**: actualiza wallet, posición del trader, e inventario de Tesorería en una sola transacción.
     *       
     *       El mensaje de respuesta incluye la **ganancia o pérdida** respecto al costo promedio de compra.
     *       
     *       Si se venden todas las acciones, la posición se elimina automáticamente.
     *     tags:
     *       - Trading Trader
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id_empresa
     *               - cantidad
     *             properties:
     *               id_empresa:
     *                 type: integer
     *                 description: ID de la empresa a vender
     *                 example: 5
     *               cantidad:
     *                 type: integer
     *                 minimum: 1
     *                 description: Cantidad de acciones a vender
     *                 example: 5
     *     responses:
     *       200:
     *         description: Venta realizada exitosamente
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
     *                   example: "Venta exitosa: 5 acciones a $180.00 c/u. Total recibido: $900.00. Ganancia: $22.50"
     *       400:
     *         description: Validación fallida (no posee acciones, cantidad insuficiente, etc.)
     *       401:
     *         description: No autenticado o token inválido
     *       403:
     *         description: No tienes rol de TRADER
     *       500:
     *         description: Error interno del servidor
     */
    this.router.post(
      '/trading/vender',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['TRADER']),
      validateDto(VenderAccionesDto),
      this.venderAcciones.bind(this)
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

  /**
   * POST /api/trader/trading/comprar
   * Compra acciones de una empresa
   * 
   * Valida fondos, disponibilidad de acciones, y realiza la operación atómica
   */
  private async comprarAcciones(req: Request, res: Response): Promise<void> {
    try {
      // Extraer datos del JWT (agregados por JwtAuthGuard)
      const { id_user, alias } = (req as any).user;

      // Extraer datos del body (validados por ComprarAccionesDto)
      const { id_empresa, cantidad } = req.body;

      // Ejecutar compra
      const resultado = await this.tradingService.comprarAcciones(
        id_user,
        alias,
        id_empresa,
        cantidad
      );

      res.status(200).json({
        success: true,
        message: resultado.mensaje
      });

    } catch (error: any) {
      console.error('Error al comprar acciones:', error);

      // Errores de validación de negocio (saldo insuficiente, empresa deshabilitada, etc.)
      if (
        error.message.includes('insuficiente') ||
        error.message.includes('deshabilitad') ||
        error.message.includes('no existe') ||
        error.message.includes('no disponible') ||
        error.message.includes('Máximo comprable')
      ) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Error al realizar la compra',
        error: error.message
      });
    }
  }

  /**
   * POST /api/trader/trading/vender
   * Vende acciones de una empresa
   * 
   * Valida posesión de acciones y realiza la operación atómica
   */
  private async venderAcciones(req: Request, res: Response): Promise<void> {
    try {
      // Extraer datos del JWT (agregados por JwtAuthGuard)
      const { id_user, alias } = (req as any).user;

      // Extraer datos del body (validados por VenderAccionesDto)
      const { id_empresa, cantidad } = req.body;

      // Ejecutar venta
      const resultado = await this.tradingService.venderAcciones(
        id_user,
        alias,
        id_empresa,
        cantidad
      );

      res.status(200).json({
        success: true,
        message: resultado.mensaje
      });

    } catch (error: any) {
      console.error('Error al vender acciones:', error);

      // Errores de validación de negocio (no posee acciones, cantidad insuficiente, etc.)
      if (
        error.message.includes('No posees') ||
        error.message.includes('insuficiente') ||
        error.message.includes('no existe') ||
        error.message.includes('no disponible')
      ) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Error al realizar la venta',
        error: error.message
      });
    }
  }
}
