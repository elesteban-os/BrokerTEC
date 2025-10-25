import { IsEnum } from 'class-validator';

/**
 * DTO para cambiar la categoría de wallet de un trader
 * Solo puede ser usado por administradores
 */
export class ChangeCategoryDto {
  @IsEnum(['JUNIOR', 'MID', 'SENIOR'], { 
    message: 'La categoría debe ser JUNIOR, MID o SENIOR' 
  })
  nueva_categoria!: 'JUNIOR' | 'MID' | 'SENIOR';
}
