import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateMercadoDto:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nombre único del mercado
 *           example: "NYSE"
 *         habilitado:
 *           type: boolean
 *           description: Estado del mercado (habilitado/deshabilitado)
 *           example: true
 */
export class UpdateMercadoDto {
  /**
   * Nombre del mercado (opcional)
   * @example "NYSE"
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre?: string;

  /**
   * Estado del mercado (opcional)
   * @example true
   */
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  habilitado?: boolean;
}
