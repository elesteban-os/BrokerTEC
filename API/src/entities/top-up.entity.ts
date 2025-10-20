// top-up.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Check,
  CreateDateColumn 
} from 'typeorm';
import { Wallet } from './wallet.entity'; // Importamos la Entity de Wallet

@Entity('recarga') // Nombre de la tabla en SQL Server
@Check(`"monto" > 0`) // Replicamos la restricción CHECK
export class TopUp {
  @PrimaryGeneratedColumn() // Corresponde a INT IDENTITY(1,1)
  id_recarga!: number;

  // Clave foránea a la Wallet (INT)
  @Column({ type: 'int' })
  id_wallet!: number; 
  
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  monto!: number; // Monto recargado
  
  // @CreateDateColumn es ideal para campos con DEFAULT GETDATE()
  @CreateDateColumn({ name: 'fecha_hora' }) 
  fecha_hora!: Date; 

  // Relación Many-to-One: Muchas recargas pertenecen a una Wallet
  @ManyToOne(() => Wallet, wallet => wallet.topUps, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_wallet' }) // Nombre de la columna FK
  wallet!: Wallet;
}