// Entity para tabla de roles
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id_role!: number;

  @Column({ 
    type: 'varchar', 
    length: 50,
    unique: true 
  })
  role_name!: string; // "ADMINISTRADOR", "ANALISTA", "TRADER"

  // Relación uno a muchos: un rol puede ser asignado a muchos usuarios
  @OneToMany(() => User, user => user.role)
  users!: User[];
}