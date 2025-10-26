import { IsString, MinLength } from 'class-validator';

/**
 * DTO para liquidar todas las posiciones del trader
 * Requiere confirmación con contraseña por seguridad
 */
export class LiquidarTodoDto {
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(1, { message: 'Debes proporcionar tu contraseña para confirmar' })
  password!: string;
}
