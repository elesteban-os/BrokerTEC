// transaction.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Check,
  CreateDateColumn
} from 'typeorm';
import { User } from './user.entity';    // Importamos la Entity de Usuario (UUID PK)
import { Empresa } from './empresa.entity'; // Importamos la Entity de Empresa (INT PK)

@Entity('transaccion') // Nombre de la tabla en SQL Server
@Check(`"tipo" IN ('Buy', 'Sell')`)
@Check(`"precio" >= 0`)
export class Transaction {
  @PrimaryGeneratedColumn() // Corresponde a INT IDENTITY(1,1)
  id_transaccion!: number;

  // Clave foránea al Usuario (UUID)
  @Column({ 
    type: 'uuid', 
    name: 'id_user' 
  })
  id_user!: string; 
  
  // Clave foránea a la Empresa (INT)
  @Column({ 
    type: 'int',
    name: 'id_empresa'
  })
  id_empresa!: number; 
  
  @Column({ 
    type: 'nvarchar', 
    length: 50 
  })
  tipo!: string; // 'Buy' o 'Sell'

  @Column({ 
    type: 'int' 
  })
  cantidad!: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  precio!: number;

  // @CreateDateColumn es ideal para campos con DEFAULT GETDATE()
  @CreateDateColumn({ name: 'fecha_hora' }) 
  fecha_hora!: Date; 

  // Relación Many-to-One: Una transacción pertenece a un Usuario
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_user' }) 
  user!: User;
  
  // Relación Many-to-One: Una transacción se refiere a una Empresa
  @ManyToOne(() => Empresa, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_empresa' }) 
  empresa!: Empresa;
}