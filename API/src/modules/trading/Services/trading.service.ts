import { AppDataSource } from '../../../config/data-source';
import { Empresa } from '../../../entities/empresa.entity';
import { Mercado } from '../../../entities/mercado.entity';
import { PrecioHistorico } from '../../../entities/precio-historico.entity';
import { Posicion } from '../../../entities/posicion.entity';
import { User } from '../../../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para trading de traders
 * Portada, detalle de empresas, compra/venta de acciones, portafolio y liquidación
 * Solo accesible por usuarios con rol TRADER
 */
export class TradingService {
  private empresaRepository: Repository<Empresa>;
  private mercadoRepository: Repository<Mercado>;
  private precioHistoricoRepository: Repository<PrecioHistorico>;
  private posicionRepository: Repository<Posicion>;
  private userRepository: Repository<User>;

  constructor() {
    this.empresaRepository = AppDataSource.getRepository(Empresa);
    this.mercadoRepository = AppDataSource.getRepository(Mercado);
    this.precioHistoricoRepository = AppDataSource.getRepository(PrecioHistorico);
    this.posicionRepository = AppDataSource.getRepository(Posicion);
    this.userRepository = AppDataSource.getRepository(User);
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

  /**
   * Compra acciones de una empresa
   * Valida disponibilidad, fondos suficientes, y actualiza posiciones
   * 
   * @param id_user - ID del trader que compra
   * @param user_alias - Alias del trader (para auditoría)
   * @param id_empresa - ID de la empresa a comprar
   * @param cantidad - Cantidad de acciones a comprar
   * @returns Resultado de la operación con mensaje detallado
   */
  async comprarAcciones(
    id_user: number,
    user_alias: string,
    id_empresa: number,
    cantidad: number
  ) {
    try {
      // Ejecutar el Stored Procedure
      const result = await AppDataSource.query(
        `DECLARE @mensaje NVARCHAR(500), @exito BIT;
         EXEC usp_ComprarAcciones 
           @id_user = @0, 
           @id_empresa = @1, 
           @cantidad = @2, 
           @user_alias = @3,
           @mensaje_resultado = @mensaje OUTPUT,
           @exito = @exito OUTPUT;
         SELECT @mensaje AS mensaje, @exito AS exito;`,
        [id_user, id_empresa, cantidad, user_alias]
      );

      const { mensaje, exito } = result[0];

      if (!exito) {
        throw new Error(mensaje);
      }

      return {
        exito: true,
        mensaje
      };

    } catch (error: any) {
      console.error('Error en compra de acciones:', error);
      throw new Error(error.message || 'Error al realizar la compra');
    }
  }

  /**
   * Vende acciones de una empresa
   * Valida que el trader tenga suficientes acciones y actualiza posiciones
   * 
   * @param id_user - ID del trader que vende
   * @param user_alias - Alias del trader (para auditoría)
   * @param id_empresa - ID de la empresa a vender
   * @param cantidad - Cantidad de acciones a vender
   * @returns Resultado de la operación con mensaje detallado (incluye ganancia/pérdida)
   */
  async venderAcciones(
    id_user: number,
    user_alias: string,
    id_empresa: number,
    cantidad: number
  ) {
    try {
      // Ejecutar el Stored Procedure
      const result = await AppDataSource.query(
        `DECLARE @mensaje NVARCHAR(500), @exito BIT;
         EXEC usp_VenderAcciones 
           @id_user = @0, 
           @id_empresa = @1, 
           @cantidad = @2, 
           @user_alias = @3,
           @mensaje_resultado = @mensaje OUTPUT,
           @exito = @exito OUTPUT;
         SELECT @mensaje AS mensaje, @exito AS exito;`,
        [id_user, id_empresa, cantidad, user_alias]
      );

      const { mensaje, exito } = result[0];

      if (!exito) {
        throw new Error(mensaje);
      }

      return {
        exito: true,
        mensaje
      };

    } catch (error: any) {
      console.error('Error en venta de acciones:', error);
      throw new Error(error.message || 'Error al realizar la venta');
    }
  }

  /**
   * Obtiene el portafolio completo del trader
   * Muestra todas sus posiciones con ganancias/pérdidas no realizadas
   * 
   * @param id_user - ID del trader
   * @returns Lista de posiciones con detalles y resumen total
   */
  async getPortafolio(id_user: number) {
    try {
      // Obtener todas las posiciones del trader con información de empresas
      const posiciones = await this.posicionRepository.find({
        where: { id_user },
        relations: ['empresa'],
        order: { fecha_creacion: 'DESC' }
      });

      if (posiciones.length === 0) {
        return {
          posiciones: [],
          resumen: {
            total_posiciones: 0,
            total_invertido: 0,
            valor_actual_total: 0,
            ganancia_perdida_total: 0,
            porcentaje_ganancia_perdida: 0
          }
        };
      }

      // Calcular detalles para cada posición
      const posicionesDetalladas = posiciones.map(posicion => {
        const valor_invertido = posicion.cantidad * posicion.costo_promedio;
        const valor_actual_total = posicion.cantidad * posicion.empresa.precio_actual;
        const ganancia_perdida = valor_actual_total - valor_invertido;
        const porcentaje_ganancia_perdida = (ganancia_perdida / valor_invertido) * 100;

        return {
          id_posicion: posicion.id_posicion,
          empresa: {
            id_empresa: posicion.empresa.id_empresa,
            nombre: posicion.empresa.nombre,
            ticker: posicion.empresa.nombre // Si tienes un campo ticker separado, úsalo
          },
          cantidad_acciones: posicion.cantidad,
          costo_promedio: posicion.costo_promedio,
          precio_actual: posicion.empresa.precio_actual,
          valor_invertido: Number(valor_invertido.toFixed(2)),
          valor_actual_total: Number(valor_actual_total.toFixed(2)),
          ganancia_perdida: Number(ganancia_perdida.toFixed(2)),
          porcentaje_ganancia_perdida: Number(porcentaje_ganancia_perdida.toFixed(2)),
          fecha_creacion: posicion.fecha_creacion
        };
      });

      // Calcular resumen total
      const resumen = posicionesDetalladas.reduce(
        (acc, pos) => ({
          total_posiciones: acc.total_posiciones + 1,
          total_invertido: acc.total_invertido + pos.valor_invertido,
          valor_actual_total: acc.valor_actual_total + pos.valor_actual_total,
          ganancia_perdida_total: acc.ganancia_perdida_total + pos.ganancia_perdida,
          porcentaje_ganancia_perdida: 0 // Se calcula después
        }),
        {
          total_posiciones: 0,
          total_invertido: 0,
          valor_actual_total: 0,
          ganancia_perdida_total: 0,
          porcentaje_ganancia_perdida: 0
        }
      );

      // Calcular porcentaje total
      if (resumen.total_invertido > 0) {
        resumen.porcentaje_ganancia_perdida = Number(
          ((resumen.ganancia_perdida_total / resumen.total_invertido) * 100).toFixed(2)
        );
      }

      return {
        posiciones: posicionesDetalladas,
        resumen
      };

    } catch (error: any) {
      console.error('Error al obtener portafolio:', error);
      throw new Error('Error al cargar el portafolio');
    }
  }

  /**
   * Liquida todas las posiciones del trader
   * Requiere validación de contraseña previa
   * 
   * @param id_user - ID del trader
   * @param user_alias - Alias del trader (para auditoría)
   * @param password - Contraseña del trader para confirmación
   * @returns Resultado de la liquidación con resumen completo
   */
  async liquidarTodo(
    id_user: number,
    user_alias: string,
    password: string
  ) {
    try {
      // 1. Validar contraseña del usuario
      const user = await this.userRepository.findOne({
        where: { id_user },
        select: ['id_user', 'password']
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const passwordValida = await bcrypt.compare(password, user.password);

      if (!passwordValida) {
        throw new Error('Contraseña incorrecta. No se puede proceder con la liquidación.');
      }

      // 2. Ejecutar el Stored Procedure de liquidación
      const result = await AppDataSource.query(
        `DECLARE @mensaje NVARCHAR(1000), @exito BIT;
         EXEC usp_LiquidarTodoTrader 
           @id_user = @0, 
           @user_alias = @1,
           @mensaje_resultado = @mensaje OUTPUT,
           @exito = @exito OUTPUT;
         SELECT @mensaje AS mensaje, @exito AS exito;`,
        [id_user, user_alias]
      );

      const { mensaje, exito } = result[0];

      if (!exito) {
        throw new Error(mensaje);
      }

      return {
        exito: true,
        mensaje
      };

    } catch (error: any) {
      console.error('Error en liquidación total:', error);
      throw new Error(error.message || 'Error al liquidar el portafolio');
    }
  }
}
