import { Request, Response, Router } from 'express'
import { TradingService } from '../Services/trading.service'
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard'
import { RoleGuard } from '../../auth/Guards/role.guard'
import { validateDto } from '../../../common/validate-dto'
import { ComprarAccionesDto } from '../DTOs/comprar-acciones.dto'
import { VenderAccionesDto } from '../DTOs/vender-acciones.dto'
import { LiquidarTodoDto } from '../DTOs/liquidar-todo.dto'

/**
 * @swagger
 * tags:
 *   name: Trading
 *   description: Operaciones de compra/venta de acciones para traders
 */

/**
 * @swagger
 * /api/trader/portada:
 *   get:
 *     summary: Obtener portada del mercado
 *     description: Consulta información general de todas las empresas disponibles para trading
 *     tags: [Trading]
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
 *                     $ref: '#/components/schemas/EmpresaPortada'
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/trader/empresas/{id}:
 *   get:
 *     summary: Obtener detalle de una empresa
 *     description: Consulta información detallada de una empresa incluyendo histórico de precios
 *     tags: [Trading]
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
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de días de histórico de precios
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
 *                   $ref: '#/components/schemas/DetalleEmpresa'
 *       400:
 *         description: ID de empresa inválido
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/trader/posicion/{id_user}/{id_empresa}:
 *   get:
 *     summary: Obtener posición de un trader en una empresa
 *     description: Consulta la cantidad de acciones y costo promedio que tiene un trader en una empresa específica
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_user
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trader
 *       - in: path
 *         name: id_empresa
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Posición obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PosicionTrader'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/trader/trading/comprar:
 *   post:
 *     summary: Comprar acciones
 *     description: Realiza la compra de acciones de una empresa. Se valida saldo disponible y se actualiza el portafolio
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComprarAccionesDto'
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
 *                   example: "Compra exitosa de 10 acciones de Empresa XYZ"
 *       400:
 *         description: Datos inválidos o saldo insuficiente
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/trader/trading/vender:
 *   post:
 *     summary: Vender acciones
 *     description: Realiza la venta de acciones de una empresa. Se valida que el trader tenga acciones suficientes
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VenderAccionesDto'
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
 *                   example: "Venta exitosa de 5 acciones de Empresa XYZ"
 *       400:
 *         description: Datos inválidos o acciones insuficientes
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/trader/portafolio:
 *   get:
 *     summary: Obtener portafolio completo
 *     description: Consulta todas las posiciones abiertas del trader con ganancias/pérdidas actuales
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portafolio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Portafolio'
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/trader/portafolio/liquidar-todo:
 *   post:
 *     summary: Liquidar todas las posiciones
 *     description: Vende todas las acciones del portafolio. Requiere confirmación con contraseña
 *     tags: [Trading]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LiquidarTodoDto'
 *     responses:
 *       200:
 *         description: Liquidación exitosa
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
 *                   example: "Portafolio liquidado exitosamente"
 *       400:
 *         description: Datos inválidos o contraseña incorrecta
 *       401:
 *         description: Token de autenticación inválido o faltante
 *       403:
 *         description: Usuario sin permisos de TRADER
 *       500:
 *         description: Error interno del servidor
 */
export class TradingController {
  public router: Router
  private tradingService: TradingService

  constructor() {
    this.router = Router()
    this.tradingService = new TradingService()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    //  Portada general
    this.router.get(
      '/portada',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getPortada.bind(this)
    )

    //  Detalle de empresa
    this.router.get(
      '/empresas/:id',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getDetalleEmpresa.bind(this)
    )

    //  Obtener posición de un trader en una empresa
    this.router.get(
      '/posicion/:id_user/:id_empresa',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getPosicionTrader.bind(this)
    )

    //  Comprar acciones
    this.router.post(
      '/trading/comprar',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      validateDto(ComprarAccionesDto),
      this.comprarAcciones.bind(this)
    )

    //  Vender acciones
    this.router.post(
      '/trading/vender',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      validateDto(VenderAccionesDto),
      this.venderAcciones.bind(this)
    )

    //  Portafolio completo
    this.router.get(
      '/portafolio',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getPortafolio.bind(this)
    )

    //  Liquidar todo
    this.router.post(
      '/portafolio/liquidar-todo',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      validateDto(LiquidarTodoDto),
      this.liquidarTodo.bind(this)
    )
  }

  // -----------------------------------------------------
  // MÉTODOS
  // -----------------------------------------------------

  private async getPortada(req: Request, res: Response): Promise<void> {
    try {
      const portada = await this.tradingService.getPortada()
      res.status(200).json({ success: true, data: portada })
    } catch (error: any) {
      console.error('Error al obtener portada:', error)
      res.status(500).json({
        success: false,
        message: 'Error al cargar la portada',
        error: error.message
      })
    }
  }

  private async getDetalleEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const id_empresa = parseInt(req.params.id)
      if (isNaN(id_empresa) || id_empresa <= 0) {
        res.status(400).json({ success: false, message: 'ID de empresa inválido' })
        return
      }

      const dias = parseInt(req.query.dias as string) || 30
      const detalle = await this.tradingService.getDetalleEmpresa(id_empresa, dias)
      res.status(200).json({ success: true, data: detalle })
    } catch (error: any) {
      console.error('Error al obtener detalle de empresa:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle de empresa',
        error: error.message
      })
    }
  }

  private async getPosicionTrader(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(req.params.id_user)
      const id_empresa = parseInt(req.params.id_empresa)

      if (isNaN(id_user) || isNaN(id_empresa)) {
        res.status(400).json({ success: false, message: 'Parámetros inválidos.' })
        return
      }

      const posicion = await this.tradingService.getPosicionTrader(id_user, id_empresa)
      if (!posicion) {
        res.status(200).json({ success: true, data: { cantidad: 0, costo_promedio: 0 } })
        return
      }

      res.status(200).json({ success: true, data: posicion })
    } catch (error: any) {
      console.error('Error al obtener posición del trader:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener posición del trader',
        error: error.message
      })
    }
  }

  private async comprarAcciones(req: Request, res: Response): Promise<void> {
    try {
      const { id_user, alias } = (req as any).user
      const { id_empresa, cantidad } = req.body
      const resultado = await this.tradingService.comprarAcciones(id_user, alias, id_empresa, cantidad)
      res.status(200).json({ success: true, message: resultado.mensaje })
    } catch (error: any) {
      console.error('Error al comprar acciones:', error)
      res.status(500).json({
        success: false,
        message: 'Error al realizar la compra',
        error: error.message
      })
    }
  }

  private async venderAcciones(req: Request, res: Response): Promise<void> {
    try {
      const { id_user, alias } = (req as any).user
      const { id_empresa, cantidad } = req.body
      const resultado = await this.tradingService.venderAcciones(id_user, alias, id_empresa, cantidad)
      res.status(200).json({ success: true, message: resultado.mensaje })
    } catch (error: any) {
      console.error('Error al vender acciones:', error)
      res.status(500).json({
        success: false,
        message: 'Error al realizar la venta',
        error: error.message
      })
    }
  }

  private async getPortafolio(req: Request, res: Response): Promise<void> {
    try {
      const { id_user } = (req as any).user
      const portafolio = await this.tradingService.getPortafolio(id_user)
      res.status(200).json({ success: true, data: portafolio })
    } catch (error: any) {
      console.error('Error al obtener portafolio:', error)
      res.status(500).json({
        success: false,
        message: 'Error al cargar el portafolio',
        error: error.message
      })
    }
  }

  private async liquidarTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id_user, alias } = (req as any).user
      const { password } = req.body
      const resultado = await this.tradingService.liquidarTodo(id_user, alias, password)
      res.status(200).json({ success: true, message: resultado.mensaje })
    } catch (error: any) {
      console.error('Error al liquidar portafolio:', error)
      res.status(500).json({
        success: false,
        message: 'Error al liquidar el portafolio',
        error: error.message
      })
    }
  }
}
