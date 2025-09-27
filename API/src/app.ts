import 'reflect-metadata'; // siempre primero para decorators
import express from 'express';
import { AppDataSource } from './config/data-source';
import { ENV } from './config/env';
import usersController from './modules/users/user.controller';

async function bootstrap() {
  await AppDataSource.initialize();        // conecta TypeORM

  const app = express();
  app.use(express.json());

  // healthcheck
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // rutas del módulo users con prefijo /api
  app.use('/api/users', usersController);

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
