// price-history.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Index,
  Check,
  CreateDateColumn 
} from 'typeorm';
import { Company } from './company.entity'; // Importamos el Entity de Empresa

@Entity('precio_historico') // Nombre de la tabla en SQL Server
@Check(`"precio" >= 0`)
// Replicamos el índice UNIQUE para (id_empresa, fecha_hora)
@Index(['id_empresa', 'fecha_hora'], { unique: true }) 
export class PriceHistory {
  @PrimaryGeneratedColumn() // Corresponde a INT IDENTITY(1,1)
  id_precio_hist!: number;

  // Clave foránea a la Empresa (INT)
  @Column({ type: 'int' })
  id_empresa!: number; 
  
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 4 
  })
  precio!: number;

  // @CreateDateColumn es ideal para campos con DEFAULT GETDATE()
  @CreateDateColumn({ name: 'fecha_hora' }) 
  fecha_hora!: Date; // Corresponde a DATETIME NOT NULL DEFAULT GETDATE()

  // Relación Many-to-One: Muchos registros de historial pertenecen a una empresa
  @ManyToOne(() => Company, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_empresa' }) // Nombre de la columna FK
  company!: Company;
}