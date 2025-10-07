// DTOs para login
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           example: "admin_001"
 *         password:
 *           type: string
 *           example: "MiPassword123!"
 *       required:
 *         - alias
 *         - password
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refresh_token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id_user:
 *               type: string
 *               format: uuid
 *             alias:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: object
 *               properties:
 *                 id_role:
 *                   type: number
 *                 role_name:
 *                   type: string
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id_user: string;
    alias: string;
    email: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    role: {
      id_role: number;
      role_name: string;
    };
  };
}