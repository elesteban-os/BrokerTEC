import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { Posicion } from '../../../entities/posicion.entity';
import { Wallet } from '../../../entities/wallet.entity';
import { Repository } from 'typeorm';

/**
 * Servicio para generar reportes administrativos
 * Solo accesible por usuarios con rol ADMINISTRADOR
 */
export class ReportesService {
  private userRepository: Repository<User>;
  private posicionRepository: Repository<Posicion>;
  private walletRepository: Repository<Wallet>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.posicionRepository = AppDataSource.getRepository(Posicion);
    this.walletRepository = AppDataSource.getRepository(Wallet);
  }

  /**
   * Obtiene el top de traders ordenados por sus ganancias/pérdidas totales
   * 
   * @param limit - Número máximo de traders a retornar (por defecto 10)
   * @returns Lista de traders con sus estadísticas de trading
   */
  async getTopTraders(limit: number = 10) {
    try {
      // Obtener todos los traders activos con sus wallets usando QueryBuilder
      // (más confiable para relaciones OneToOne inversas)
      const traders = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.posiciones', 'posiciones')
        .leftJoinAndSelect('posiciones.empresa', 'empresa')
        .leftJoin('wallets', 'wallet', 'wallet.id_user = user.id_user')
        .addSelect([
          'wallet.id_wallet',
          'wallet.categoria',
          'wallet.saldo',
          'wallet.limite_diario'
        ])
        .where('user.id_role = :roleId', { roleId: 3 })
        .andWhere('user.status = :status', { status: true })
        .getMany();

      // Cargar los wallets manualmente para cada trader
      const tradersWithWallets = await Promise.all(
        traders.map(async (trader) => {
          const wallet = await this.walletRepository.findOne({
            where: { id_user: trader.id_user }
          });
          return { ...trader, wallet };
        })
      );

      // Calcular ganancias/pérdidas para cada trader
      const tradersConEstadisticas = tradersWithWallets.map(trader => {
        const wallet = trader.wallet;
        
        if (!wallet) {
          return {
            id_user: trader.id_user,
            alias: trader.alias,
            nombre: trader.nombre,
            apellido: trader.apellido1,
            categoria: 'N/A',
            saldo_disponible: 0,
            valor_posiciones: 0,
            ganancia_perdida_total: 0,
            numero_posiciones: 0,
            posiciones: []
          };
        }

        // Calcular valor actual y ganancias/pérdidas de todas las posiciones
        let valorTotalPosiciones = 0;
        let gananciasPerdidas = 0;
        const posiciones = trader.posiciones || [];

        posiciones.forEach((posicion: Posicion) => {
          // Valor invertido originalmente
          const valorInvertido = posicion.cantidad * posicion.costo_promedio;
          
          // Valor actual al precio de mercado
          const valorActual = posicion.cantidad * (posicion.empresa?.precio_actual || 0);
          
          valorTotalPosiciones += valorActual;
          gananciasPerdidas += (valorActual - valorInvertido);
        });

        return {
          id_user: trader.id_user,
          alias: trader.alias,
          nombre: trader.nombre,
          apellido: trader.apellido1,
          categoria: wallet.categoria,
          saldo_disponible: wallet.saldo,
          valor_posiciones: Number(valorTotalPosiciones.toFixed(2)),
          ganancia_perdida_total: Number(gananciasPerdidas.toFixed(2)),
          numero_posiciones: posiciones.length,
          posiciones: posiciones.map((p: Posicion) => ({
            empresa: p.empresa?.nombre || 'N/A',
            cantidad: p.cantidad,
            costo_promedio: p.costo_promedio,
            precio_actual: p.empresa?.precio_actual || 0,
            ganancia_perdida: Number(
              ((p.cantidad * (p.empresa?.precio_actual || 0)) - 
               (p.cantidad * p.costo_promedio)).toFixed(2)
            )
          }))
        };
      });

      // Ordenar por ganancias/pérdidas totales (de mayor a menor)
      const tradersOrdenados = tradersConEstadisticas
        .sort((a, b) => b.ganancia_perdida_total - a.ganancia_perdida_total)
        .slice(0, limit);

      return {
        total_traders: tradersConEstadisticas.length,
        top_traders: tradersOrdenados,
        fecha_consulta: new Date()
      };

    } catch (error) {
      console.error('Error al obtener top traders:', error);
      throw new Error('Error al generar reporte de top traders');
    }
  }

  /**
   * Obtiene estadísticas generales del sistema
   * 
   * @returns Resumen de estadísticas clave del sistema
   */
  async getEstadisticasGenerales() {
    try {
      // Total de traders activos
      const totalTradersActivos = await this.userRepository.count({
        where: { id_role: 3, status: true }
      });

      // Total de traders inactivos
      const totalTradersInactivos = await this.userRepository.count({
        where: { id_role: 3, status: false }
      });

      // Total de posiciones abiertas
      const totalPosicionesAbiertas = await this.posicionRepository.count();

      // Suma total de saldos en todas las wallets
      const wallets = await this.walletRepository.find();
      const saldoTotalSistema = wallets.reduce((sum, wallet) => sum + wallet.saldo, 0);

      // Calcular valor total invertido y valor actual del mercado
      const posiciones = await this.posicionRepository.find({
        relations: ['empresa']
      });

      let valorTotalInvertido = 0;
      let valorTotalActual = 0;

      posiciones.forEach(posicion => {
        valorTotalInvertido += posicion.cantidad * posicion.costo_promedio;
        valorTotalActual += posicion.cantidad * (posicion.empresa?.precio_actual || 0);
      });

      const gananciaPerdidasistema = valorTotalActual - valorTotalInvertido;

      return {
        traders: {
          activos: totalTradersActivos,
          inactivos: totalTradersInactivos,
          total: totalTradersActivos + totalTradersInactivos
        },
        mercado: {
          posiciones_abiertas: totalPosicionesAbiertas,
          valor_invertido: Number(valorTotalInvertido.toFixed(2)),
          valor_actual: Number(valorTotalActual.toFixed(2)),
          ganancia_perdida_total: Number(gananciaPerdidasistema.toFixed(2))
        },
        wallets: {
          saldo_total_sistema: Number(saldoTotalSistema.toFixed(2)),
          numero_wallets: wallets.length
        },
        fecha_consulta: new Date()
      };

    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw new Error('Error al generar estadísticas generales del sistema');
    }
  }
}
