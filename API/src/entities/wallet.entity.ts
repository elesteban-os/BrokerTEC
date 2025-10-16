// wallet.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne, 
  JoinColumn,
  Check,
  OneToMany
} from 'typeorm';
import { User } from './user.entity'; // Importamos la Entity de Usuario (UUID PK)
import { TopUp } from './top-up.entity'; // Se usará para la relación OneToMany

// Usamos @Check para replicar la restricción CHECK del DDL
@Entity('wallet') 
@Check(`"categoria" IN ('Junior', 'Mid', 'Senior')`)
export class Wallet {
  @PrimaryGeneratedColumn() // Corresponde a INT IDENTITY(1,1)
  id_wallet!: number;

  // Clave foránea al Usuario (UUID). Es 1:1 y ÚNICA.
  @Column({ 
    type: 'uuid',
    unique: true
  })
  id_user!: string; 
  
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    default: 0.00
  })
  saldo!: number;

  @Column({ 
    type: 'nvarchar', 
    length: 50 
  })
  categoria!: string; // 'Junior', 'Mid', 'Senior'

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  limite_diario!: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    default: 0.00
  })
  consumo_diario!: number;

  // Relación One-to-One: Un Wallet pertenece a un Usuario (y viceversa)
  @OneToOne(() => User, user => user.wallet, { 
    onDelete: 'CASCADE', // Refleja ON DELETE CASCADE del DDL
    onUpdate: 'CASCADE'  // Refleja ON UPDATE CASCADE del DDL
  })
  @JoinColumn({ name: 'id_user' }) // Define la columna FK
  user!: User;

  // Descomentar cuando crees top-up.entity.ts
  // Relación One-to-Many: Un Wallet tiene muchas Recargas
  @OneToMany(() => TopUp, topUp => topUp.wallet)
  topUps!: TopUp[];
}