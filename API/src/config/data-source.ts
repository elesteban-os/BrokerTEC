/** 
 * Configuración de la fuente de datos para TypeORM 
 * Define la conexión a la base de datos y las rutas de las entidades y migraciones
 */
 

import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { ENV } from './env';

const isCompiled = path.extname(__filename) === '.js';

const entityGlobs = isCompiled
  ? [path.join(process.cwd(), 'dist/entities/*.js')]
  : [path.join(process.cwd(), 'src/entities/*.ts')];

const migrationGlobs = isCompiled
  ? [path.join(process.cwd(), 'dist/db/migrations/*.js')]
  : [path.join(process.cwd(), 'src/db/migrations/*.ts')];

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASS,
  database: ENV.DB_NAME,
  options: {
    encrypt: ENV.DB_ENCRYPT,
    trustServerCertificate: ENV.DB_TRUST_SERVER_CERT,
  },
  synchronize: false,               
  requestTimeout:300000,
  logging: false,
  entities: entityGlobs,
  // rutas de migraciones para dev (ts-node) y build (js)
  migrations: migrationGlobs,
});
