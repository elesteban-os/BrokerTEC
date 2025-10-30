// Entity para tabla usuarios
import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { PhoneNumberUser } from './phone-number-user.entity';
import { Role } from './role.entity';
import { Wallet } from './wallet.entity';
import { Posicion } from './posicion.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id_user!: number;

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
  token_version!: number; // Para invalidar tokens JWT incrementando la versión cuando sea necesario

  // Relación muchos a uno: muchos usuarios pueden tener un rol
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'id_role' })
  role!: Role;

  // Relación uno a muchos: un usuario puede tener muchos teléfonos
  @OneToMany(() => PhoneNumberUser, phoneNumber => phoneNumber.user)
  phoneNumbers!: PhoneNumberUser[];

  // Relación uno a uno: un usuario tiene un wallet
  @OneToOne(() => Wallet, wallet => wallet.user)
  wallet?: Wallet | null;

  // Relación uno a muchos: un usuario puede tener muchas posiciones (acciones)
  @OneToMany(() => Posicion, posicion => posicion.user)
  posiciones?: Posicion[];
}
