import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { Wallet } from '../../../entities/wallet.entity';
import { Role } from '../../../entities/role.entity';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';
import { ChangeCategoryDto } from '../DTOs/change-category.dto';
import { DisableTraderDto } from '../DTOs/disable-trader.dto';

/**
 * Límites diarios de recarga según categoría
 */
const LIMITES_POR_CATEGORIA = {
  JUNIOR: 5000,    // $5,000 USD diarios
  MID: 10000,      // $10,000 USD diarios
  SENIOR: 50000    // $50,000 USD diarios
};

/**
 * Service para gestión de traders por parte del administrador
 * - Listar traders
 * - Cambiar categoría de wallet
 * - Deshabilitar trader (con liquidación automática de posiciones)
 */
export class TraderManagementService {
  private userRepository: Repository<User>;
  private walletRepository: Repository<Wallet>;
  private roleRepository: Repository<Role>;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.walletRepository = AppDataSource.getRepository(Wallet);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Listar todos los traders con su información de wallet y posiciones
   */
  async listTraders(filtros?: { status?: boolean; categoria?: string }): Promise<any[]> {
    // Obtener el rol TRADER
    const rolTrader = await this.roleRepository.findOne({
      where: { role_name: 'TRADER' }
    });

    if (!rolTrader) {
      throw new Error('Rol TRADER no encontrado');
    }

    // Query builder para obtener traders con sus wallets
    const query = this.userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.wallet', 'w')
      .leftJoinAndSelect('u.posiciones', 'p')
      .leftJoinAndSelect('p.empresa', 'e')
      .where('u.id_role = :roleId', { roleId: rolTrader.id_role });

    // Aplicar filtros opcionales
    if (filtros?.status !== undefined) {
      query.andWhere('u.status = :status', { status: filtros.status });
    }

    if (filtros?.categoria) {
      query.andWhere('w.categoria = :categoria', { categoria: filtros.categoria });
    }

    query.orderBy('u.alias', 'ASC');

    const traders = await query.getMany();

    // Formatear respuesta
    return traders.map(trader => ({
      id_user: trader.id_user,
      alias: trader.alias,
      email: trader.email,
      nombre_completo: `${trader.nombre} ${trader.apellido1} ${trader.apellido2 || ''}`.trim(),
      status: trader.status,
      wallet: trader.wallet ? {
        id_wallet: trader.wallet.id_wallet,
        saldo: trader.wallet.saldo,
        categoria: trader.wallet.categoria,
        limite_diario: trader.wallet.limite_diario,
        consumo_dia: trader.wallet.consumo_dia,
        fecha_ultima_recarga: trader.wallet.fecha_ultima_recarga
      } : null,
      posiciones: trader.posiciones?.map(p => ({
        id_posicion: p.id_posicion,
        empresa: p.empresa.nombre,
        cantidad: p.cantidad,
        costo_promedio: p.costo_promedio,
        precio_actual: p.empresa.precio_actual,
        ganancia_perdida: (p.empresa.precio_actual - p.costo_promedio) * p.cantidad
      })) || [],
      total_invertido: trader.posiciones?.reduce((sum, p) => sum + (p.cantidad * p.costo_promedio), 0) || 0,
      valor_actual_portafolio: trader.posiciones?.reduce((sum, p) => sum + (p.cantidad * p.empresa.precio_actual), 0) || 0
    }));
  }

  /**
   * Obtener detalle de un trader específico
   */
  async getTraderDetail(id_user: number): Promise<any> {
    const trader = await this.userRepository.findOne({
      where: { id_user },
      relations: ['role', 'wallet', 'posiciones', 'posiciones.empresa']
    });

    if (!trader) {
      throw new Error('Trader no encontrado');
    }

    if (trader.role.role_name !== 'TRADER') {
      throw new Error('El usuario no es un trader');
    }

    return {
      id_user: trader.id_user,
      alias: trader.alias,
      email: trader.email,
      nombre_completo: `${trader.nombre} ${trader.apellido1} ${trader.apellido2 || ''}`.trim(),
      country_origin: trader.country_origin,
      status: trader.status,
      wallet: trader.wallet ? {
        id_wallet: trader.wallet.id_wallet,
        saldo: trader.wallet.saldo,
        categoria: trader.wallet.categoria,
        limite_diario: trader.wallet.limite_diario,
        consumo_dia: trader.wallet.consumo_dia,
        fecha_ultima_recarga: trader.wallet.fecha_ultima_recarga,
        fecha_creacion: trader.wallet.fecha_creacion
      } : null,
      posiciones: trader.posiciones?.map(p => ({
        id_posicion: p.id_posicion,
        empresa: {
          id_empresa: p.empresa.id_empresa,
          nombre: p.empresa.nombre,
          precio_actual: p.empresa.precio_actual
        },
        cantidad: p.cantidad,
        costo_promedio: p.costo_promedio,
        fecha_creacion: p.fecha_creacion,
        ganancia_perdida: (p.empresa.precio_actual - p.costo_promedio) * p.cantidad,
        porcentaje_ganancia: ((p.empresa.precio_actual - p.costo_promedio) / p.costo_promedio * 100).toFixed(2)
      })) || []
    };
  }

  /**
   * Cambiar categoría de wallet de un trader
   * Actualiza el límite diario según la nueva categoría
   */
  async changeCategory(
    id_user: number,
    dto: ChangeCategoryDto,
    adminId: number,
    adminAlias: string,
    adminRole: string
  ): Promise<{ wallet: Wallet; categoria_anterior: string }> {
    // Validar que el trader existe y tiene wallet
    const trader = await this.userRepository.findOne({
      where: { id_user },
      relations: ['role', 'wallet']
    });

    if (!trader) {
      throw new Error('Trader no encontrado');
    }

    if (trader.role.role_name !== 'TRADER') {
      throw new Error('El usuario no es un trader');
    }

    if (!trader.wallet) {
      throw new Error('El trader no tiene wallet asociado');
    }

    const categoria_anterior = trader.wallet.categoria;

    // No hacer nada si ya tiene esa categoría
    if (categoria_anterior === dto.nueva_categoria) {
      throw new Error(`El trader ya tiene la categoría ${dto.nueva_categoria}`);
    }

    // Actualizar categoría y límite diario
    trader.wallet.categoria = dto.nueva_categoria;
    trader.wallet.limite_diario = LIMITES_POR_CATEGORIA[dto.nueva_categoria];

    await this.walletRepository.save(trader.wallet);

    // Registrar en auditoría
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.CAMBIO_CATEGORIA,
      entidad_afectada: EntidadAfectada.WALLET,
      id_registro_afectado: trader.wallet.id_wallet,
      descripcion: JSON.stringify({
        trader_id: id_user,
        trader_alias: trader.alias,
        categoria_anterior,
        categoria_nueva: dto.nueva_categoria,
        limite_anterior: LIMITES_POR_CATEGORIA[categoria_anterior as keyof typeof LIMITES_POR_CATEGORIA],
        limite_nuevo: LIMITES_POR_CATEGORIA[dto.nueva_categoria]
      }),
      exitosa: true
    });

    return { wallet: trader.wallet, categoria_anterior };
  }

  /**
   * Deshabilitar un trader
   * Ejecuta el SP que liquida todas sus posiciones y actualiza su wallet
   */
  async disableTrader(
    id_user: number,
    dto: DisableTraderDto,
    adminId: number,
    adminAlias: string,
    adminRole: string
  ): Promise<{ mensaje: string; posiciones_liquidadas: number; monto_liquidado: number }> {
    // Validar que el trader existe
    const trader = await this.userRepository.findOne({
      where: { id_user },
      relations: ['role']
    });

    if (!trader) {
      throw new Error('Trader no encontrado');
    }

    if (trader.role.role_name !== 'TRADER') {
      throw new Error('El usuario no es un trader');
    }

    if (!trader.status) {
      throw new Error('El trader ya está deshabilitado');
    }

    // Ejecutar el stored procedure para deshabilitar
    const result = await AppDataSource.query(
      `EXEC usp_DisableTrader 
        @id_trader = @0,
        @justificacion = @1,
        @id_admin = @2,
        @admin_alias = @3,
        @admin_role = @4`,
      [
        id_user,
        dto.justificacion,
        adminId,
        adminAlias,
        adminRole
      ]
    );

    // El SP retorna: posiciones_liquidadas, monto_total_liquidado
    const posiciones_liquidadas = result[0]?.posiciones_liquidadas || 0;
    const monto_liquidado = result[0]?.monto_total_liquidado || 0;

    return {
      mensaje: `Trader deshabilitado exitosamente. Se liquidaron ${posiciones_liquidadas} posiciones por un total de $${monto_liquidado}`,
      posiciones_liquidadas,
      monto_liquidado
    };
  }
}
