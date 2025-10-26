import { AppDataSource } from '../../../config/data-source';
import { Wallet } from '../../../entities/wallet.entity';
import { Repository } from 'typeorm';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

/**
 * Límites diarios de recarga por categoría de wallet (en USD)
 */
const LIMITES_CATEGORIA = {
  JUNIOR: 5000,
  MID: 10000,
  SENIOR: 50000
};

/**
 * Servicio para gestionar el wallet de traders
 * Solo accesible por usuarios con rol TRADER
 */
export class WalletService {
  private walletRepository: Repository<Wallet>;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.walletRepository = AppDataSource.getRepository(Wallet);
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Obtiene la información completa del wallet de un trader
   * 
   * @param id_user - ID del trader
   * @returns Información del wallet con saldo, categoría, límites y disponible hoy
   */
  async getWallet(id_user: number) {
    try {
      // Buscar el wallet del trader
      const wallet = await this.walletRepository.findOne({
        where: { id_user }
      });

      if (!wallet) {
        throw new Error('Wallet no encontrado. Contacta al administrador para crear tu wallet.');
      }

      // Verificar si es un día diferente comparando solo la fecha (YYYY-MM-DD)
      const hoy = new Date().toISOString().split('T')[0]; // '2025-10-25'
      let fechaUltimaRecargaStr = '';
      
      if (wallet.fecha_ultima_recarga) {
        const fecha = new Date(wallet.fecha_ultima_recarga);
        fechaUltimaRecargaStr = fecha.toISOString().split('T')[0]; // '2025-10-25'
      }

      // Si la última recarga fue en otro día, el consumo_dia debería ser 0
      let consumoDiaActual = wallet.consumo_dia;
      if (fechaUltimaRecargaStr !== hoy && fechaUltimaRecargaStr !== '') {
        consumoDiaActual = 0;
      }

      // Calcular cuánto puede recargar hoy
      const disponibleHoy = wallet.limite_diario - consumoDiaActual;

      return {
        id_wallet: wallet.id_wallet,
        saldo: wallet.saldo,
        categoria: wallet.categoria,
        limite_diario: wallet.limite_diario,
        consumo_dia: consumoDiaActual,
        disponible_hoy: Math.max(0, disponibleHoy),
        fecha_ultima_recarga: wallet.fecha_ultima_recarga,
        fecha_creacion: wallet.fecha_creacion
      };

    } catch (error) {
      console.error('Error al obtener wallet:', error);
      throw error;
    }
  }

  /**
   * Recarga el wallet de un trader validando límites diarios
   * 
   * @param id_user - ID del trader que recarga
   * @param monto - Monto a recargar (debe ser > 0)
   * @param alias - Alias del trader (para auditoría)
   * @returns Wallet actualizado
   */
  async recargarWallet(id_user: number, monto: number, alias: string) {
    try {
      // Buscar el wallet del trader
      const wallet = await this.walletRepository.findOne({
        where: { id_user }
      });

      if (!wallet) {
        throw new Error('Wallet no encontrado. Contacta al administrador para crear tu wallet.');
      }

      // Verificar si es un día diferente comparando solo la fecha (YYYY-MM-DD)
      const hoy = new Date().toISOString().split('T')[0]; // '2025-10-25'
      let fechaUltimaRecargaStr = '';
      
      if (wallet.fecha_ultima_recarga) {
        const fecha = new Date(wallet.fecha_ultima_recarga);
        fechaUltimaRecargaStr = fecha.toISOString().split('T')[0]; // '2025-10-25'
      }

      // Si la última recarga fue en otro día (o es la primera recarga), resetear consumo_dia
      if (fechaUltimaRecargaStr !== hoy) {
        wallet.consumo_dia = 0;
      }

      // Calcular cuánto puede recargar hoy (DESPUÉS del posible reset)
      const disponibleHoy = wallet.limite_diario - wallet.consumo_dia;

      // Validar que no exceda el límite diario
      if (monto > disponibleHoy) {
        throw new Error(
          `No puedes recargar $${monto.toFixed(2)}. ` +
          `Tu límite diario es $${wallet.limite_diario.toFixed(2)} ` +
          `y ya has recargado $${wallet.consumo_dia.toFixed(2)} hoy. ` +
          `Disponible: $${disponibleHoy.toFixed(2)}`
        );
      }

      // Guardar saldo anterior para auditoría (antes de modificar)
      const saldoAnterior = wallet.saldo;

      // Realizar la recarga
      wallet.saldo += monto;
      wallet.consumo_dia += monto;
      wallet.fecha_ultima_recarga = new Date();

      // Guardar cambios
      await this.walletRepository.save(wallet);

      // Registrar auditoría
      await this.auditoriaService.registrar({
        id_user: id_user,
        user_alias: alias,
        accion: TipoAccionAuditoria.RECARGA_WALLET,
        entidad_afectada: EntidadAfectada.WALLET,
        id_registro_afectado: wallet.id_wallet,
        monto_operacion: monto,
        saldo_anterior: saldoAnterior,
        saldo_nuevo: wallet.saldo,
        descripcion: `Recarga de wallet por $${monto.toFixed(2)}. Categoría: ${wallet.categoria}`,
        exitosa: true
      });

      return {
        id_wallet: wallet.id_wallet,
        saldo: wallet.saldo,
        categoria: wallet.categoria,
        limite_diario: wallet.limite_diario,
        consumo_dia: wallet.consumo_dia,
        disponible_hoy: Math.max(0, wallet.limite_diario - wallet.consumo_dia),
        fecha_ultima_recarga: wallet.fecha_ultima_recarga
      };

    } catch (error) {
      console.error('Error al recargar wallet:', error);
      throw error;
    }
  }
}
