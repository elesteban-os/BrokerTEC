// DTOs para registro público (TRADER)
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsArray } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterPublicDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           example: "testTrader01"
 *         email:
 *           type: string
 *           format: email
 *           example: "tradertest01@brokertec.com"
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
 *           example: "Holahola3"
 *         country_origin:
 *           type: string
 *           example: "Costa Rica"
 *         phone_numbers:
 *           type: array
 *           items:
 *             type: string
 *           example: ["8820-1234", "2222-5678"]
 *       required:
 *         - alias
 *         - email
 *         - nombre
 *         - apellido1
 *         - password
 *         - country_origin
 */
export class RegisterPublicDto {
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

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  phone_numbers?: string[];
}