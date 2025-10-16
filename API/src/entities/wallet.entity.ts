import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

export type WalletCategory = 'JUNIOR' | 'MID' | 'SENIOR';

@Entity('wallets')
@Unique(['user']) // garantiza 1 wallet por usuario
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id_wallet!: string;

  // Relación 1:1 (FK vive en wallets)
  @OneToOne(() => User, user => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user!: User;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance!: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', length: 10, default: 'JUNIOR' })
  category!: WalletCategory;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  daily_limit!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  today_consumed!: number;

  // Para resetear consumo al cambiar el día
  @Column({ type: 'date', nullable: true })
  last_consumed_date!: Date | null;

  // SQL Server: GETDATE() ; (en Postgres sería now())
  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  created_at!: Date;
}
