import { IsString, IsNotEmpty, IsInt, IsNumber, IsPositive, Min, MaxLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateEmpresaDto:
 *       type: object
 *       required:
 *         - nombre
 *         - id_mercado
 *         - precio_actual
 *         - cantidad_acciones
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 100
 *           description: Nombre de la empresa
 *           example: "Apple Inc."
 *         id_mercado:
 *           type: integer
 *           description: ID del mercado al que pertenece la empresa
 *           example: 1
 *         precio_actual:
 *           type: number
 *           format: decimal
 *           minimum: 0.01
 *           description: Precio actual de la acción (debe ser mayor a 0)
 *           example: 150.50
 *         cantidad_acciones:
 *           type: integer
 *           minimum: 1
 *           description: Cantidad total de acciones de la empresa (debe ser mayor a 0)
 *           example: 1000
 */
export class CreateEmpresaDto {
  /**
   * Nombre de la empresa
   * Ejemplo: "Apple Inc.", "Microsoft Corporation"
   */
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre!: string;

  /**
   * ID del mercado al que pertenece la empresa
   * Debe ser un mercado existente y habilitado
   */
  @IsInt({ message: 'El ID del mercado debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del mercado es requerido' })
  @IsPositive({ message: 'El ID del mercado debe ser un número positivo' })
  id_mercado!: number;

  /**
   * Precio actual de la acción
   * Debe ser mayor a 0
   */
  @IsNumber({}, { message: 'El precio actual debe ser un número' })
  @IsNotEmpty({ message: 'El precio actual es requerido' })
  @IsPositive({ message: 'El precio actual debe ser mayor a 0' })
  @Min(0.01, { message: 'El precio actual debe ser al menos 0.01' })
  precio_actual!: number;

  /**
   * Cantidad total de acciones de la empresa
   * Representa el inventario inicial disponible
   */
  @IsInt({ message: 'La cantidad de acciones debe ser un número entero' })
  @IsNotEmpty({ message: 'La cantidad de acciones es requerida' })
  @IsPositive({ message: 'La cantidad de acciones debe ser mayor a 0' })
  @Min(1, { message: 'La cantidad de acciones debe ser al menos 1' })
  cantidad_acciones!: number;
}
