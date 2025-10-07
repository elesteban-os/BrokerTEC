import { AppDataSource } from '../../../config/data-source';
import { Auditoria } from '../../../entities/auditoria.entity';
import { Repository } from 'typeorm';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

export interface RegistroAuditoria {
  // Usuario que realiza la acción
  id_user?: string | null;
  user_alias?: string | null;
  user_role?: string | null;
  
  // Qué se hizo
  accion: TipoAccionAuditoria;
  entidad_afectada: EntidadAfectada;
  id_registro_afectado?: string | null;
  
  // Específico para trading
  ticker_empresa?: string | null;
  cantidad_acciones?: number | null;
  precio_operacion?: number | null;
  monto_operacion?: number | null;
  saldo_anterior?: number | null;
  saldo_nuevo?: number | null;
  
  // Información adicional
  justificacion?: string | null;
  requiere_confirmacion?: boolean;
  descripcion?: string | null;
  exitosa?: boolean;
  mensaje_error?: string | null;
}

export class AuditoriaService {
  private repo: Repository<Auditoria>;

  constructor() {
    this.repo = AppDataSource.getRepository(Auditoria);
  }

  /**
   * Registrar una acción en la auditoría
   */
  async registrar(data: RegistroAuditoria): Promise<void> {
    try {
      const auditoria = this.repo.create({
        id_user: data.id_user || null,
        user_alias: data.user_alias || null,
        user_role: data.user_role || null,
        accion: data.accion,
        entidad_afectada: data.entidad_afectada,
        id_registro_afectado: data.id_registro_afectado || null,
        ticker_empresa: data.ticker_empresa || null,
        cantidad_acciones: data.cantidad_acciones || null,
        precio_operacion: data.precio_operacion || null,
        monto_operacion: data.monto_operacion || null,
        saldo_anterior: data.saldo_anterior || null,
        saldo_nuevo: data.saldo_nuevo || null,
        justificacion: data.justificacion || null,
        requiere_confirmacion: data.requiere_confirmacion || false,
        descripcion: data.descripcion || null,
        exitosa: data.exitosa ?? true,
        mensaje_error: data.mensaje_error || null
      });

      await this.repo.save(auditoria);
    } catch (error) {
      // En caso de error, no queremos que falle la operación principal
      console.error('Error al registrar auditoría:', error);
    }
  }

  /**
   * Obtener historial de auditoría con filtros básicos
   */
  async obtenerHistorial(filtros: {
    id_user?: string;
    accion?: TipoAccionAuditoria;
    entidad_afectada?: EntidadAfectada;
    ticker_empresa?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    limit?: number;
  }) {
    const query = this.repo.createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.user', 'user')
      .orderBy('auditoria.fecha_hora', 'DESC');

    if (filtros.id_user) {
      query.andWhere('auditoria.id_user = :id_user', { id_user: filtros.id_user });
    }

    if (filtros.accion) {
      query.andWhere('auditoria.accion = :accion', { accion: filtros.accion });
    }

    if (filtros.entidad_afectada) {
      query.andWhere('auditoria.entidad_afectada = :entidad', { entidad: filtros.entidad_afectada });
    }

    if (filtros.ticker_empresa) {
      query.andWhere('auditoria.ticker_empresa = :ticker', { ticker: filtros.ticker_empresa });
    }

    if (filtros.fecha_desde) {
      query.andWhere('auditoria.fecha_hora >= :fecha_desde', { fecha_desde: filtros.fecha_desde });
    }

    if (filtros.fecha_hasta) {
      query.andWhere('auditoria.fecha_hora <= :fecha_hasta', { fecha_hasta: filtros.fecha_hasta });
    }

    if (filtros.limit) {
      query.limit(filtros.limit);
    }

    return query.getMany();
  }

  /**
   * Obtener estadísticas básicas
   */
  async obtenerEstadisticas(dias: number = 7) {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - dias);

    const query = this.repo.createQueryBuilder('auditoria')
      .where('auditoria.fecha_hora >= :fecha_desde', { fecha_desde: fechaDesde });

    const [
      totalAcciones,
      operacionesTrading,
      accionesAdmin,
      usuariosMasActivos
    ] = await Promise.all([
      query.getCount(),
      query.clone().andWhere('auditoria.accion IN (:...acciones)', { 
        acciones: ['COMPRA', 'VENTA', 'LIQUIDAR_TODO'] 
      }).getCount(),
      query.clone().andWhere('auditoria.user_role = :role', { role: 'ADMINISTRADOR' }).getCount(),
      query.clone()
        .select('auditoria.user_alias', 'usuario')
        .addSelect('COUNT(*)', 'cantidad')
        .where('auditoria.user_alias IS NOT NULL')
        .groupBy('auditoria.user_alias')
        .orderBy('cantidad', 'DESC')
        .limit(5)
        .getRawMany()
    ]);

    return {
      totalAcciones,
      operacionesTrading,
      accionesAdmin,
      usuariosMasActivos
    };
  }
}