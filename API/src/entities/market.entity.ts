// Entity para la tabla mercados
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Company } from './company.entity';

@Entity('mercado') 
export class Market {
    @PrimaryGeneratedColumn()
    id_mercado!: number;

    @Column({ type: 'varchar', length: 35, unique: true })
    nombre!: string; // Nombre del mercado, e.g., "NYSE", "NASDAQ"

    @Column({ type: 'varchar', length: 15 })
    estado!: string; // Estado del mercado, e.g., "ABIERTO", "CERRADO"

    @Column({ type: 'varchar', length: 5 })
    moneda!: string; // Moneda del mercado, e.g., "USD", "EUR"

    @OneToMany(() => Company, company => company.market)
    companies!: Company[]; // Relación uno a muchos con empresas
}