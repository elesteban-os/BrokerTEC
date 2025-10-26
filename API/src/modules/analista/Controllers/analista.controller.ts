import { Router, Request, Response, NextFunction } from 'express';
import { AnalistaService } from '../Services/analista.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';

/**
 * @swagger
 * tags:
 * name: Analista - Reportes
 * description: Endpoints de solo lectura para el rol Analista
 */
export class AnalistaController {
    public router: Router;
    private analistaService: AnalistaService;

    constructor() {
        this.router = Router();
        this.analistaService = new AnalistaService();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Proteger todas las rutas de este controlador con JWT y Rol Analista (o Admin)
        this.router.use(JwtAuthGuard.middleware(), RolesGuard.adminOrAnalyst());

        this.router.get('/reportes/empresa/:id_empresa/historial', this.getHistorialPorEmpresa.bind(this));

        this.router.get('/reportes/usuario/:alias/historial', this.getHistorialPorAlias.bind(this));

        this.router.get('/reportes/estadisticas/distribucion-acciones', this.getDistribucionAcciones.bind(this));

        this.router.get('/reportes/top-empresas', this.getTopEmpresas.bind(this));
    }

    // Método del controlador para historial por empresa
    private async getHistorialPorEmpresa(req: Request, res: Response, next: NextFunction) {
        try {
        const id_empresa = parseInt(req.params.id_empresa);
        if (isNaN(id_empresa)) {
            return res.status(400).json({ success: false, message: 'ID de empresa inválido' });
        }

        // Validar y parsear fechas opcionales
        const fecha_desde = req.query.desde ? new Date(req.query.desde as string) : undefined;
        const fecha_hasta = req.query.hasta ? new Date(req.query.hasta as string) : undefined;

        if (fecha_desde && isNaN(fecha_desde.getTime())) {
            return res.status(400).json({ success: false, message: 'Formato de fecha "desde" inválido' });
        }
        if (fecha_hasta && isNaN(fecha_hasta.getTime())) {
            return res.status(400).json({ success: false, message: 'Formato de fecha "hasta" inválido' });
        }

        // Llama al servicio
        const historial = await this.analistaService.getHistorialTransaccionesPorEmpresa(id_empresa, fecha_desde, fecha_hasta);
        res.status(200).json({ success: true, data: historial });
        } catch (error) {
        next(error); // Pasa el error al manejador central
        }
    }

    // Método del controlador para historial por alias
        private async getHistorialPorAlias(req: Request, res: Response, next: NextFunction) {
        try {
            const alias = req.params.alias;
            if (!alias) {
                return res.status(400).json({ success: false, message: 'Alias requerido' });
            }

            // Extraer y validar filtros opcionales
            const fecha_desde = req.query.desde ? new Date(req.query.desde as string) : undefined;
            const fecha_hasta = req.query.hasta ? new Date(req.query.hasta as string) : undefined;
            const id_empresa = req.query.id_empresa ? parseInt(req.query.id_empresa as string) : undefined;
            const tipo = req.query.tipo as 'Buy' | 'Sell' | undefined;

            // Validar fechas
            if (fecha_desde && isNaN(fecha_desde.getTime())) {
                return res.status(400).json({ success: false, message: 'Formato de fecha "desde" inválido' });
            }
            if (fecha_hasta && isNaN(fecha_hasta.getTime())) {
                return res.status(400).json({ success: false, message: 'Formato de fecha "hasta" inválido' });
            }
            if (id_empresa && isNaN(id_empresa)) {
                return res.status(400).json({ success: false, message: 'ID de empresa inválido' });
            }
            if (tipo && !['Buy', 'Sell'].includes(tipo)) {
                return res.status(400).json({ success: false, message: 'Tipo inválido, debe ser "Buy" o "Sell"' });
            }

            const historial = await this.analistaService.getHistorialTransaccionesPorAlias(alias, {
                fecha_desde,
                fecha_hasta,
                id_empresa,
                tipo,
            });

            res.status(200).json({ success: true, data: historial });
        } catch (error: any) {
            if (error.message === 'ALIAS_NOT_FOUND') {
                return res.status(404).json({ success: false, message: 'Alias no encontrado' });
            }
            next(error);
        }
    }

    // Método del controlador para estadísticas de distribución
    private async getDistribucionAcciones(req: Request, res: Response, next: NextFunction) {
        try {
            const id_mercado = req.query.id_mercado ? parseInt(req.query.id_mercado as string) : undefined;
            const id_empresa = req.query.id_empresa ? parseInt(req.query.id_empresa as string) : undefined;

            if (id_mercado && isNaN(id_mercado)) {
                return res.status(400).json({ success: false, message: 'ID de mercado inválido' });
            }
            if (id_empresa && isNaN(id_empresa)) {
                return res.status(400).json({ success: false, message: 'ID de empresa inválido' });
            }

            const distribucion = await this.analistaService.getDistribucionAcciones(id_mercado, id_empresa);
            res.status(200).json({ success: true, data: distribucion });
        } catch (error) {
            next(error);
        }
    }

    // Método del controlador para Top Empresas
    private async getTopEmpresas(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            const id_mercado = req.query.id_mercado ? parseInt(req.query.id_mercado as string) : undefined;

            // Validar límite
            if (isNaN(limit) || limit < 1 || limit > 50) { // Limitar a un máximo razonable
                return res.status(400).json({ success: false, message: 'El límite debe ser un número entre 1 y 50' });
            }
            if (id_mercado && isNaN(id_mercado)) {
                return res.status(400).json({ success: false, message: 'ID de mercado inválido' });
            }

            const topEmpresas = await this.analistaService.getTopEmpresasPorCapitalizacion(limit, id_mercado);
            res.status(200).json({ success: true, data: topEmpresas });
        } catch (error) {
            next(error);
        }
    }
}
