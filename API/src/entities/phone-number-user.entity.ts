// Entity para tabla de teléfonos de usuarios
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('PhoneNumber_User')
export class PhoneNumberUser {
  @PrimaryGeneratedColumn('uuid')
  id_phone!: string;

  @Column({ type: 'uuid' })
  id_user!: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number!: string;

  // Relación Many-to-One: muchos teléfonos pertenecen a un usuario
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user!: User;
}