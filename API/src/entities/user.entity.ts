// Entity para tabla usuarios
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { PhoneNumberUser } from './phone-number-user.entity';
import { Role } from './role.entity';

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

  @Column({ type: 'int' })
  id_role!: number;

  @Column({ type: 'int', default: 0 })
  token_version!: number; // Para invalidar tokens JWT incrementando la versión

  // Relación muchos a uno: muchos usuarios pueden tener un rol
  @ManyToOne(() => Role, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_role' })
  role!: Role;

  // Relación uno a muchos: un usuario puede tener muchos teléfonos
  @OneToMany(() => PhoneNumberUser, phoneNumber => phoneNumber.user)
  phoneNumbers!: PhoneNumberUser[];
    wallet: any;
}
