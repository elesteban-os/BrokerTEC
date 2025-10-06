/**
 * DTO (Data Transfer Object) = contrato de entrada/salida del endpoint.
 * Con class-validator definimos reglas que se validan ANTES de tocar la DB.
 * Así evitamos insertar basura y simplificamos los controladores.
 * 
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           description: Alias único del usuario
 *           example: "trader_001"
 *         role:
 *           type: string
 *           enum: [TRADER, ADMIN, ANALYST]
 *           description: Rol del usuario en el sistema
 *           example: "TRADER"
 *       required:
 *         - alias
 *         - role
 * 
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           description: Nuevo alias único del usuario
 *           example: "trader_002"
 *         role:
 *           type: string
 *           enum: [TRADER, ADMIN, ANALYST]
 *           description: Nuevo rol del usuario en el sistema
 *           example: "ADMIN"
 *       required:
 *         - alias
 *         - role
 */
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsIn(['TRADER', 'ADMIN', 'ANALYST'])
  role!: 'TRADER' | 'ADMIN' | 'ANALYST';
}

export class UpdateUserDto {
  // En PUT vamos a permitir cambiar ambos campos.
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsIn(['TRADER', 'ADMIN', 'ANALYST'])
  role!: 'TRADER' | 'ADMIN' | 'ANALYST';
}
