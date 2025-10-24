import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Empresa } from './empresa.entity';

/**
 * Entity para tabla posiciones
 * Representa las acciones que posee cada usuario (trader o Tesorería)
 * Una posición = cantidad de acciones de una empresa que posee un usuario
 */
@Entity('posiciones')
export class Posicion {
  @PrimaryGeneratedColumn()
  id_posicion!: number;

  // FK: Usuario que posee las acciones
  @Column({ type: 'int' })
  id_user!: number;

  // FK: Empresa de la cual se poseen acciones
  @Column({ type: 'int' })
  id_empresa!: number;

  // Cantidad de acciones que posee
  @Column({ type: 'int', default: 0 })
  cantidad!: number;

  // Precio promedio de compra (para calcular ganancias/pérdidas)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costo_promedio!: number;

  // Fecha de creación de la posición
  @CreateDateColumn()
  fecha_creacion!: Date;

  // Fecha de última actualización
  @UpdateDateColumn()
  fecha_actualizacion!: Date;

  // ===== RELACIONES =====

  // Relación muchos a uno: muchas posiciones pertenecen a un usuario
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user!: User;

  // Relación muchos a uno: muchas posiciones pertenecen a una empresa
  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_empresa' })
  empresa!: Empresa;

  // ===== MÉTODO CALCULADO =====

  /**
   * Calcula el valor actual de la posición
   * valor_actual = cantidad × precio_actual_empresa
   */
  calcularValorActual(): number {
    if (this.empresa && this.empresa.precio_actual) {
      return this.cantidad * this.empresa.precio_actual;
    }
    return 0;
  }

  /**
   * Calcula la ganancia/pérdida de la posición
   * ganancia = (precio_actual - costo_promedio) × cantidad
   */
  calcularGananciaPerdida(): number {
    if (this.empresa && this.empresa.precio_actual) {
      return (this.empresa.precio_actual - this.costo_promedio) * this.cantidad;
    }
    return 0;
  }
}
