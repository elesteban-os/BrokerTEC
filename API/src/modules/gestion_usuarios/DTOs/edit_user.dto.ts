// DTO para actualizar el perfil del usuario (sin contraseña)
// Comentado en español y con esquema Swagger
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     EditUserDto:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           example: "nuevo_alias"
 *         email:
 *           type: string
 *           format: email
 *           example: "nuevo@email.com"
 *         nombre:
 *           type: string
 *           example: "Juan"
 *         apellido1:
 *           type: string
 *           example: "Pérez"
 *         apellido2:
 *           type: string
 *           example: "González"
 *         country_origin:
 *           type: string
 *           example: "Costa Rica"
 */
export class EditUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  alias?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  apellido1?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  apellido2?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country_origin?: string;
}

