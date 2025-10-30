import { IsString, MinLength } from 'class-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     LiquidarTodoDto:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           minLength: 1
 *           example: "MiPassword123!"
 *           description: Contraseña del trader para confirmar la liquidación total del portafolio
 *       required:
 *         - password
 *     EmpresaPortada:
 *       type: object
 *       properties:
 *         id_empresa:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "TechCorp S.A."
 *         ticker:
 *           type: string
 *           example: "TECH"
 *         precio_actual:
 *           type: number
 *           format: double
 *           example: 125.50
 *         variacion_precio:
 *           type: number
 *           format: double
 *           example: 2.5
 *     DetalleEmpresa:
 *       type: object
 *       properties:
 *         id_empresa:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: "TechCorp S.A."
 *         ticker:
 *           type: string
 *           example: "TECH"
 *         descripcion:
 *           type: string
 *           example: "Empresa líder en tecnología"
 *         precio_actual:
 *           type: number
 *           format: double
 *           example: 125.50
 *         historico_precios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               precio:
 *                 type: number
 *                 format: double
 *     PosicionTrader:
 *       type: object
 *       properties:
 *         cantidad:
 *           type: integer
 *           example: 10
 *           description: Cantidad de acciones que posee el trader
 *         costo_promedio:
 *           type: number
 *           format: double
 *           example: 120.75
 *           description: Precio promedio de compra de las acciones
 *     Portafolio:
 *       type: object
 *       properties:
 *         posiciones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_empresa:
 *                 type: integer
 *               nombre_empresa:
 *                 type: string
 *               ticker:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *               costo_promedio:
 *                 type: number
 *                 format: double
 *               precio_actual:
 *                 type: number
 *                 format: double
 *               ganancia_perdida:
 *                 type: number
 *                 format: double
 *               porcentaje_ganancia:
 *                 type: number
 *                 format: double
 *         valor_total:
 *           type: number
 *           format: double
 *           example: 15000.00
 *         ganancia_perdida_total:
 *           type: number
 *           format: double
 *           example: 500.00
 */
export class LiquidarTodoDto {
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(1, { message: 'Debes proporcionar tu contraseña para confirmar' })
  password!: string;
}
