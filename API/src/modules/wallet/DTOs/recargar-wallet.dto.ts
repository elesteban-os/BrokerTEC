import { IsNumber, IsPositive, Min } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     RecargarWalletDto:
 *       type: object
 *       properties:
 *         monto:
 *           type: number
 *           format: double
 *           minimum: 1
 *           example: 1000.00
 *           description: Monto a recargar en el wallet (mínimo $1.00, máximo diario $1,000,000)
 *       required:
 *         - monto
 *     WalletResponse:
 *       type: object
 *       properties:
 *         id_wallet:
 *           type: integer
 *           example: 1
 *         id_user:
 *           type: integer
 *           example: 5
 *         saldo_disponible:
 *           type: number
 *           format: double
 *           example: 15000.50
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00Z"
 *         fecha_actualizacion:
 *           type: string
 *           format: date-time
 *           example: "2025-01-20T14:45:00Z"
 *     HistorialRecarga:
 *       type: object
 *       properties:
 *         id_auditoria:
 *           type: integer
 *           example: 123
 *         fecha_hora:
 *           type: string
 *           format: date-time
 *           example: "2025-01-20T14:45:00Z"
 *         monto_recargado:
 *           type: number
 *           format: double
 *           example: 5000.00
 *         saldo_anterior:
 *           type: number
 *           format: double
 *           example: 10000.50
 *         saldo_nuevo:
 *           type: number
 *           format: double
 *           example: 15000.50
 */
export class RecargarWalletDto {
  @IsNumber({}, { message: 'El monto debe ser un número válido' })
  @IsPositive({ message: 'El monto debe ser positivo' })
  @Min(1, { message: 'El monto mínimo de recarga es $1.00' })
  monto!: number;
}
