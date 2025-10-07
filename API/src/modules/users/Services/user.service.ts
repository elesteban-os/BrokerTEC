import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { Role } from '../../../entities/role.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from '../DTOs/user.dto';
import * as bcrypt from 'bcrypt';

export class UserService {
  private repo: Repository<User>;
  private roleRepo: Repository<Role>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
    this.roleRepo = AppDataSource.getRepository(Role);
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
      status: true,
      id_role: 3 // Por defecto: TRADER
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

  /**
   * Asignar rol a un usuario
   * @param id_user - ID del usuario
   * @param id_role - ID del rol (1=ADMINISTRADOR, 2=ANALISTA, 3=TRADER)
   */
  async assignRole(id_user: string, id_role: number): Promise<boolean> {
    // Validar que el rol existe
    const role = await this.roleRepo.findOne({ where: { id_role } });
    if (!role) {
      throw new Error('Rol no válido');
    }

    // Validar que es un rol permitido
    if (![1, 2, 3].includes(id_role)) {
      throw new Error('ID de rol no válido. Debe ser 1 (ADMINISTRADOR), 2 (ANALISTA) o 3 (TRADER)');
    }

    const user = await this.repo.findOne({ where: { id_user } });
    if (!user) return false;

    user.id_role = id_role;
    await this.repo.save(user);
    return true;
  }

  /**
   * Obtener todos los roles disponibles
   */
  async getRoles() {
    return this.roleRepo.find({
      order: { id_role: 'ASC' }
    });
  }

  /**
   * Obtener usuarios con sus roles
   */
  async getUsersWithRoles() {
    return this.repo.find({
      where: { status: true },
      relations: ['role'],
      select: {
        id_user: true,
        alias: true,
        email: true,
        nombre: true,
        apellido1: true,
        apellido2: true,
        country_origin: true,
        status: true,
        id_role: true,
        role: {
          id_role: true,
          role_name: true
        }
      }
    });
  }
}
