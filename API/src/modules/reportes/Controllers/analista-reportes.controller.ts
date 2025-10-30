import { Request, Response, Router } from 'express';
import { AnalistaReportesService } from '../Services/analista-reportes.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { FilterTransaccionesDTO, ValidadorFechas } from '../DTOs/analista.dto';

/**
 * Controlador de Reportes de Analista
 * Solo accesible por usuarios con rol ANALISTA
 * 
 * Endpoints (READ-ONLY):
 * - GET /api/analista/reportes/empresa/:nombre/transacciones - Historial por empresa
 * - GET /api/analista/reportes/usuario/:alias/transacciones - Historial por usuario
 * - GET /api/analista/reportes/tesoreria/inventario - Inventario de Tesorería
 * - GET /api/analista/reportes/empresa/:nombre/tenedores - Mayor tenedor
 * - GET /api/analista/reportes/mercado/distribucion - Distribución de acciones
 */
export class AnalistaReportesController {
  public router: Router;
  private analistaService: AnalistaReportesService;

  constructor() {
    this.router = Router();
    this.analistaService = new AnalistaReportesService();
    this.initializeRoutes();
  }

  /**
   * Configurar rutas del controlador
   * Todas las rutas requieren autenticación JWT y rol de ANALISTA
   */
  private initializeRoutes() {
    /**
     * @swagger
     * /api/analista/reportes/empresa/{nombre}/transacciones:
     *   get:
     *     summary: Obtener historial de transacciones por empresa
     *     description: |
     *       **Solo analistas**
     *       
     *       Retorna todas las operaciones de compra/venta de una empresa específica.
     *       Incluye resumen estadístico y permite filtrado por fechas y tipo de operación.
     *     tags:
     *       - Reportes Analista
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: nombre
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre completo de la empresa
     *         example: "Apple Inc."
     *       - in: query
     *         name: fecha_inicio
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio del rango (YYYY-MM-DD)
     *       - in: query
     *         name: fecha_fin
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin del rango (YYYY-MM-DD)
     *       - in: query
     *         name: tipo_accion
     *         schema:
     *           type: string
     *           enum: [COMPRA, VENTA, LIQUIDAR_TODO]
     *         description: Filtrar por tipo de operación
     *     responses:
     *       200:
     *         description: Historial obtenido exitosamente
     *       400:
     *         description: Parámetros inválidos
     *       401:
     *         description: No autenticado
     *       403:
     *         description: No tienes permisos de analista
     *       404:
     *         description: Empresa no encontrada
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/empresa/:nombre/transacciones',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['ANALISTA']),
      this.getTransaccionesPorEmpresa.bind(this)
    );

    /**
     * @swagger
     * /api/analista/reportes/usuario/{alias}/transacciones:
     *   get:
     *     summary: Obtener historial de transacciones por usuario (trader)
     *     description: |
     *       **Solo analistas**
     *       
     *       Retorna todas las operaciones de un trader específico.
     *       Incluye resumen por empresa y estadísticas de ganancias/pérdidas.
     *     tags:
     *       - Reportes Analista
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: alias
     *         required: true
     *         schema:
     *           type: string
     *         description: Alias del usuario trader
     *       - in: query
     *         name: fecha_inicio
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio del rango (YYYY-MM-DD)
     *       - in: query
     *         name: fecha_fin
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin del rango (YYYY-MM-DD)
     *       - in: query
     *         name: tipo_accion
     *         schema:
     *           type: string
     *           enum: [COMPRA, VENTA, LIQUIDAR_TODO]
     *         description: Filtrar por tipo de operación
     *     responses:
     *       200:
     *         description: Historial obtenido exitosamente
     *       400:
     *         description: Parámetros inválidos o usuario no es trader
     *       404:
     *         description: Usuario no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/usuario/:alias/transacciones',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['ANALISTA']),
      this.getTransaccionesPorAlias.bind(this)
    );

    /**
     * @swagger
     * /api/analista/reportes/tesoreria/inventario:
     *   get:
     *     summary: Obtener inventario de Tesorería (acciones disponibles por empresa)
     *     description: |
     *       **Solo analistas**
     *       
     *       Retorna todas las empresas con sus acciones disponibles (no vendidas).
     *       Muestra el valor total del inventario de Tesorería por empresa.
     *     tags:
     *       - Reportes Analista
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id_mercado
     *         schema:
     *           type: integer
     *         description: Filtrar por mercado específico (opcional)
     *     responses:
     *       200:
     *         description: Inventario obtenido exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/tesoreria/inventario',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['ANALISTA']),
      this.getInventarioTesoreria.bind(this)
    );

    /**
     * @swagger
     * /api/analista/reportes/empresa/{nombre}/tenedores:
     *   get:
     *     summary: Obtener ranking de tenedores (holders) de una empresa
     *     description: |
     *       **Solo analistas**
     *       
     *       Retorna el ranking de holders de una empresa específica,
     *       incluyendo traders y la Tesorería (administración).
     *       Muestra cantidad de acciones y porcentaje del total.
     *     tags:
     *       - Reportes Analista
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: nombre
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre completo de la empresa
     *         example: "Apple Inc."
     *     responses:
     *       200:
     *         description: Ranking obtenido exitosamente
     *       404:
     *         description: Empresa no encontrada
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/empresa/:nombre/tenedores',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['ANALISTA']),
      this.getMayorTenedorPorEmpresa.bind(this)
    );

    /**
     * @swagger
     * /api/analista/reportes/mercado/distribucion:
     *   get:
     *     summary: Obtener distribución de acciones en el mercado
     *     description: |
     *       **Solo analistas**
     *       
     *       Retorna el % de acciones en manos de traders vs. Tesorería.
     *       Puede agruparse por empresa individual o por mercado completo.
     *     tags:
     *       - Reportes Analista
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: id_mercado
     *         schema:
     *           type: integer
     *         description: Filtrar por mercado específico (null = todos)
     *       - in: query
     *         name: nivel
     *         required: true
     *         schema:
     *           type: string
     *           enum: [empresa, mercado]
     *           default: empresa
     *         description: Nivel de agrupación (empresa = detalle, mercado = resumen)
     *     responses:
     *       200:
     *         description: Distribución obtenida exitosamente
     *       400:
     *         description: Parámetros inválidos
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/mercado/distribucion',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['ANALISTA']),
      this.getDistribucionMercado.bind(this)
    );

    /**
     * @swagger
     * /api/analista/reportes/empresa/{nombre}/historial-precios:
     *   get:
     *     summary: Obtener historial de precios de una empresa (gráfico Precio vs Tiempo)
     *     description: |
     *       **Solo analistas**
     *       
     *       Retorna el historial de cambios de precio de una empresa.
     *       Útil para graficar Precio vs. Tiempo (línea simple).
     *     tags:
     *       - Reportes Analista
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: nombre
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre completo de la empresa
     *         example: "Apple Inc."
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 50
     *         description: Número máximo de registros históricos
     *     responses:
     *       200:
     *         description: Historial obtenido exitosamente
     *       404:
     *         description: Empresa no encontrada
     *       500:
     *         description: Error interno del servidor
     */
    this.router.get(
      '/empresa/:nombre/historial-precios',
      JwtAuthGuard.middleware(),
      RolesGuard.hasRole(['ANALISTA']),
      this.getHistorialPrecios.bind(this)
    );
  }

  /**
   * GET /api/analista/reportes/empresa/:nombre/transacciones
   * Obtiene historial de transacciones de una empresa
   */
  private async getTransaccionesPorEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const nombre_empresa = decodeURIComponent(req.params.nombre);
      
      // Construir filtros desde query params
      const filtros: FilterTransaccionesDTO = {
        fecha_inicio: req.query.fecha_inicio as string,
        fecha_fin: req.query.fecha_fin as string,
        tipo_accion: req.query.tipo_accion as any
      };

      // Validar fechas si se proporcionan
      if (filtros.fecha_inicio && !ValidadorFechas.esFechaValida(filtros.fecha_inicio)) {
        res.status(400).json({
          success: false,
          message: 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'
        });
        return;
      }

      if (filtros.fecha_fin && !ValidadorFechas.esFechaValida(filtros.fecha_fin)) {
        res.status(400).json({
          success: false,
          message: 'Formato de fecha_fin inválido. Use YYYY-MM-DD'
        });
        return;
      }

      if (filtros.fecha_inicio && filtros.fecha_fin && 
          !ValidadorFechas.rangoValido(filtros.fecha_inicio, filtros.fecha_fin)) {
        res.status(400).json({
          success: false,
          message: 'La fecha_inicio debe ser menor o igual a fecha_fin'
        });
        return;
      }

      const resultado = await this.analistaService.getTransaccionesPorEmpresa(nombre_empresa, filtros);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener transacciones por empresa:', error);
      
      if (error.message.includes('no encontrada') || error.message.includes('deshabilitada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al generar historial de empresa',
        error: error.message
      });
    }
  }

  /**
   * GET /api/analista/reportes/usuario/:alias/transacciones
   * Obtiene historial de transacciones de un usuario (trader)
   */
  private async getTransaccionesPorAlias(req: Request, res: Response): Promise<void> {
    try {
      const alias = req.params.alias;
      
      const filtros: FilterTransaccionesDTO = {
        fecha_inicio: req.query.fecha_inicio as string,
        fecha_fin: req.query.fecha_fin as string,
        tipo_accion: req.query.tipo_accion as any
      };

      // Validar fechas
      if (filtros.fecha_inicio && !ValidadorFechas.esFechaValida(filtros.fecha_inicio)) {
        res.status(400).json({
          success: false,
          message: 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'
        });
        return;
      }

      if (filtros.fecha_fin && !ValidadorFechas.esFechaValida(filtros.fecha_fin)) {
        res.status(400).json({
          success: false,
          message: 'Formato de fecha_fin inválido. Use YYYY-MM-DD'
        });
        return;
      }

      const resultado = await this.analistaService.getTransaccionesPorAlias(alias, filtros);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener transacciones por alias:', error);
      
      if (error.message.includes('no encontrado') || error.message.includes('no es un trader')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al generar historial de usuario',
        error: error.message
      });
    }
  }

  /**
   * GET /api/analista/reportes/tesoreria/inventario
   * Obtiene inventario de Tesorería (acciones disponibles)
   */
  private async getInventarioTesoreria(req: Request, res: Response): Promise<void> {
    try {
      const id_mercado = req.query.id_mercado ? parseInt(req.query.id_mercado as string) : undefined;

      const resultado = await this.analistaService.getInventarioTesoreria(id_mercado);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener inventario de Tesorería:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error al generar inventario',
        error: error.message
      });
    }
  }

  /**
   * GET /api/analista/reportes/empresa/:nombre/tenedores
   * Obtiene ranking de tenedores de una empresa
   */
  private async getMayorTenedorPorEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const nombre_empresa = decodeURIComponent(req.params.nombre);

      const resultado = await this.analistaService.getMayorTenedorPorEmpresa(nombre_empresa);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener tenedores:', error);
      
      if (error.message.includes('no existe') || error.message.includes('deshabilitada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al consultar tenedores',
        error: error.message
      });
    }
  }

  /**
   * GET /api/analista/reportes/mercado/distribucion
   * Obtiene distribución de acciones en el mercado
   */
  private async getDistribucionMercado(req: Request, res: Response): Promise<void> {
    try {
      const id_mercado = req.query.id_mercado ? parseInt(req.query.id_mercado as string) : undefined;
      const nivel = (req.query.nivel as 'empresa' | 'mercado') || 'empresa';

      // Validar nivel
      if (!['empresa', 'mercado'].includes(nivel)) {
        res.status(400).json({
          success: false,
          message: 'El parámetro "nivel" debe ser "empresa" o "mercado"'
        });
        return;
      }

      const resultado = await this.analistaService.getDistribucionAccionesMercado(id_mercado, nivel);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener distribución:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error al consultar distribución',
        error: error.message
      });
    }
  }

  /**
   * GET /api/analista/reportes/empresa/:nombre/historial-precios
   * Obtiene historial de precios de una empresa (para gráfico)
   */
  private async getHistorialPrecios(req: Request, res: Response): Promise<void> {
    try {
      const nombre_empresa = decodeURIComponent(req.params.nombre);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const resultado = await this.analistaService.getHistorialPrecios(nombre_empresa, limit);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Error al obtener historial de precios:', error);
      
      if (error.message.includes('no encontrada') || error.message.includes('deshabilitada')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al consultar historial de precios',
        error: error.message
      });
    }
  }
}
