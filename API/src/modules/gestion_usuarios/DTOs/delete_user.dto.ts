// DTO para eliminar la cuenta del usuario autenticado
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     DeleteAccountDto:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           example: "MiPasswordActual123!"
 *       required:
 *         - password
 */
export class DeleteAccountDto {
  // Contraseña actual para confirmar la eliminación
  @IsString()
  @IsNotEmpty()
  password!: string;
}

