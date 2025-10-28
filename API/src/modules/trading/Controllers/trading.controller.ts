import { Request, Response, Router } from 'express'
import { TradingService } from '../Services/trading.service'
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard'
import { RoleGuard } from '../../auth/Guards/role.guard'
import { validateDto } from '../../../common/validate-dto'
import { ComprarAccionesDto } from '../DTOs/comprar-acciones.dto'
import { VenderAccionesDto } from '../DTOs/vender-acciones.dto'
import { LiquidarTodoDto } from '../DTOs/liquidar-todo.dto'

/**
 * Controlador para trading de traders
 * Solo accesible por usuarios con rol TRADER
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
    // 🔹 Portada general
    this.router.get(
      '/portada',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getPortada.bind(this)
    )

    // 🔹 Detalle de empresa
    this.router.get(
      '/empresas/:id',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getDetalleEmpresa.bind(this)
    )

    // 🔹 Obtener posición de un trader en una empresa
    this.router.get(
      '/posicion/:id_user/:id_empresa',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getPosicionTrader.bind(this)
    )

    // 🔹 Comprar acciones
    this.router.post(
      '/trading/comprar',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      validateDto(ComprarAccionesDto),
      this.comprarAcciones.bind(this)
    )

    // 🔹 Vender acciones
    this.router.post(
      '/trading/vender',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      validateDto(VenderAccionesDto),
      this.venderAcciones.bind(this)
    )

    // 🔹 Portafolio completo
    this.router.get(
      '/portafolio',
      JwtAuthGuard.middleware(),
      RoleGuard.traderOnly,
      this.getPortafolio.bind(this)
    )

    // 🔹 Liquidar todo
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
