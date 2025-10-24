// Servicio para eliminación de la cuenta del usuario autenticado
// Implementa HARD DELETE (borrado físico): elimina teléfonos y luego el usuario
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
   * Elimina la cuenta del propio usuario (HARD DELETE)
   * - Verifica la contraseña
   * - Borra teléfonos asociados y luego el usuario (transacción)
   */
  async deleteMyAccount(userId: number, password: string) {
    const user = await this.userRepository.findOne({ where: { id_user: userId }, relations: ['role'] });
    if (!user) throw new Error('USER_NOT_FOUND');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      await this.auditoria.registrar({
        id_user: user.id_user,
        user_alias: user.alias,
        user_role: user.role?.role_name || 'UNKNOWN',
        accion: TipoAccionAuditoria.USER_DELETE,
        entidad_afectada: EntidadAfectada.USUARIOS,
        descripcion: 'Intento de eliminación con contraseña incorrecta',
        requiere_confirmacion: true,
        exitosa: false,
        mensaje_error: 'CURRENT_PASSWORD_INVALID'
      });
      throw new Error('CURRENT_PASSWORD_INVALID');
    }

    // 1) Registrar en auditoría ANTES del borrado físico.
    //    Razón: una vez eliminado el usuario ya no podremos recuperar alias/rol desde BD.
    //    Guardamos:
    //      - user_alias y user_role (visibles para reportes posteriores)
    //      - id_registro_afectado con el id que se elimina (para trazabilidad)
    await this.auditoria.registrar({
      id_user: user.id_user,
      user_alias: user.alias,
      user_role: user.role?.role_name || 'UNKNOWN',
      accion: TipoAccionAuditoria.USER_DELETE,
      entidad_afectada: EntidadAfectada.USUARIOS,
      id_registro_afectado: user.id_user,
      descripcion: 'El usuario eliminó su propia cuenta (hard delete)',
      requiere_confirmacion: true,
      exitosa: true
    });

    // 2) Ejecutar el Stored Procedure que hace el borrado físico y
    //    además desvincula auditorías previas poniendo id_user = NULL
    //    para no romper la FK.
    //    Nota: el SP ya está creado en la BD (ver carpeta "API/Stored Procedures").
    await AppDataSource.query('EXEC usp_DeleteUserHard @0', [userId]);

    return { success: true, message: 'Cuenta eliminada correctamente' };
  }
}
