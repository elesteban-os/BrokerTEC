// Servicio para actualizar el perfil del usuario autenticado (sin contraseña)
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { EditUserDto } from '../DTOs/edit_user.dto';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

export class EditUserService {
  private repo: Repository<User>;
  private auditoria = new AuditoriaService();

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  async updateMe(userId: number, dto: EditUserDto) {
    const user = await this.repo.findOne({ where: { id_user: userId }, relations: ['role'] });
    if (!user) throw new Error('USER_NOT_FOUND');

    // Normalizar valores para validaciones de unicidad
    const desiredAlias = dto.alias?.trim();
    const desiredEmail = dto.email?.trim().toLowerCase();

    // Unicidad de alias (si cambia)
    if (desiredAlias && desiredAlias !== user.alias) {
      const aliasExists = await this.repo.findOne({ where: { alias: desiredAlias } });
      if (aliasExists) throw new Error('ALIAS_ALREADY_EXISTS');
    }

    // Unicidad de email (si cambia)
    if (desiredEmail && desiredEmail !== user.email.toLowerCase()) {
      const emailExists = await this.repo.findOne({ where: { email: desiredEmail } });
      if (emailExists) throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Aplicar cambios sólo si vienen en el DTO
    if (desiredAlias !== undefined) user.alias = desiredAlias;
    if (desiredEmail !== undefined) user.email = desiredEmail;
    if (dto.nombre !== undefined) user.nombre = dto.nombre;
    if (dto.apellido1 !== undefined) user.apellido1 = dto.apellido1;
    if (dto.apellido2 !== undefined) user.apellido2 = dto.apellido2 ?? null;
    if (dto.country_origin !== undefined) user.country_origin = dto.country_origin;

    const saved = await this.repo.save(user);

    // Registrar auditoría de actualización de perfil
    await this.auditoria.registrar({
      id_user: saved.id_user,
      user_alias: saved.alias,
      user_role: user.role?.role_name || 'UNKNOWN',
      accion: TipoAccionAuditoria.USER_UPDATE,
      entidad_afectada: EntidadAfectada.USUARIOS,
      id_registro_afectado: saved.id_user,
      descripcion: 'Actualización de perfil del usuario',
      exitosa: true
    });

    return {
      success: true,
      user: {
        id_user: saved.id_user,
        alias: saved.alias,
        email: saved.email,
        nombre: saved.nombre,
        apellido1: saved.apellido1,
        apellido2: saved.apellido2 ?? null,
        country_origin: saved.country_origin,
        status: saved.status,
        role: {
          id_role: user.role.id_role,
          role_name: user.role.role_name
        }
      }
    };
  }
}

