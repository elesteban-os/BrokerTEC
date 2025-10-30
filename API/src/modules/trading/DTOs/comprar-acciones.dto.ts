import { IsInt, IsPositive, Min } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     ComprarAccionesDto:
 *       type: object
 *       properties:
 *         id_empresa:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 5
 *           description: ID de la empresa de la cual comprar acciones
 *         cantidad:
 *           type: integer
 *           format: int32
 *           minimum: 1
 *           example: 10
 *           description: Cantidad de acciones a comprar
 *       required:
 *         - id_empresa
 *         - cantidad
 */
export class ComprarAccionesDto {
  @IsInt({ message: 'El ID de empresa debe ser un número entero' })
  @IsPositive({ message: 'El ID de empresa debe ser positivo' })
  id_empresa!: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'Debes comprar al menos 1 acción' })
  cantidad!: number;
}
