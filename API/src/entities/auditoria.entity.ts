// Entity para tabla de auditoría - BrokerTEC
// Registra todas las acciones importantes realizadas por los usuarios y se utiliza para reportes 
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn()
  id_auditoria!: number;

  // ===== ¿QUIÉN HIZO LA ACCIÓN? =====
  @Column({ type: 'int', nullable: true })
  id_user!: number | null; // Puede ser null para acciones del sistema

  @Column({ type: 'varchar', length: 50, nullable: true })
  user_alias!: string | null; // Guardamos alias por si se elimina el usuario

  @Column({ type: 'varchar', length: 20, nullable: true })
  user_role!: string | null; // ADMINISTRADOR, ANALISTA, TRADER

  // ===== ¿QUÉ HIZO? =====
  @Column({ type: 'varchar', length: 50 })
  accion!: string; // LOGIN, USER_CREATE, COMPRA, VENTA, LIQUIDAR_TODO, etc.

  @Column({ type: 'varchar', length: 50 })
  entidad_afectada!: string; // usuarios, empresas, mercados, wallet, ordenes

  @Column({ type: 'int', nullable: true })
  id_registro_afectado!: number | null; // ID del registro modificado

  // ===== ESPECÍFICO PARA TRADING =====
  @Column({ type: 'varchar', length: 100, nullable: true })
  ticker_empresa!: string | null; // "AAPL", "GOOGL", "AMZN"

  @Column({ type: 'int', nullable: true })
  cantidad_acciones!: number | null; // Cantidad de acciones en la operación

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  precio_operacion!: number | null; // Precio por acción

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monto_operacion!: number | null; // Monto total de la operación

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldo_anterior!: number | null; // Saldo en wallet antes

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldo_nuevo!: number | null; // Saldo en wallet después

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  ganancia_perdida!: number | null; // Ganancia o pérdida en ventas (positivo = ganancia, negativo = pérdida)

  // ===== INFORMACIÓN ADMINISTRATIVA =====
  @Column({ type: 'text', nullable: true })
  justificacion!: string | null; // Para deshabilitar usuarios, delisting, etc.

  @Column({ type: 'bit', default: false })
  requiere_confirmacion!: boolean; // Si requirió reingreso de contraseña

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null; // Descripción legible de la acción

  // ===== INFORMACIÓN TEMPORAL =====
  @CreateDateColumn()
  fecha_hora!: Date; // Timestamp automático

  @Column({ type: 'bit', default: true })
  exitosa!: boolean; // Si la acción fue exitosa

  @Column({ type: 'text', nullable: true })
  mensaje_error!: string | null; // Mensaje de error si falló

  // ===== RELACIÓN =====
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'id_user' })
  user!: User | null;
}