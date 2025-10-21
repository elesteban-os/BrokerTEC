// Entity para tabla de mercados
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { Empresa } from './empresa.entity';

@Entity('mercados')
export class Mercado {
  @PrimaryGeneratedColumn()
  id_mercado!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  nombre!: string; // Ejemplo: "NASDAQ", "NYSE", "Bolsa de San José"

  @Column({ type: 'bit', default: true })
  habilitado!: boolean; // true = habilitado, false = deshabilitado

  @CreateDateColumn()
  fecha_creacion!: Date;

  // Relación uno a muchos: un mercado puede tener muchas empresas
  @OneToMany(() => Empresa, empresa => empresa.mercado)
  empresas!: Empresa[];
}
