import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  JoinColumn, 
  Check, 
  OneToMany
} from 'typeorm';
import { Market } from './market.entity';
import { PriceHistory } from './price-history.entity';

@Entity('empresa')
@Check(`"acciones_totales" >= 0`)
@Check(`"acciones_disponibles" >= 0`)
@Check(`"estado" IN ('Listado', 'No Listado')`)
@Check(`"capital_actual" >= 0`)
export class Company {
    @PrimaryGeneratedColumn()
    id_empresa!: number;

    @Column({ type: 'int' })
    id_mercado!: number;

    @Column({ type: 'varchar', length: 35, unique: true })
    nombre!: string; // Nombre de la empresa

    @Column({ type: 'bigint' })
    acciones_totales!: number; // Total shares issued by the company

    @Column({ type: 'bigint' })
    acciones_disponibles!: number; // Shares available for trading

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    capital_actual!: number; // Current market capitalization

    @Column({ type: 'varchar', length: 15 })
    estado!: string; // "Listado" o "No Listado"

    @Column({ type: 'varchar', length: 35, nullable: true })
    justificacion_delistar?: string; // Justification for delisting, if applicable

    @ManyToOne(() => Market)
    @JoinColumn({ name: 'id_mercado' })
    market!: Market; // Relación muchos a uno con mercado

    @OneToMany(() => PriceHistory, ph => ph.company)
    priceHistories!: PriceHistory[]; // Relación uno a muchos con historial de precios
}