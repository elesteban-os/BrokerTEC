import dotenv from 'dotenv';
dotenv.config({ override: true });

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),

  DB_HOST: required('DB_HOST', 'localhost'),
  DB_PORT: Number(process.env.DB_PORT ?? 1435),
  DB_USER: required('DB_USER'),
  DB_PASS: required('DB_PASS'),
  DB_NAME: required('DB_NAME'),
  DB_ENCRYPT: (process.env.DB_ENCRYPT ?? 'true').toLowerCase() === 'true',
  DB_TRUST_SERVER_CERT: (process.env.DB_TRUST_SERVER_CERT ?? 'true').toLowerCase() === 'true',

  // JWT Configuration
  JWT_SECRET: required('JWT_SECRET'),
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION ?? '60m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
};
