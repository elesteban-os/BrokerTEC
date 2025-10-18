// Entity para tabla de teléfonos de usuarios
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('PhoneNumber_User')
export class PhoneNumberUser {
  @PrimaryGeneratedColumn()
  id_phone!: number;

  @Column({ type: 'int' })
  id_user!: number;

  @Column({ type: 'varchar', length: 20 })
  phone_number!: string;

  // Relación Many-to-One: muchos teléfonos pertenecen a un usuario
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user!: User;
}