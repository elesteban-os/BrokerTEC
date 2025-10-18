// Servicio para cambio de contraseña del usuario autenticado
// Usa transacción simple: verifica contraseña actual, actualiza hash y rota token_version
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { ChangePasswordDto } from '../DTOs/user_update_password.dto';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

export class UserUpdatePasswordService {
  private userRepository: Repository<User>;
  private auditoria: AuditoriaService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.auditoria = new AuditoriaService();
  }

  /**
   * Cambiar contraseña para el propio usuario
   * - Verifica la contraseña actual
   * - Hashea y guarda la nueva contraseña
   * - Incrementa token_version para invalidar tokens existentes
   */
  async changeMyPassword(userId: number, dto: ChangePasswordDto) {
    // 1) Buscar usuario con su rol (para auditoría)
    const user = await this.userRepository.findOne({ where: { id_user: userId }, relations: ['role'] });
    if (!user) {
      // No exponemos demasiada info, coherente con seguridad
      throw new Error('USER_NOT_FOUND');
    }

    // 2) Verificar contraseña actual
    const ok = await bcrypt.compare(dto.current_password, user.password);
    if (!ok) {
      // Registrar intento fallido de cambio de contraseña
      await this.auditoria.registrar({
        id_user: user.id_user,
        user_alias: user.alias,
        user_role: user.role?.role_name || 'UNKNOWN',
        accion: TipoAccionAuditoria.PASSWORD_CHANGE,
        entidad_afectada: EntidadAfectada.USUARIOS,
        descripcion: 'Intento de cambio de contraseña con contraseña actual incorrecta',
        requiere_confirmacion: true,
        exitosa: false,
        mensaje_error: 'CURRENT_PASSWORD_INVALID'
      });
      throw new Error('CURRENT_PASSWORD_INVALID');
    }

    // 3) Generar hash para la nueva contraseña
    const newHash = await bcrypt.hash(dto.new_password, 12);

    // 4) Actualizar contraseña y rotar token_version en una sola operación
    await this.userRepository.update(
      { id_user: userId },
      { password: newHash, token_version: () => 'token_version + 1' as any }
    );

    // 5) Registrar auditoría exitosa
    await this.auditoria.registrar({
      id_user: user.id_user,
      user_alias: user.alias,
      user_role: user.role?.role_name || 'UNKNOWN',
      accion: TipoAccionAuditoria.PASSWORD_CHANGE,
      entidad_afectada: EntidadAfectada.USUARIOS,
      descripcion: 'Cambio de contraseña realizado por el usuario',
      requiere_confirmacion: true,
      exitosa: true
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    };
  }
}

