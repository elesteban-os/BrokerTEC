// DTOs para registro administrativo (solo ADMIN puede usar)
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber, IsIn } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminRegisterDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           example: "nuevo_admin"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@brokertec.com"
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
 *           example: "AdminPassword123!"
 *         country_origin:
 *           type: string
 *           example: "Costa Rica"
 *         id_role:
 *           type: number
 *           enum: [1, 2]
 *           description: "1 = ADMINISTRADOR, 2 = ANALISTA"
 *           example: 1
 *       required:
 *         - alias
 *         - email
 *         - nombre
 *         - apellido1
 *         - password
 *         - country_origin
 *         - id_role
 */
export class AdminRegisterDto {
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

  @IsNumber()
  @IsNotEmpty()
  @IsIn([1, 2], { message: 'id_role debe ser 1 (ADMINISTRADOR) o 2 (ANALISTA)' })
  id_role!: number; // 1 = ADMINISTRADOR, 2 = ANALISTA
}