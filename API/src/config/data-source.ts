import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ENV } from './env';
import { User } from '../modules/users/user.entity'; // 👈 importa la entidad
import path from 'node:path';

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
  synchronize: false,               // en prod: SIEMPRE false; usa migraciones
  logging: false,
  entities: [User],                 //  registra la entidad
  // rutas de migraciones para dev (ts-node) y build (js)
  migrations: [
    path.join(process.cwd(), 'src/db/migrations/*.ts'),
    path.join(process.cwd(), 'dist/db/migrations/*.js'),
  ],
});
