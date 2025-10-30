// Servicio para deshabilitación de la cuenta del usuario autenticado
// Implementa SOFT DELETE (deshabilitar): status = 0, conserva datos históricos
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

export class DeleteUserService {
  private userRepository: Repository<User>;
  private auditoria: AuditoriaService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.auditoria = new AuditoriaService();
  }

  /**
   * Deshabilita la cuenta del propio usuario (SOFT DELETE)
   * - Verifica la contraseña antes de proceder
   * - Si es TRADER: liquida automáticamente todas las posiciones (vende todo) y deshabilita
   * - Si es ADMIN/ANALISTA: solo deshabilita (status = 0), sin liquidación
   * - Conserva todos los datos históricos y auditorías para integridad referencial
   * 
   * IMPORTANTE: Este método NO elimina físicamente al usuario de la base de datos.
   * Solo lo deshabilita (status = 0), lo que impide su acceso al sistema pero 
   * mantiene su historial de operaciones y auditorías.
   */
  async deleteMyAccount(userId: number, password: string) {
    const user = await this.userRepository.findOne({ 
      where: { id_user: userId }, 
      relations: ['role', 'wallet'] 
    });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Validar contraseña
    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      await this.auditoria.registrar({
        id_user: user.id_user,
        user_alias: user.alias,
        user_role: user.role?.role_name || 'UNKNOWN',
        accion: TipoAccionAuditoria.USER_DELETE,
        entidad_afectada: EntidadAfectada.USUARIOS,
        descripcion: 'Intento fallido de deshabilitación: contraseña incorrecta',
        requiere_confirmacion: true,
        exitosa: false,
        mensaje_error: 'Contraseña incorrecta'
      });
      throw new Error('Contraseña incorrecta. Por favor verifica e intenta nuevamente.');
    }

    const roleName = user.role?.role_name || 'UNKNOWN';

    // Verificar si ya está deshabilitado
    if (user.status === false) {
      throw new Error('Tu cuenta ya está deshabilitada. Contacta al administrador si necesitas reactivarla.');
    }

    // Validación especial: no permitir deshabilitar el único admin activo
    if (roleName === 'ADMINISTRADOR') {
      const adminCount = await this.userRepository.count({
        where: { id_role: 1, status: true }
      });
      
      if (adminCount <= 1) {
        throw new Error('No puedes deshabilitar tu cuenta porque eres el único administrador activo del sistema.');
      }
    }

    // ========================================
    // CASO 1: TRADER - Liquidar posiciones automáticamente y deshabilitar
    // ========================================
    if (roleName === 'TRADER') {
      try {
        // El SP usp_DisableTrader hace automáticamente:
        // 1. Vende TODAS las posiciones activas al precio actual de mercado
        // 2. Devuelve el dinero al wallet del trader
        // 3. Registra cada venta en auditoría con ganancia/pérdida
        // 4. Deshabilita al trader (status = 0)
        // 5. Retorna un resumen de la liquidación
        
        const result = await AppDataSource.query(
          `EXEC usp_DisableTrader 
            @id_trader = @0, 
            @justificacion = @1,
            @id_admin = @2,
            @admin_alias = @3,
            @admin_role = @4`,
          [
            userId,
            'Deshabilitación voluntaria: El trader solicitó la deshabilitación de su propia cuenta',
            userId, // El mismo trader ejecuta su propia deshabilitación
            user.alias,
            roleName
          ]
        );

        // El SP retorna información sobre las posiciones liquidadas
        const posicionesLiquidadas = result[0]?.posiciones_liquidadas || 0;
        const montoLiquidado = result[0]?.monto_total_liquidado || 0;

        let mensaje = 'Cuenta deshabilitada correctamente.';
        
        if (posicionesLiquidadas > 0) {
          mensaje += ` Se liquidaron ${posicionesLiquidadas} posiciones por un total de $${montoLiquidado.toFixed(2)}. El dinero ha sido depositado en tu wallet.`;
        } else {
          mensaje += ' No tenías posiciones activas.';
        }

        return { 
          success: true, 
          message: mensaje,
          tipo: 'TRADER',
          posiciones_liquidadas: posicionesLiquidadas,
          monto_liquidado: montoLiquidado
        };

      } catch (error: any) {
        console.error('Error al deshabilitar trader:', error);
        
        // Registrar error en auditoría
        await this.auditoria.registrar({
          id_user: user.id_user,
          user_alias: user.alias,
          user_role: roleName,
          accion: TipoAccionAuditoria.USER_DELETE,
          entidad_afectada: EntidadAfectada.USUARIOS,
          descripcion: 'Error al intentar deshabilitar trader y liquidar posiciones',
          requiere_confirmacion: true,
          exitosa: false,
          mensaje_error: error.message
        });
        
        throw new Error('No se pudo deshabilitar la cuenta: ' + error.message);
      }
    }

    // ========================================
    // CASO 2: ADMINISTRADOR o ANALISTA - Solo deshabilitar (sin liquidación)
    // ========================================
    else {
      try {
        // Los administradores y analistas NO tienen posiciones ni wallets
        // Simplemente se deshabilita su acceso al sistema (status = 0)
        // Conservando todo su historial de auditorías y acciones realizadas
        
        user.status = false;
        await this.userRepository.save(user);

        // Registrar en auditoría
        await this.auditoria.registrar({
          id_user: user.id_user,
          user_alias: user.alias,
          user_role: roleName,
          accion: TipoAccionAuditoria.USER_DELETE,
          entidad_afectada: EntidadAfectada.USUARIOS,
          id_registro_afectado: user.id_user,
          descripcion: `Deshabilitación voluntaria: Usuario ${roleName} "${user.alias}" deshabilitó su propia cuenta (soft delete). Se conserva todo el historial.`,
          requiere_confirmacion: true,
          exitosa: true
        });

        return { 
          success: true, 
          message: `Cuenta deshabilitada correctamente. Ya no podrás acceder al sistema. Tu historial de acciones como ${roleName} se ha conservado.`,
          tipo: roleName
        };

      } catch (error: any) {
        console.error('Error al deshabilitar cuenta:', error);
        
        // Registrar error en auditoría
        await this.auditoria.registrar({
          id_user: user.id_user,
          user_alias: user.alias,
          user_role: roleName,
          accion: TipoAccionAuditoria.USER_DELETE,
          entidad_afectada: EntidadAfectada.USUARIOS,
          id_registro_afectado: user.id_user,
          descripcion: 'Error al intentar deshabilitar cuenta',
          requiere_confirmacion: true,
          exitosa: false,
          mensaje_error: error.message
        });
        
        throw new Error('No se pudo deshabilitar la cuenta: ' + error.message);
      }
    }
  }
}
