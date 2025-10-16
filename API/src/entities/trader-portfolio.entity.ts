// trader-portfolio.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Index,
  Check
} from 'typeorm';
import { User } from './user.entity';    // Importamos la Entity de Usuario (UUID PK)
import { Company } from './company.entity'; // Importamos la Entity de Empresa (INT PK)

@Entity('cartera_trader') // Nombre de la tabla en SQL Server
@Check(`"cantidad_acciones" >= 0`)
@Check(`"costo_promedio" >= 0`)
// Replicamos el índice UNIQUE para (id_user, id_empresa)
@Index(['id_user', 'id_empresa'], { unique: true }) 
export class TraderPortfolio {
  @PrimaryGeneratedColumn() // Corresponde a INT IDENTITY(1,1)
  id_cartera_trader!: number;

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
    type: 'int' 
  })
  cantidad_acciones!: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  costo_promedio!: number;

  // Relación Many-to-One: Un registro pertenece a un Usuario
  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' }) 
  user!: User;
  
  // Relación Many-to-One: Un registro se refiere a una Empresa
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'id_empresa' }) 
  company!: Company;
}