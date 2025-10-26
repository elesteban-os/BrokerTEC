import { IsString, IsInt, IsNumber, IsBoolean, IsOptional, IsPositive, Min, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateEmpresaDto:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 100
 *           description: Nombre de la empresa (opcional)
 *           example: "Apple Inc."
 *         id_mercado:
 *           type: integer
 *           description: ID del mercado (opcional)
 *           example: 1
 *         precio_actual:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           description: Precio actual de la acción (opcional)
 *           example: 155.75
 *         cantidad_acciones:
 *           type: integer
 *           minimum: 1
 *           description: Cantidad total de acciones (opcional)
 *           example: 1200
 *         habilitado:
 *           type: boolean
 *           description: Estado de la empresa (opcional)
 *           example: true
 */
export class UpdateEmpresaDto {
  /**
   * Nombre de la empresa (opcional)
   */
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre?: string;

  /**
   * ID del mercado (opcional)
   * Si se actualiza, debe ser un mercado existente y habilitado
   */
  @IsOptional()
  @IsInt({ message: 'El ID del mercado debe ser un número entero' })
  @IsPositive({ message: 'El ID del mercado debe ser un número positivo' })
  id_mercado?: number;

  /**
   * Precio actual de la acción (opcional)
   * Si se actualiza, debe ser mayor a 0
   */
  @IsOptional()
  @IsNumber({}, { message: 'El precio actual debe ser un número' })
  @IsPositive({ message: 'El precio actual debe ser mayor a 0' })
  @Min(0.01, { message: 'El precio actual debe ser al menos 0.01' })
  precio_actual?: number;

  /**
   * Cantidad total de acciones (opcional)
   * Si se actualiza, debe ser mayor a 0
   */
  @IsOptional()
  @IsInt({ message: 'La cantidad de acciones debe ser un número entero' })
  @IsPositive({ message: 'La cantidad de acciones debe ser mayor a 0' })
  @Min(1, { message: 'La cantidad de acciones debe ser al menos 1' })
  cantidad_acciones?: number;

  /**
   * Estado de la empresa (opcional)
   * true = habilitada, false = deshabilitada
   */
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  habilitado?: boolean;
}
