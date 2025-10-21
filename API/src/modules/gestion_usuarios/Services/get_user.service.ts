// Servicio para obtener datos del usuario autenticado (sin contraseña)
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { GetUserResponse } from '../DTOs/get_user.dto';

export class GetUserService {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  async getMe(userId: number): Promise<GetUserResponse> {
    const user = await this.repo.findOne({ where: { id_user: userId }, relations: ['role'] });
    if (!user) throw new Error('USER_NOT_FOUND');

    return {
      id_user: user.id_user,
      alias: user.alias,
      email: user.email,
      nombre: user.nombre,
      apellido1: user.apellido1,
      apellido2: user.apellido2 ?? null,
      country_origin: user.country_origin,
      status: user.status,
      role: {
        id_role: user.role.id_role,
        role_name: user.role.role_name
      }
    };
  }
}

