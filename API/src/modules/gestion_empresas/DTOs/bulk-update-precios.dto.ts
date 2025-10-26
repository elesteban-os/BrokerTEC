import { IsArray, ValidateNested, ArrayMinSize, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Item individual para actualización de precio en bulk
 */
export class PrecioItemDto {
  @IsNumber({}, { message: 'El id_empresa debe ser un número válido' })
  @IsPositive({ message: 'El id_empresa debe ser positivo' })
  @Type(() => Number)
  id_empresa!: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con máximo 2 decimales' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Min(0.01, { message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  precio_actual!: number;
}

/**
 * DTO para actualizar precios de múltiples empresas en una sola transacción
 */
export class BulkUpdatePreciosDto {
  @IsArray({ message: 'precios debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un precio para actualizar' })
  @ValidateNested({ each: true })
  @Type(() => PrecioItemDto)
  precios!: PrecioItemDto[];
}
