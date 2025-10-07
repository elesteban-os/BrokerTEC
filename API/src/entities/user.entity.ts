// Entity para tabla usuarios
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id_user!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  alias!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  email!: string;

  @Column({ type: 'varchar', length: 50 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50 })
  apellido1!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  apellido2?: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 100 })
  country_origin!: string;

  @Column({ type: 'bit', default: true })
  status!: boolean;
}
