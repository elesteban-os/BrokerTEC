import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../DTOs/user.dto';
import * as bcrypt from 'bcrypt';

export class UserService {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  /**
   * Obtener todos los usuarios activos
   * Excluye la contraseña del resultado
   */
  async list() {
    return this.repo.find({ 
      where: { status: true },
      select: ['id_user', 'alias', 'email', 'nombre', 'apellido1', 'apellido2', 'country_origin', 'status']
    });
  }

  /**
   * Obtener usuario por ID (UUID)
   * Excluye la contraseña del resultado
   */
  async getById(id_user: string) {
    return this.repo.findOne({ 
      where: { id_user },
      select: ['id_user', 'alias', 'email', 'nombre', 'apellido1', 'apellido2', 'country_origin', 'status']
    });
  }

  /**
   * Crear un nuevo usuario
   * Valida que el alias y email sean únicos
   */
  async create(userData: CreateUserDto): Promise<User> {
    // Verificar si ya existe el alias o email
    const existingUser = await this.repo.findOne({
      where: [
        { alias: userData.alias },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      throw new Error('El alias o email ya está en uso');
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = this.repo.create({
      alias: userData.alias,
      email: userData.email,
      nombre: userData.nombre,
      apellido1: userData.apellido1,
      apellido2: userData.apellido2,
      password: hashedPassword,
      country_origin: userData.country_origin,
      status: true
    });

    return this.repo.save(user);
  }

  /**
   * Actualizar un usuario existente
   * Valida unicidad de alias y email
   */
  async update(id_user: string, userData: UpdateUserDto): Promise<User | null> {
    const user = await this.repo.findOne({ where: { id_user } });
    if (!user) return null;

    // Preparar los datos para actualizar
    const updateData: any = {
      alias: userData.alias,
      email: userData.email,
      nombre: userData.nombre,
      apellido1: userData.apellido1,
      apellido2: userData.apellido2,
      country_origin: userData.country_origin,
      status: userData.status ?? user.status
    };

    // Si se proporciona una nueva contraseña, hashearla
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 12);
    }

    this.repo.merge(user, updateData);

    return this.repo.save(user);
  }

  /**
   * Eliminar usuario (soft delete)
   * Cambia el status a false
   */
  async remove(id_user: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { id_user } });
    if (!user) return false;

    user.status = false;
    await this.repo.save(user);
    return true;
  }
}
