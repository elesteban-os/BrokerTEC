/**
 * ENTITY (TypeORM) = clase ↔ tabla en la base de datos.
 * - Cada propiedad con @Column es una columna.
 * - @PrimaryGeneratedColumn crea una PK autoincremental (INT IDENTITY).
 * - @Index({ unique: true }) fuerza que 'alias' sea único.
 */
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity() // si no pones nombre, la tabla se llama 'user'
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  // Alias ÚNICO (no se repite). TypeORM creará un índice único en DB.
  @Index({ unique: true })
  @Column()
  alias!: string;

  // Rol simple para el ejemplo (TRADER | ADMIN | ANALYST)
  @Column({ default: 'TRADER' })
  role!: 'TRADER' | 'ADMIN' | 'ANALYST';
}
