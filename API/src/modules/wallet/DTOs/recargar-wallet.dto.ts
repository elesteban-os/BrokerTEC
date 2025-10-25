import { IsNumber, IsPositive, Min } from 'class-validator';

/**
 * DTO para recargar el wallet de un trader
 * Validaciones:
 * - El monto debe ser un número positivo
 * - Mínimo $1.00
 */
export class RecargarWalletDto {
  @IsNumber({}, { message: 'El monto debe ser un número válido' })
  @IsPositive({ message: 'El monto debe ser positivo' })
  @Min(1, { message: 'El monto mínimo de recarga es $1.00' })
  monto!: number;
}
