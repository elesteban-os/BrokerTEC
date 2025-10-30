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
   */
  async getWallet(id_user: number) {
    try {
      const wallet = await this.walletRepository.findOne({ where: { id_user } });
      if (!wallet)
        throw new Error('Wallet no encontrado. Contacta al administrador para crear tu wallet.');

      const hoy = new Date().toISOString().split('T')[0];
      let fechaUltimaRecargaStr = wallet.fecha_ultima_recarga
        ? new Date(wallet.fecha_ultima_recarga).toISOString().split('T')[0]
        : '';

      let consumoDiaActual = wallet.consumo_dia;
      if (fechaUltimaRecargaStr !== hoy && fechaUltimaRecargaStr !== '') {
        consumoDiaActual = 0;
      }

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
   */
  async recargarWallet(id_user: number, monto: number, alias: string) {
    try {
      // NOTA: Se usa query raw para evitar problemas de concurrencia
      const result = await AppDataSource.query(
        `
        DECLARE @consumo_actual DECIMAL(15,2);
        DECLARE @fecha_ultima_recarga DATE;
        DECLARE @hoy DATE = CAST(GETDATE() AS DATE);
        DECLARE @saldo_anterior DECIMAL(15,2);
        DECLARE @limite DECIMAL(15,2);
        
        -- Obtener datos actuales
        SELECT 
          @consumo_actual = consumo_dia,
          @fecha_ultima_recarga = CAST(fecha_ultima_recarga AS DATE),
          @saldo_anterior = saldo,
          @limite = limite_diario
        FROM wallets
        WHERE id_user = @0;
        
        -- Si es un nuevo día, resetear consumo
        IF @fecha_ultima_recarga IS NULL OR @fecha_ultima_recarga < @hoy
        BEGIN
          SET @consumo_actual = 0;
        END
        
        -- Calcular disponible
        DECLARE @disponible DECIMAL(15,2) = @limite - @consumo_actual;
        
        -- Validar límite
        IF @1 > @disponible
        BEGIN
          SELECT 
            0 AS exito,
            @limite AS limite_diario,
            @consumo_actual AS consumo_dia,
            @disponible AS disponible_hoy,
            'LIMITE_EXCEDIDO' AS error;
          RETURN;
        END
        
        -- Aplicar recarga
        UPDATE wallets
        SET 
          saldo = saldo + @1,
          consumo_dia = @consumo_actual + @1,
          fecha_ultima_recarga = GETDATE()
        WHERE id_user = @0;
        
        -- Retornar resultado
        SELECT 
          1 AS exito,
          saldo AS saldo,
          categoria,
          limite_diario,
          consumo_dia,
          (limite_diario - consumo_dia) AS disponible_hoy,
          fecha_ultima_recarga,
          @saldo_anterior AS saldo_anterior,
          id_wallet
        FROM wallets
        WHERE id_user = @0;
        `,
        [id_user, monto]
      );

      const data = result[0];

      // Validar si excedió el límite
      if (data.exito === 0) {
        throw new Error(
          `No puedes recargar $${monto.toFixed(2)}. ` +
            `Tu límite diario es $${data.limite_diario.toFixed(2)} ` +
            `y ya has recargado $${data.consumo_dia.toFixed(2)} hoy. ` +
            `Disponible: $${data.disponible_hoy.toFixed(2)}`
        );
      }

      // Registrar en auditoría
      await this.auditoriaService.registrar({
        id_user,
        user_alias: alias,
        accion: TipoAccionAuditoria.RECARGA_WALLET,
        entidad_afectada: EntidadAfectada.WALLET,
        id_registro_afectado: data.id_wallet,
        monto_operacion: monto,
        saldo_anterior: data.saldo_anterior,
        saldo_nuevo: data.saldo,
        descripcion: `Recarga de wallet por $${monto.toFixed(2)}. Categoría: ${data.categoria}`,
        exitosa: true
      });

      return {
        id_wallet: data.id_wallet,
        saldo: data.saldo,
        categoria: data.categoria,
        limite_diario: data.limite_diario,
        consumo_dia: data.consumo_dia,
        disponible_hoy: Math.max(0, data.disponible_hoy),
        fecha_ultima_recarga: data.fecha_ultima_recarga
      };
    } catch (error) {
      console.error('Error al recargar wallet:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de recargas desde la tabla de auditoría
   */
  async getHistorialRecargas(id_user: number) {
    try {
      const query = `
        SELECT 
          id_auditoria AS id,
          fecha_hora AS fecha,
          monto_operacion AS monto,
          descripcion,
          exitosa
        FROM auditoria
        WHERE id_user = @0
          AND accion = 'RECARGA_WALLET'
        ORDER BY fecha_hora DESC
      `;

      const historial = await AppDataSource.query(query, [id_user]);

      return historial.map((r: any) => ({
        id: r.id,
        fecha: new Date(r.fecha).toLocaleString('es-CR'),
        monto: parseFloat(r.monto),
        descripcion: r.descripcion,
        estado: r.exitosa ? 'completado' : 'fallido'
      }));
    } catch (error) {
      console.error('Error al obtener historial de recargas:', error);
      throw error;
    }
  }
}
