import { AppDataSource } from '../../../config/data-source';
import { Auditoria } from '../../../entities/auditoria.entity';
import { Empresa } from '../../../entities/empresa.entity';
import { User } from '../../../entities/user.entity';
import { Posicion } from '../../../entities/posicion.entity';
import { Mercado } from '../../../entities/mercado.entity';
import { PrecioHistorico } from '../../../entities/precio-historico.entity';
import { Repository, In, Between } from 'typeorm';
import { FilterTransaccionesDTO } from '../DTOs/analista.dto';

/**
 * Servicio para generar reportes del Analista
 * Solo accesible por usuarios con rol ANALISTA
 * Combina queries TypeORM simples + Stored Procedures complejos
 */
export class AnalistaReportesService {
  private auditoriaRepository: Repository<Auditoria>;
  private empresaRepository: Repository<Empresa>;
  private userRepository: Repository<User>;
  private posicionRepository: Repository<Posicion>;
  private mercadoRepository: Repository<Mercado>;
  private precioHistoricoRepository: Repository<PrecioHistorico>;

  constructor() {
    this.auditoriaRepository = AppDataSource.getRepository(Auditoria);
    this.empresaRepository = AppDataSource.getRepository(Empresa);
    this.userRepository = AppDataSource.getRepository(User);
    this.posicionRepository = AppDataSource.getRepository(Posicion);
    this.mercadoRepository = AppDataSource.getRepository(Mercado);
    this.precioHistoricoRepository = AppDataSource.getRepository(PrecioHistorico);
  }

  /**
   * 1. HISTORIAL DE TRANSACCIONES POR EMPRESA
   * Obtiene todas las operaciones de compra/venta de una empresa específica
   * Usa TypeORM con filtros
   */
  async getTransaccionesPorEmpresa(nombre_empresa: string, filtros: FilterTransaccionesDTO) {
    try {
      // Validar que la empresa existe
      const empresa = await this.empresaRepository.findOne({
        where: { nombre: nombre_empresa, habilitado: true },
        relations: ['mercado']
      });

      if (!empresa) {
        throw new Error(`Empresa "${nombre_empresa}" no encontrada o deshabilitada`);
      }

      // Construir query base - filtrar por ticker_empresa en auditoría
      const queryBuilder = this.auditoriaRepository
        .createQueryBuilder('auditoria')
        .where('auditoria.ticker_empresa = :nombre', { nombre: nombre_empresa })
        .andWhere('auditoria.accion IN (:...acciones)', { 
          acciones: ['COMPRA', 'VENTA', 'LIQUIDAR_TODO'] 
        })
        .orderBy('auditoria.fecha_hora', 'DESC');

      // Aplicar filtros opcionales
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        queryBuilder.andWhere('auditoria.fecha_hora BETWEEN :inicio AND :fin', {
          inicio: new Date(filtros.fecha_inicio),
          fin: new Date(filtros.fecha_fin + 'T23:59:59') // Incluir todo el día
        });
      }

      if (filtros.tipo_accion) {
        queryBuilder.andWhere('auditoria.accion = :tipo', { tipo: filtros.tipo_accion });
      }

      const transacciones = await queryBuilder.getMany();

      // Calcular resumen
      const totalCompras = transacciones.filter(t => t.accion === 'COMPRA').length;
      const totalVentas = transacciones.filter(t => t.accion === 'VENTA' || t.accion === 'LIQUIDAR_TODO').length;
      const volumenTotal = transacciones.reduce((sum, t) => sum + (t.cantidad_acciones || 0), 0);
      const montoTotal = transacciones.reduce((sum, t) => sum + (t.monto_operacion || 0), 0);

      return {
        empresa: {
          nombre: empresa.nombre,
          mercado: empresa.mercado.nombre,
          precio_actual: empresa.precio_actual
        },
        resumen: {
          total_transacciones: transacciones.length,
          total_compras: totalCompras,
          total_ventas: totalVentas,
          volumen_total_acciones: volumenTotal,
          monto_total_operado: Number(montoTotal.toFixed(2))
        },
        transacciones: transacciones.map(t => ({
          id_auditoria: t.id_auditoria,
          fecha_hora: t.fecha_hora,
          accion: t.accion,
          alias: t.user_alias,
          cantidad_acciones: t.cantidad_acciones,
          precio_operacion: t.precio_operacion,
          monto_operacion: t.monto_operacion,
          ganancia_perdida: t.ganancia_perdida,
          exitosa: t.exitosa
        })),
        filtros_aplicados: filtros,
        fecha_consulta: new Date()
      };

    } catch (error: any) {
      console.error('Error al obtener transacciones por empresa:', error);
      throw new Error(`Error al generar historial de empresa: ${error.message}`);
    }
  }

  /**
   * 2. HISTORIAL DE TRANSACCIONES POR USUARIO (ALIAS)
   * Obtiene todas las operaciones de un trader específico
   * Usa TypeORM con filtros
   */
  async getTransaccionesPorAlias(alias: string, filtros: FilterTransaccionesDTO) {
    try {
      // Validar que el usuario existe y es trader
      const user = await this.userRepository.findOne({
        where: { alias },
        relations: ['role']
      });

      if (!user) {
        throw new Error(`Usuario con alias '${alias}' no encontrado`);
      }

      if (user.role.role_name !== 'TRADER') {
        throw new Error(`El usuario '${alias}' no es un trader`);
      }

      // Construir query
      const queryBuilder = this.auditoriaRepository
        .createQueryBuilder('auditoria')
        .where('auditoria.user_alias = :alias', { alias })
        .andWhere('auditoria.accion IN (:...acciones)', { 
          acciones: ['COMPRA', 'VENTA', 'LIQUIDAR_TODO'] 
        })
        .orderBy('auditoria.fecha_hora', 'DESC');

      // Aplicar filtros opcionales
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        queryBuilder.andWhere('auditoria.fecha_hora BETWEEN :inicio AND :fin', {
          inicio: new Date(filtros.fecha_inicio),
          fin: new Date(filtros.fecha_fin + 'T23:59:59')
        });
      }

      if (filtros.tipo_accion) {
        queryBuilder.andWhere('auditoria.accion = :tipo', { tipo: filtros.tipo_accion });
      }

      const transacciones = await queryBuilder.getMany();

      // Agrupar por empresa
      const porEmpresa = transacciones.reduce((acc: any, t) => {
        const ticker = t.ticker_empresa || 'DESCONOCIDO';
        if (!acc[ticker]) {
          acc[ticker] = { compras: 0, ventas: 0, volumen: 0, monto: 0 };
        }
        if (t.accion === 'COMPRA') acc[ticker].compras++;
        else acc[ticker].ventas++;
        acc[ticker].volumen += t.cantidad_acciones || 0;
        acc[ticker].monto += t.monto_operacion || 0;
        return acc;
      }, {});

      const totalCompras = transacciones.filter(t => t.accion === 'COMPRA').length;
      const totalVentas = transacciones.filter(t => t.accion === 'VENTA' || t.accion === 'LIQUIDAR_TODO').length;
      const montoTotal = transacciones.reduce((sum, t) => sum + (t.monto_operacion || 0), 0);
      const gananciaTotal = transacciones
        .filter(t => t.accion === 'VENTA' || t.accion === 'LIQUIDAR_TODO')
        .reduce((sum, t) => sum + (t.ganancia_perdida || 0), 0);

      return {
        usuario: {
          alias: user.alias,
          nombre: `${user.nombre} ${user.apellido1}`,
          status: user.status ? 'Activo' : 'Inactivo'
        },
        resumen: {
          total_transacciones: transacciones.length,
          total_compras: totalCompras,
          total_ventas: totalVentas,
          monto_total_operado: Number(montoTotal.toFixed(2)),
          ganancia_perdida_total: Number(gananciaTotal.toFixed(2)),
          empresas_operadas: Object.keys(porEmpresa).length
        },
        detalle_por_empresa: Object.entries(porEmpresa).map(([ticker, stats]: [string, any]) => ({
          ticker,
          compras: stats.compras,
          ventas: stats.ventas,
          volumen_acciones: stats.volumen,
          monto_operado: Number(stats.monto.toFixed(2))
        })),
        transacciones: transacciones.map(t => ({
          id_auditoria: t.id_auditoria,
          fecha_hora: t.fecha_hora,
          accion: t.accion,
          ticker_empresa: t.ticker_empresa,
          cantidad_acciones: t.cantidad_acciones,
          precio_operacion: t.precio_operacion,
          monto_operacion: t.monto_operacion,
          ganancia_perdida: t.ganancia_perdida,
          saldo_anterior: t.saldo_anterior,
          saldo_nuevo: t.saldo_nuevo,
          exitosa: t.exitosa
        })),
        filtros_aplicados: filtros,
        fecha_consulta: new Date()
      };

    } catch (error: any) {
      console.error('Error al obtener transacciones por alias:', error);
      throw new Error(`Error al generar historial de usuario: ${error.message}`);
    }
  }

  /**
   * 3. INVENTARIO DE TESORERÍA
   * Obtiene todas las empresas con sus acciones disponibles (no vendidas)
   * Usa TypeORM simple
   */
  async getInventarioTesoreria(id_mercado?: number) {
    try {
      const queryBuilder = this.empresaRepository
        .createQueryBuilder('empresa')
        .leftJoinAndSelect('empresa.mercado', 'mercado')
        .where('empresa.habilitado = :habilitado', { habilitado: true })
        .andWhere('empresa.cantidad_acciones > 0')
        .orderBy('mercado.nombre', 'ASC')
        .addOrderBy('empresa.nombre', 'ASC');  // Ordenar por nombre en lugar de ticker

      if (id_mercado) {
        queryBuilder.andWhere('empresa.id_mercado = :id_mercado', { id_mercado });
      }

      const empresas = await queryBuilder.getMany();

      // Calcular totales
      const totalAccionesDisponibles = empresas.reduce((sum, e) => sum + e.cantidad_acciones, 0);
      const valorTotalTesoreria = empresas.reduce((sum, e) => 
        sum + (e.cantidad_acciones * e.precio_actual), 0
      );

      // Agrupar por mercado
      const porMercado = empresas.reduce((acc: any, e) => {
        const mercado = e.mercado.nombre;
        if (!acc[mercado]) {
          acc[mercado] = { empresas: 0, acciones: 0, valor: 0 };
        }
        acc[mercado].empresas++;
        acc[mercado].acciones += e.cantidad_acciones;
        acc[mercado].valor += e.cantidad_acciones * e.precio_actual;
        return acc;
      }, {});

      return {
        resumen: {
          total_empresas: empresas.length,
          total_acciones_disponibles: totalAccionesDisponibles,
          valor_total_tesoreria: Number(valorTotalTesoreria.toFixed(2))
        },
        por_mercado: Object.entries(porMercado).map(([mercado, stats]: [string, any]) => ({
          mercado,
          empresas: stats.empresas,
          acciones_disponibles: stats.acciones,
          valor_total: Number(stats.valor.toFixed(2))
        })),
        inventario: empresas.map(e => ({
          nombre: e.nombre,
          mercado: e.mercado.nombre,
          acciones_disponibles: e.cantidad_acciones,
          precio_actual: e.precio_actual,
          valor_inventario: Number((e.cantidad_acciones * e.precio_actual).toFixed(2))
        })),
        fecha_consulta: new Date()
      };

    } catch (error: any) {
      console.error('Error al obtener inventario de Tesorería:', error);
      throw new Error(`Error al generar inventario: ${error.message}`);
    }
  }

  /**
   * 4. MAYOR TENEDOR POR EMPRESA
   * Ejecuta SP: usp_GetMayorTenedorPorEmpresa
   * Retorna ranking de holders (traders + Tesorería)
   */
  async getMayorTenedorPorEmpresa(nombre_empresa: string) {
    try {
      // Validar que la empresa existe primero
      const empresa = await this.empresaRepository.findOne({
        where: { nombre: nombre_empresa, habilitado: true }
      });

      if (!empresa) {
        throw new Error(`Empresa "${nombre_empresa}" no encontrada o deshabilitada`);
      }

      // Ejecutar SP con raw query
      const result = await AppDataSource.query(
        'EXEC usp_GetMayorTenedorPorEmpresa @nombre_empresa = @0',
        [nombre_empresa]
      );

      console.log('Resultado del SP:', JSON.stringify(result, null, 2));
      console.log('Tipo de result:', typeof result, 'Es array:', Array.isArray(result));
      console.log('Longitud:', result?.length);

      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error('No se recibieron datos del stored procedure');
      }

      // CASO REAL: El SP solo retorna el primer SELECT (tenedores)
      // El segundo SELECT no llega a TypeORM
      // Solución: usar los datos de tenedores + calcular info desde la empresa
      
      let tenedores: any[] = [];
      let infoEmpresa: any = null;

      // Verificar si es un array simple de tenedores (lo que estamos recibiendo)
      const primerElemento = result[0];
      
      if (primerElemento && primerElemento.alias && primerElemento.cantidad_acciones) {
        // Es un array plano de tenedores
        tenedores = result;
        
        // Calcular información de empresa manualmente
        const accionesEnTenedores = tenedores.reduce((sum, t) => 
          sum + (t.tipo_tenedor === 'TRADER' ? t.cantidad_acciones : 0), 0
        );
        
        const accionesEnTesoreria = tenedores.find(t => t.tipo_tenedor === 'TESORERIA')?.cantidad_acciones || 0;
        
        infoEmpresa = {
          nombre_empresa: empresa.nombre,
          total_acciones_empresa: empresa.cantidad_acciones,
          acciones_en_circulacion: accionesEnTenedores,
          acciones_disponibles_tesoreria: accionesEnTesoreria,
          status: 'SUCCESS'
        };
      } else if (primerElemento && primerElemento.status === 'ERROR') {
        // El SP retornó un error
        throw new Error(primerElemento.mensaje);
      } else {
        throw new Error('Estructura de resultado del SP no reconocida');
      }

      return {
        empresa: {
          nombre: infoEmpresa.nombre_empresa,
          total_acciones: infoEmpresa.total_acciones_empresa,
          acciones_en_circulacion: infoEmpresa.acciones_en_circulacion,
          acciones_disponibles: infoEmpresa.acciones_disponibles_tesoreria
        },
        tenedores: tenedores.map((t: any) => ({
          alias: t.alias,
          cantidad_acciones: t.cantidad_acciones,
          porcentaje_total: t.porcentaje_total,
          tipo: t.tipo_tenedor
        })),
        mayor_tenedor: tenedores && tenedores.length > 0 ? {
          alias: tenedores[0].alias,
          cantidad: tenedores[0].cantidad_acciones,
          porcentaje: tenedores[0].porcentaje_total
        } : null,
        fecha_consulta: new Date()
      };

    } catch (error: any) {
      console.error('Error al obtener mayor tenedor:', error);
      throw new Error(`Error al consultar tenedores: ${error.message}`);
    }
  }

  /**
   * 5. DISTRIBUCIÓN DE ACCIONES EN EL MERCADO
   * Ejecuta SP: usp_GetDistribucionAccionesMercado
   * Retorna % de acciones en traders vs. administración
   */
  async getDistribucionAccionesMercado(
    id_mercado?: number,
    nivel: 'empresa' | 'mercado' = 'empresa'
  ) {
    try {
      // Ejecutar SP
      const result = await AppDataSource.query(
        'EXEC usp_GetDistribucionAccionesMercado @id_mercado = @0, @nivel = @1',
        [id_mercado || null, nivel]
      );

      // Verificar si hubo error
      if (result[0] && result[0].status === 'ERROR') {
        throw new Error(result[0].mensaje);
      }

      if (nivel === 'empresa') {
        // Distribución detallada por empresa
        return {
          nivel: 'empresa',
          mercado_filtrado: id_mercado || 'Todos los mercados',
          distribucion: result.map((row: any) => ({
            mercado: {
              id: row.id_mercado,
              nombre: row.nombre_mercado
            },
            empresa: {
              id: row.id_empresa,
              nombre: row.nombre_empresa,
              total_acciones: row.total_acciones_empresa
            },
            en_traders: {
              cantidad: row.acciones_en_traders,
              porcentaje: row.porcentaje_traders,
              numero_tenedores: row.numero_traders_tenedores
            },
            en_tesoreria: {
              cantidad: row.acciones_en_tesoreria,
              porcentaje: row.porcentaje_tesoreria
            }
          })),
          fecha_consulta: new Date()
        };
      } else {
        // Distribución agrupada por mercado
        return {
          nivel: 'mercado',
          mercado_filtrado: id_mercado || 'Todos los mercados',
          distribucion: result.map((row: any) => ({
            mercado: {
              id: row.id_mercado,
              nombre: row.nombre_mercado,
              numero_empresas: row.numero_empresas
            },
            totales: {
              total_acciones: row.total_acciones_mercado,
              en_traders: row.acciones_en_traders,
              en_tesoreria: row.acciones_en_tesoreria
            },
            porcentajes: {
              traders: row.porcentaje_traders,
              tesoreria: row.porcentaje_tesoreria
            },
            traders_activos: row.numero_traders_activos
          })),
          fecha_consulta: new Date()
        };
      }

    } catch (error: any) {
      console.error('Error al obtener distribución de mercado:', error);
      throw new Error(`Error al consultar distribución: ${error.message}`);
    }
  }

  /**
   * 6. HISTORIAL DE PRECIOS DE UNA EMPRESA (Para gráfico Precio vs Tiempo)
   * Obtiene el historial de precios de una empresa para graficar
   */
  async getHistorialPrecios(nombre_empresa: string, limit: number = 50) {
    try {
      // Validar que la empresa existe
      const empresa = await this.empresaRepository.findOne({
        where: { nombre: nombre_empresa, habilitado: true }
      });

      if (!empresa) {
        throw new Error(`Empresa "${nombre_empresa}" no encontrada o deshabilitada`);
      }

      // Obtener historial ordenado por fecha (más reciente primero)
      const historial = await this.precioHistoricoRepository.find({
        where: { id_empresa: empresa.id_empresa },
        order: { fecha_hora: 'DESC' },
        take: limit
      });

      // Calcular estadísticas
      const precios = historial.map(h => h.precio);
      const precio_actual = empresa.precio_actual;
      const precio_max = precios.length > 0 ? Math.max(...precios) : 0;
      const precio_min = precios.length > 0 ? Math.min(...precios) : 0;
      const precio_promedio = precios.length > 0 
        ? precios.reduce((sum, p) => sum + Number(p), 0) / precios.length 
        : 0;

      // Calcular variación desde el precio más antiguo del historial
      const precio_mas_antiguo = historial.length > 0 ? historial[historial.length - 1].precio : 0;
      const variacion_monto = Number(precio_actual) - Number(precio_mas_antiguo);
      const variacion_porcentaje = precio_mas_antiguo > 0 
        ? ((variacion_monto / Number(precio_mas_antiguo)) * 100) // Porcentaje
        : 0;

      return {
        empresa: {
          id_empresa: empresa.id_empresa,
          nombre: empresa.nombre,
          precio_actual: precio_actual
        },
        estadisticas: {
          precio_actual: Number(precio_actual),
          precio_max: Number(precio_max),
          precio_min: Number(precio_min),
          precio_promedio: Number(precio_promedio.toFixed(2)),
          variacion_monto: Number(variacion_monto.toFixed(2)),
          variacion_porcentaje: Number(variacion_porcentaje.toFixed(2)),
          total_registros: historial.length
        },
        historial: historial.map(h => ({
          precio: Number(h.precio),
          fecha_hora: h.fecha_hora
        })).reverse() // Invertir para que el gráfico muestre del más antiguo al más reciente
      };

    } catch (error: any) {
      console.error('Error al obtener historial de precios:', error);
      throw new Error(`Error al consultar historial de precios: ${error.message}`);
    }
  }
}
