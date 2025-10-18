// DTO para cambiar contraseña del usuario autenticado
// Comentarios en español para claridad
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     ChangePasswordDto:
 *       type: object
 *       properties:
 *         current_password:
 *           type: string
 *           example: "MiPasswordActual123!"
 *         new_password:
 *           type: string
 *           example: "MiPasswordNueva123!"
 *       required:
 *         - current_password
 *         - new_password
 */
export class ChangePasswordDto {
  // Contraseña actual del usuario, se usa para verificar identidad
  @IsString()
  @IsNotEmpty()
  current_password!: string;

  // Nueva contraseña que será establecida tras verificación
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  new_password!: string;
}

