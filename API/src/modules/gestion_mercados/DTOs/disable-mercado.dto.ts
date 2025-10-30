import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     DisableMercadoDto:
 *       type: object
 *       required:
 *         - justificacion
 *       properties:
 *         justificacion:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Justificación detallada del cierre del mercado
 *           example: "Cierre temporal por mantenimiento del sistema de trading"
 */
export class DisableMercadoDto {
  @IsString()
  @IsNotEmpty({ message: 'La justificación es requerida' })
  @MinLength(10, { message: 'La justificación debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La justificación no puede exceder 500 caracteres' })
  justificacion!: string;
}
