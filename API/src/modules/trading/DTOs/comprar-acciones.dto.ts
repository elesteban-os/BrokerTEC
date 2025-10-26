import { IsInt, IsPositive, Min } from 'class-validator';

/**
 * DTO para comprar acciones
 * Validaciones:
 * - ID de empresa debe ser un número entero positivo
 * - Cantidad de acciones debe ser al menos 1
 */
export class ComprarAccionesDto {
  @IsInt({ message: 'El ID de empresa debe ser un número entero' })
  @IsPositive({ message: 'El ID de empresa debe ser positivo' })
  id_empresa!: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'Debes comprar al menos 1 acción' })
  cantidad!: number;
}
