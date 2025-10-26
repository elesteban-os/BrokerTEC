import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     DelistEmpresaDto:
 *       type: object
 *       required:
 *         - justificacion
 *       properties:
 *         justificacion:
 *           type: string
 *           minLength: 10
 *           description: Justificación del delisting (mínimo 10 caracteres)
 *           example: "La empresa será eliminada del mercado debido a fusión corporativa"
 */
export class DelistEmpresaDto {
  /**
   * Justificación del delisting
   * Requerido para auditoría y trazabilidad
   * Mínimo 10 caracteres
   */
  @IsString({ message: 'La justificación debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La justificación es requerida' })
  @MinLength(10, { message: 'La justificación debe tener al menos 10 caracteres' })
  justificacion!: string;
}
