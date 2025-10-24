import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMercadoDto:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nombre único del mercado
 *           example: "NASDAQ"
 */
export class CreateMercadoDto {
  /**
   * Nombre del mercado (debe ser único)
   * @example "NASDAQ"
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre!: string;
}
