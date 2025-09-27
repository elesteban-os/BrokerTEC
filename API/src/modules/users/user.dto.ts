/**
 * DTO (Data Transfer Object) = contrato de entrada/salida del endpoint.
 * Con class-validator definimos reglas que se validan ANTES de tocar la DB.
 * Así evitamos insertar basura y simplificamos los controladores.
 */
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsIn(['TRADER', 'ADMIN', 'ANALYST'])
  role!: 'TRADER' | 'ADMIN' | 'ANALYST';
}

export class UpdateUserDto {
  // En PUT vamos a permitir cambiar ambos campos.
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsIn(['TRADER', 'ADMIN', 'ANALYST'])
  role!: 'TRADER' | 'ADMIN' | 'ANALYST';
}
