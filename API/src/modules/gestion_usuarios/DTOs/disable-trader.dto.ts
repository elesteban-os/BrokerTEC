import { IsString, MinLength } from 'class-validator';

/**
 * DTO para deshabilitar un trader (Admin)
 * Requiere justificación obligatoria
 */
export class DisableTraderDto {
  @IsString({ message: 'La justificación debe ser un texto' })
  @MinLength(10, { message: 'La justificación debe tener al menos 10 caracteres' })
  justificacion!: string;
}
