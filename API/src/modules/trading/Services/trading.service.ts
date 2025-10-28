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
   */
  async getPortada() {
    try {
      const mercados = await this.mercadoRepository.find({
        where: { habilitado: true },
        order: { nombre: 'ASC' }
      });

      const portada = await Promise.all(
        mercados.map(async (mercado) => {
          const empresas = await this.empresaRepository.find({
            where: {
              id_mercado: mercado.id_mercado,
              habilitado: true
            },
            order: { precio_actual: 'DESC' }
          });

          const empresasConCapitalizacion = empresas
            .map(empresa => ({
              id_empresa: empresa.id_empresa,
              nombre: empresa.nombre,
              precio_actual: empresa.precio_actual,
              cantidad_acciones: empresa.cantidad_acciones,
              capitalizacion: empresa.precio_actual * empresa.cantidad_acciones
            }))
            .sort((a, b) => b.capitalizacion - a.capitalizacion)
            .slice(0, 10);

          return {
            id_mercado: mercado.id_mercado,
            nombre_mercado: mercado.nombre,
            cantidad_empresas: empresasConCapitalizacion.length,
            top_empresas: empresasConCapitalizacion
          };
        })
      );

      return portada.filter(m => m.cantidad_empresas > 0);

    } catch (error) {
      console.error('Error al obtener portada:', error);
      throw new Error('Error al cargar la portada');
    }
  }

  /**
   * Obtiene el detalle completo de una empresa (con histórico de precios)
   */
  async getDetalleEmpresa(id_empresa: number, dias: number = 30) {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id_empresa },
        relations: ['mercado']
      });

      if (!empresa) throw new Error('Empresa no encontrada');
      if (!empresa.habilitado) throw new Error('Esta empresa está deshabilitada y no se puede consultar');

      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);

      const historicoPrecio = await this.precioHistoricoRepository.find({
        where: { id_empresa },
        order: { fecha_hora: 'DESC' },
        take: dias
      });

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
   * 🔹 NUEVO MÉTODO:
   * Obtiene la posición actual del trader en una empresa
   * Si no tiene, devuelve null
   */
  async getPosicionTrader(id_user: number, id_empresa: number) {
    try {
      const posicion = await this.posicionRepository.findOne({
        where: { id_user, id_empresa },
        relations: ['empresa']
      });

      if (!posicion) {
        return null;
      }

      return {
        id_posicion: posicion.id_posicion,
        id_user: posicion.id_user,
        id_empresa: posicion.id_empresa,
        cantidad: posicion.cantidad,
        costo_promedio: Number(posicion.costo_promedio),
        fecha_creacion: posicion.fecha_creacion,
        fecha_actualizacion: posicion.fecha_actualizacion,
        empresa: {
          id_empresa: posicion.empresa.id_empresa,
          nombre: posicion.empresa.nombre,
          precio_actual: posicion.empresa.precio_actual
        }
      };
    } catch (error: any) {
      console.error('❌ Error en TradingService.getPosicionTrader:', error);
      throw new Error('Error al obtener posición del trader: ' + error.message);
    }
  }

  /**
   * Compra acciones (SP: usp_ComprarAcciones)
   */
  async comprarAcciones(
    id_user: number,
    user_alias: string,
    id_empresa: number,
    cantidad: number
  ) {
    try {
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
      if (!exito) throw new Error(mensaje);

      return { exito: true, mensaje };
    } catch (error: any) {
      console.error('Error en compra de acciones:', error);
      throw new Error(error.message || 'Error al realizar la compra');
    }
  }

  /**
   * Vende acciones (SP: usp_VenderAcciones)
   */
  async venderAcciones(
    id_user: number,
    user_alias: string,
    id_empresa: number,
    cantidad: number
  ) {
    try {
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
      if (!exito) throw new Error(mensaje);

      return { exito: true, mensaje };
    } catch (error: any) {
      console.error('Error en venta de acciones:', error);
      throw new Error(error.message || 'Error al realizar la venta');
    }
  }

  /**
   * Obtiene el portafolio completo del trader
   */
  async getPortafolio(id_user: number) {
    try {
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
            ticker: posicion.empresa.nombre
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

      const resumen = posicionesDetalladas.reduce(
        (acc, pos) => ({
          total_posiciones: acc.total_posiciones + 1,
          total_invertido: acc.total_invertido + pos.valor_invertido,
          valor_actual_total: acc.valor_actual_total + pos.valor_actual_total,
          ganancia_perdida_total: acc.ganancia_perdida_total + pos.ganancia_perdida,
          porcentaje_ganancia_perdida: 0
        }),
        {
          total_posiciones: 0,
          total_invertido: 0,
          valor_actual_total: 0,
          ganancia_perdida_total: 0,
          porcentaje_ganancia_perdida: 0
        }
      );

      if (resumen.total_invertido > 0) {
        resumen.porcentaje_ganancia_perdida = Number(
          ((resumen.ganancia_perdida_total / resumen.total_invertido) * 100).toFixed(2)
        );
      }

      return { posiciones: posicionesDetalladas, resumen };
    } catch (error: any) {
      console.error('Error al obtener portafolio:', error);
      throw new Error('Error al cargar el portafolio');
    }
  }

  /**
   * Liquida todas las posiciones del trader (SP: usp_LiquidarTodoTrader)
   */
  async liquidarTodo(
    id_user: number,
    user_alias: string,
    password: string
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { id_user },
        select: ['id_user', 'password']
      });

      if (!user) throw new Error('Usuario no encontrado');

      const passwordValida = await bcrypt.compare(password, user.password);
      if (!passwordValida) throw new Error('Contraseña incorrecta. No se puede proceder con la liquidación.');

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
      if (!exito) throw new Error(mensaje);

      return { exito: true, mensaje };
    } catch (error: any) {
      console.error('Error en liquidación total:', error);
      throw new Error(error.message || 'Error al liquidar el portafolio');
    }
  }
}
