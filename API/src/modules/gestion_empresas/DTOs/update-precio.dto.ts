import { IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para actualizar el precio de una empresa (manual o API)
 */
export class UpdatePrecioDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido con máximo 2 decimales' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Min(0.01, { message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  precio_actual!: number;
}
