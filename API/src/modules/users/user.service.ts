/**
 * SERVICE (opcional) = encapsula la lógica de negocios/BD.
 * Aquí usamos el repositorio de TypeORM y exponemos métodos CRUD.
 * Si tu equipo viene de MVC, esta capa les resultará familiar.
 */
import { AppDataSource } from '../../config/data-source';
import { User } from './user.entity';
import { Repository } from 'typeorm';

export class UserService {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  list() {
    return this.repo.find();
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(alias: string, role: User['role']) {
    const u = this.repo.create({ alias, role });
    return this.repo.save(u);
  }

  async update(id: number, alias: string, role: User['role']) {
    const user = await this.getById(id);
    if (!user) return null;
    this.repo.merge(user, { alias, role });
    return this.repo.save(user);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    return result.affected ?? 0;
  }
}
