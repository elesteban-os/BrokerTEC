/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           example: "trader_001"
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@brokertec.com"
 *         nombre:
 *           type: string
 *           example: "Juan"
 *         apellido1:
 *           type: string
 *           example: "Pérez"
 *         apellido2:
 *           type: string
 *           example: "González"
 *         password:
 *           type: string
 *           example: "MiPassword123!"
 *         country_origin:
 *           type: string
 *           example: "Costa Rica"
 *       required:
 *         - alias
 *         - email
 *         - nombre
 *         - apellido1
 *         - password
 *         - country_origin
 * 
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           example: "trader_002"
 *         email:
 *           type: string
 *           format: email
 *           example: "nuevo@brokertec.com"
 *         nombre:
 *           type: string
 *           example: "Carlos"
 *         apellido1:
 *           type: string
 *           example: "López"
 *         apellido2:
 *           type: string
 *           example: "Martínez"
 *         password:
 *           type: string
 *           example: "NuevaPassword456!"
 *         country_origin:
 *           type: string
 *           example: "México"
 *         status:
 *           type: boolean
 *           example: true
 */
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  alias!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  apellido1!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  apellido2?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)  // Mínimo 8 caracteres
  @MaxLength(255)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country_origin!: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  alias!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  apellido1!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  apellido2?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country_origin!: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
