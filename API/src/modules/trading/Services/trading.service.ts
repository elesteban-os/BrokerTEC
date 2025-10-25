import { AppDataSource } from '../../../config/data-source';
import { Empresa } from '../../../entities/empresa.entity';
import { Mercado } from '../../../entities/mercado.entity';
import { PrecioHistorico } from '../../../entities/precio-historico.entity';
import { Repository } from 'typeorm';

/**
 * Servicio para consultas de trading de traders
 * Portada (top empresas por mercado) y detalle de empresas
 * Solo accesible por usuarios con rol TRADER
 */
export class TradingService {
  private empresaRepository: Repository<Empresa>;
  private mercadoRepository: Repository<Mercado>;
  private precioHistoricoRepository: Repository<PrecioHistorico>;

  constructor() {
    this.empresaRepository = AppDataSource.getRepository(Empresa);
    this.mercadoRepository = AppDataSource.getRepository(Mercado);
    this.precioHistoricoRepository = AppDataSource.getRepository(PrecioHistorico);
  }

  /**
   * Obtiene la portada con top empresas agrupadas por mercado
   * Solo muestra mercados y empresas habilitados
   * 
   * @returns Lista de mercados con sus top empresas (ordenadas por capitalización)
   */
  async getPortada() {
    try {
      // Obtener todos los mercados habilitados
      const mercados = await this.mercadoRepository.find({
        where: { habilitado: true },
        order: { nombre: 'ASC' }
      });

      // Para cada mercado, obtener sus top empresas
      const portada = await Promise.all(
        mercados.map(async (mercado) => {
          // Obtener empresas habilitadas del mercado, ordenadas por capitalización
          const empresas = await this.empresaRepository.find({
            where: { 
              id_mercado: mercado.id_mercado,
              habilitado: true 
            },
            order: { precio_actual: 'DESC' } // Aproximación: mayor precio suele ser mayor cap
          });

          // Calcular capitalización y tomar top empresas
          const empresasConCapitalizacion = empresas
            .map(empresa => ({
              id_empresa: empresa.id_empresa,
              nombre: empresa.nombre,
              precio_actual: empresa.precio_actual,
              cantidad_acciones: empresa.cantidad_acciones,
              capitalizacion: empresa.precio_actual * empresa.cantidad_acciones
            }))
            .sort((a, b) => b.capitalizacion - a.capitalizacion)
            .slice(0, 10); // Top 10 empresas por mercado

          return {
            id_mercado: mercado.id_mercado,
            nombre_mercado: mercado.nombre,
            cantidad_empresas: empresasConCapitalizacion.length,
            top_empresas: empresasConCapitalizacion
          };
        })
      );

      // Filtrar mercados que tengan al menos una empresa
      return portada.filter(m => m.cantidad_empresas > 0);

    } catch (error) {
      console.error('Error al obtener portada:', error);
      throw new Error('Error al cargar la portada');
    }
  }

  /**
   * Obtiene el detalle completo de una empresa
   * Incluye información general e histórico de precios
   * 
   * @param id_empresa - ID de la empresa a consultar
   * @param dias - Número de días de histórico (por defecto 30)
   * @returns Información completa de la empresa con histórico de precios
   */
  async getDetalleEmpresa(id_empresa: number, dias: number = 30) {
    try {
      // Buscar la empresa con su mercado
      const empresa = await this.empresaRepository.findOne({
        where: { id_empresa },
        relations: ['mercado']
      });

      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }

      // Validar que la empresa esté habilitada
      if (!empresa.habilitado) {
        throw new Error('Esta empresa está deshabilitada y no se puede consultar');
      }

      // Obtener histórico de precios (últimos N días)
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);

      const historicoPrecio = await this.precioHistoricoRepository.find({
        where: { id_empresa },
        order: { fecha_hora: 'DESC' },
        take: dias
      });

      // Información completa de la empresa
      return {
        id_empresa: empresa.id_empresa,
        nombre: empresa.nombre,
        precio_actual: empresa.precio_actual,
        cantidad_acciones: empresa.cantidad_acciones,
        capitalizacion: empresa.precio_actual * empresa.cantidad_acciones,
        habilitado: empresa.habilitado,
        fecha_creacion: empresa.fecha_creacion,
        mercado: {
          id_mercado: empresa.mercado.id_mercado,
          nombre: empresa.mercado.nombre,
          habilitado: empresa.mercado.habilitado
        },
        historico_precios: historicoPrecio.map(h => ({
          precio: h.precio,
          fecha_hora: h.fecha_hora
        }))
      };

    } catch (error) {
      console.error('Error al obtener detalle de empresa:', error);
      throw error;
    }
  }
}
