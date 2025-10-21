// Entity para tabla de precios históricos
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Empresa } from './empresa.entity';

@Entity('precios_historicos')
@Index(['id_empresa', 'fecha_hora'], { unique: true }) // No duplicar precio en mismo timestamp
export class PrecioHistorico {
  @PrimaryGeneratedColumn()
  id_precio!: number;

  @Column({ type: 'int' })
  id_empresa!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  precio!: number; // Precio de la acción en USD en ese momento

  @CreateDateColumn()
  fecha_hora!: Date; // Timestamp de cuándo se registró el precio

  // Relación muchos a uno: muchos precios pertenecen a una empresa
  @ManyToOne(() => Empresa, empresa => empresa.precios_historicos)
  @JoinColumn({ name: 'id_empresa' })
  empresa!: Empresa;
}
