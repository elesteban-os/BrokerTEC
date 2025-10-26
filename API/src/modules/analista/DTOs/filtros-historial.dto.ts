import { IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrosHistorialDto {
    @IsOptional()
    @IsDateString({}, { message: 'Formato de fecha "desde" inválido' })
    desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Formato de fecha "hasta" inválido' })
    hasta?: string;

    @IsOptional()
    @Type(() => Number) // Transforma el string de query a número
    @IsInt({ message: 'ID de empresa debe ser un número entero' })
    id_empresa?: number;

    @IsOptional()
    @IsEnum(['Buy', 'Sell'], { message: 'Tipo debe ser "Buy" o "Sell"' })
    tipo?: 'Buy' | 'Sell';
}