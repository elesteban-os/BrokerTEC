import 'reflect-metadata'; // siempre primero para decorators
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/data-source';
import { ENV } from './config/env';
import { swaggerSpec, swaggerUiOptions } from './config/swagger';
import publicRegisterController from './modules/auth/Controllers/public-register.controller';
import adminRegisterController from './modules/auth/Controllers/admin-register.controller';
import loginController from './modules/auth/Controllers/login.controller';
import getUserController from './modules/gestion_usuarios/Controllers/get_user.controller';
import editUserController from './modules/gestion_usuarios/Controllers/edit_user.controller';
import userUpdatePasswordController from './modules/gestion_usuarios/Controllers/user_update_password.controller';
import deleteUserController from './modules/gestion_usuarios/Controllers/delete_user.controller';
import mercadosController from './modules/gestion_mercados/Controllers/mercados.controller';
import empresasController from './modules/gestion_empresas/Controllers/empresas.controller';
import preciosController from './modules/gestion_empresas/Controllers/precios.controller';
import traderManagementController from './modules/gestion_usuarios/Controllers/trader-management.controller';
import { ReportesController } from './modules/reportes/Controllers/reportes.controller';
import { WalletController } from './modules/wallet/Controllers/wallet.controller';
import { TradingController } from './modules/trading/Controllers/trading.controller';

const reportesController = new ReportesController();
const walletController = new WalletController();
const tradingController = new TradingController();

async function bootstrap() {
  await AppDataSource.initialize();        // conecta TypeORM

  const app = express();
  app.use(express.json());

  // Configuración de Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Endpoint para obtener la especificación OpenAPI en formato JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Verificar estado de salud del servicio
   *     description: Endpoint para verificar que el servicio está funcionando correctamente
   *     tags:
   *       - Health Check
   *     responses:
   *       200:
   *         description: Servicio funcionando correctamente
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/HealthCheck'
   *             example:
   *               ok: true
   */
  // healthcheck
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // rutas del módulo auth - registro público
  app.use('/api/auth', publicRegisterController);
  
  // rutas del módulo auth - registro administrativo
  app.use('/api/auth', adminRegisterController);
  
  // rutas del módulo auth - login/logout/refresh
  app.use('/api/auth', loginController);

  // rutas del módulo de gestión de usuarios
  app.use('/api/users', userUpdatePasswordController);
  app.use('/api/users', deleteUserController);
  app.use('/api/users', getUserController);
  app.use('/api/users', editUserController);

  // rutas del módulo de gestión de mercados (Admin)
  app.use('/api/admin/mercados', mercadosController);

  // rutas del módulo de gestión de empresas (Admin)
  app.use('/api/admin/empresas', empresasController);
  app.use('/api/admin/empresas', preciosController);

  // rutas del módulo de gestión de traders (Admin)
  app.use('/api/admin/traders', traderManagementController);

  // rutas del módulo de reportes (Admin)
  app.use('/api/admin/reportes', reportesController.router);

  // rutas del módulo de wallet (Trader)
  app.use('/api/trader/wallet', walletController.router);

  // rutas del módulo de trading (Trader)
  app.use('/api/trader', tradingController.router);

  // error handler centralizado (no repitas try/catch en cada ruta)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  app.listen(ENV.PORT, () => {
    console.log(`API running on http://localhost:${ENV.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});