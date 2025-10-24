import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * Categorías de wallet según límite diario de recarga
 * JUNIOR: Límite bajo
 * MID: Límite medio
 * SENIOR: Límite alto
 */
export type WalletCategory = 'JUNIOR' | 'MID' | 'SENIOR';

/**
 * Entity para tabla wallets (billeteras de usuarios)
 * Gestiona el efectivo disponible y límites de recarga diarios
 */
@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id_wallet!: number;

  // FK: Un wallet pertenece a un usuario
  @Column({ type: 'int', unique: true })
  id_user!: number;

  // Relación 1:1 con User (FK vive en wallets)
  @OneToOne(() => User, user => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user!: User;

  // Saldo disponible en USD
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo!: number;

  // Categoría del usuario (define límite diario)
  @Column({ 
    type: 'varchar', 
    length: 10, 
    default: 'JUNIOR'
  })
  categoria!: WalletCategory;

  // Límite diario de recarga según categoría
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  limite_diario!: number;

  // Consumo de recargas del día actual
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  consumo_dia!: number;

  // Fecha de la última recarga (para resetear consumo diario)
  @Column({ type: 'date', nullable: true })
  fecha_ultima_recarga?: Date;

  // Fecha de creación del wallet
  @CreateDateColumn()
  fecha_creacion!: Date;
}