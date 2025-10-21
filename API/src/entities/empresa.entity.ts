// Entity para tabla de empresas
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Mercado } from './mercado.entity';
import { PrecioHistorico } from './precio-historico.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id_empresa!: number;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string; // Nombre completo: "Apple Inc.", "Google LLC", "Microsoft Corporation"

  @Column({ type: 'int' })
  id_mercado!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  precio_actual!: number; // Precio actual de la acción en USD

  @Column({ type: 'int' })
  cantidad_acciones!: number; // Cantidad total de acciones de la empresa

  @Column({ type: 'bit', default: true })
  habilitado!: boolean; // true = habilitado, false = deshabilitado (delisted)

  // Propiedad calculada por ser atributo derivado (no se almacena en BD)
  get capitalizacion(): number {
    return this.precio_actual * this.cantidad_acciones;
  }

  @CreateDateColumn()
  fecha_creacion!: Date;

  // Relación muchos a uno: muchas empresas pertenecen a un mercado
  @ManyToOne(() => Mercado, mercado => mercado.empresas)
  @JoinColumn({ name: 'id_mercado' })
  mercado!: Mercado;

  // Relación uno a muchos: una empresa tiene muchos precios históricos
  @OneToMany(() => PrecioHistorico, precio => precio.empresa)
  precios_historicos!: PrecioHistorico[];
}
