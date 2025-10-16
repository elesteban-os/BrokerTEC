import 'reflect-metadata'; // Siempre primero para decorators
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/data-source';
import { ENV } from './config/env';
import { swaggerSpec, swaggerUiOptions } from './config/swagger';

// Controladores (rutas)
import publicRegisterController from './modules/auth/Controllers/public-register.controller';
import adminRegisterController from './modules/auth/Controllers/admin-register.controller';
import loginController from './modules/auth/Controllers/login.controller';
import walletRoutes from './modules/auth/Controllers/wallet.controller';

async function bootstrap() {
  try {
    // Inicializa la conexión a la base de datos
    await AppDataSource.initialize();
    console.log('✅ DataSource inicializado correctamente.');

    const app = express();
    app.use(express.json());

    // -----------------------------
    // 📘 Documentación Swagger
    // -----------------------------
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

    // Endpoint para obtener la especificación OpenAPI en formato JSON
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // -----------------------------
    // 💰 Rutas del módulo Wallet
    // -----------------------------
    app.use('/api', walletRoutes);

    // -----------------------------
    // 🧑‍💼 Rutas del módulo Auth
    // -----------------------------
    // Registro público (TRADER)
    app.use('/api/auth', publicRegisterController);
    // Registro administrativo (ADMIN/ANALISTA)
    app.use('/api/auth', adminRegisterController);
    // Login / logout / refresh
    app.use('/api/auth', loginController);

    // -----------------------------
    // 💓 Health check
    // -----------------------------
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
    app.get('/health', (_req, res) => res.json({ ok: true }));

    // -----------------------------
    // 🧯 Manejador de errores global
    // -----------------------------
    app.use(
      (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('❌ Error no controlado:', err);
        res.status(500).json({ message: 'Internal server error' });
      }
    );

    // -----------------------------
    // 🚀 Arrancar servidor
    // -----------------------------
    app.listen(ENV.PORT, () => {
      console.log(`🚀 API corriendo en http://localhost:${ENV.PORT}`);
      console.log(`📘 Documentación en http://localhost:${ENV.PORT}/docs`);
    });
  } catch (error) {
    console.error('❌ Falló la inicialización del servidor o la base de datos:', error);
    process.exit(1);
  }
}

bootstrap();
