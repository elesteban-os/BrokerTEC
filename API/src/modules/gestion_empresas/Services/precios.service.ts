import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { Empresa } from '../../../entities/empresa.entity';
import { PrecioHistorico } from '../../../entities/precio-historico.entity';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';
import { UpdatePrecioDto } from '../DTOs/update-precio.dto';
import { BulkUpdatePreciosDto } from '../DTOs/bulk-update-precios.dto';

export class PreciosService {
  private empresaRepository: Repository<Empresa>;
  private precioHistoricoRepository: Repository<PrecioHistorico>;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.empresaRepository = AppDataSource.getRepository(Empresa);
    this.precioHistoricoRepository = AppDataSource.getRepository(PrecioHistorico);
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Actualizar precio de una empresa (manual o API)
   */
  async updatePrecio(
    id_empresa: number,
    dto: UpdatePrecioDto,
    user: any,
    isApi: boolean = false
  ): Promise<{ empresa: Empresa; precio_anterior: number }> {
    // Buscar empresa
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa },
      relations: ['mercado']
    });

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    if (!empresa.habilitado) {
      throw new Error('No se puede actualizar el precio de una empresa deshabilitada');
    }

    if (!empresa.mercado.habilitado) {
      throw new Error('No se puede actualizar el precio de una empresa en un mercado deshabilitado');
    }

    const precio_anterior = empresa.precio_actual;

    // Guardar en histórico
    const precioHistorico = this.precioHistoricoRepository.create({
      id_empresa: empresa.id_empresa,
      precio: dto.precio_actual
    });
    await this.precioHistoricoRepository.save(precioHistorico);

    // Actualizar precio actual en empresa
    empresa.precio_actual = dto.precio_actual;
    await this.empresaRepository.save(empresa);

    // Auditoría
    await this.auditoriaService.registrar({
      id_user: user.id_user,
      user_alias: user.alias,
      user_role: user.role.role_name,
      accion: isApi ? TipoAccionAuditoria.PRECIO_UPDATE_API : TipoAccionAuditoria.PRECIO_UPDATE_MANUAL,
      entidad_afectada: EntidadAfectada.PRECIOS,
      id_registro_afectado: empresa.id_empresa,
      ticker_empresa: empresa.nombre,
      precio_operacion: dto.precio_actual,
      descripcion: JSON.stringify({
        empresa: empresa.nombre,
        precio_anterior,
        precio_nuevo: dto.precio_actual,
        variacion: ((dto.precio_actual - precio_anterior) / precio_anterior * 100).toFixed(2) + '%'
      })
    });

    return { empresa, precio_anterior };
  }

  /**
   * Actualizar precios de múltiples empresas usando Stored Procedure
   */
  async bulkUpdatePrecios(
    dto: BulkUpdatePreciosDto,
    user: any
  ): Promise<{ exitosos: number; fallidos: number; detalles: any[] }> {
    try {
      // Convertir el array de precios a JSON para el SP
      const preciosJson = JSON.stringify(dto.precios);

      // Ejecutar el stored procedure
      const result = await AppDataSource.query(
        `EXEC usp_BulkUpdatePrecios 
          @precios_json = @0,
          @id_admin = @1,
          @admin_alias = @2,
          @admin_role = @3`,
        [
          preciosJson,
          user.id_user,
          user.alias,
          user.role.role_name
        ]
      );

      // El SP retorna: exitosos, fallidos, detalles_json
      const exitosos = result[0]?.exitosos || 0;
      const fallidos = result[0]?.fallidos || 0;
      
      // Parsear detalles_json si existe
      let detalles = [];
      if (result[0]?.detalles_json) {
        try {
          detalles = JSON.parse(result[0].detalles_json);
        } catch (parseError) {
          console.error('Error al parsear detalles_json:', parseError);
          detalles = [];
        }
      }

      return { exitosos, fallidos, detalles };

    } catch (error: any) {
      console.error('Error en bulkUpdatePrecios:', error);
      throw new Error(`Error al actualizar precios en bulk: ${error.message}`);
    }
  }

  /**
   * Obtener historial de precios de una empresa (para gráfico precio vs. tiempo)
   */
  async getHistorialPrecios(id_empresa: number, limit: number = 50): Promise<any> {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa },
      relations: ['mercado']
    });

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    // Obtener historial ordenado por fecha (más reciente primero)
    const historial = await this.precioHistoricoRepository.find({
      where: { id_empresa },
      order: { fecha_hora: 'DESC' },
      take: limit
    });

    // Calcular estadísticas
    const precios = historial.map(h => h.precio);
    const precio_max = precios.length > 0 ? Math.max(...precios) : 0;
    const precio_min = precios.length > 0 ? Math.min(...precios) : 0;
    const precio_promedio = precios.length > 0 
      ? precios.reduce((a, b) => a + b, 0) / precios.length 
      : 0;

    // Calcular variación desde el precio más antiguo del historial
    const precio_mas_antiguo = historial.length > 0 ? historial[historial.length - 1].precio : 0;
    const variacion_porcentual = precio_mas_antiguo > 0
      ? ((empresa.precio_actual - precio_mas_antiguo) / precio_mas_antiguo * 100).toFixed(2)
      : '0.00';

    return {
      empresa: {
        id_empresa: empresa.id_empresa,
        nombre: empresa.nombre,
        mercado: empresa.mercado.nombre,
        precio_actual: empresa.precio_actual,
        capitalizacion: empresa.capitalizacion
      },
      estadisticas: {
        precio_max,
        precio_min,
        precio_promedio: parseFloat(precio_promedio.toFixed(2)),
        variacion_porcentual: parseFloat(variacion_porcentual),
        total_registros: historial.length
      },
      historial: historial.map(h => ({
        precio: h.precio,
        fecha: h.fecha_hora
      }))
    };
  }
}
