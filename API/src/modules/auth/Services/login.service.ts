import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { Role } from '../../../entities/role.entity';
import { LoginDto, LoginResponse } from '../DTOs/login.dto';
import { JwtService } from './jwt.service';
import { AuthenticatedUser } from '../auth.types';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';
import * as bcrypt from 'bcrypt';

export class LoginService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private jwtService: JwtService;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.jwtService = new JwtService();
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Autenticar usuario y generar tokens JWT
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    // Buscar usuario por alias e incluir la relación con el rol
    const user = await this.userRepository.findOne({
      where: { alias: loginDto.alias },
      relations: ['role']
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verificar si el usuario está activo
    if (!user.status) {
      throw new Error('USER_DISABLED');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      // Registrar intento de login fallido
      await this.auditoriaService.registrar({
        id_user: user.id_user,
        user_alias: user.alias,
        user_role: user.role?.role_name || 'UNKNOWN',
        accion: TipoAccionAuditoria.LOGIN_FAILED,
        entidad_afectada: EntidadAfectada.USUARIOS,
        descripcion: `Intento de login fallido para usuario ${user.alias}`,
        exitosa: false,
        mensaje_error: 'Credenciales inválidas'
      });
      throw new Error('INVALID_CREDENTIALS');
    }

    // Si no tiene rol cargado, buscarlo explícitamente
    if (!user.role) {
      const role = await this.roleRepository.findOne({
        where: { id_role: user.id_role }
      });
      
      if (!role) {
        throw new Error('USER_ROLE_NOT_FOUND');
      }
      
      user.role = role;
    }

    // Preparar datos del usuario autenticado para JWT
    const authenticatedUser: AuthenticatedUser = {
      id_user: user.id_user,
      alias: user.alias,
      email: user.email,
      nombre: user.nombre,
      apellido1: user.apellido1,
      apellido2: user.apellido2,
      role: {
        id_role: user.role.id_role,
        role_name: user.role.role_name
      },
      token_version: user.token_version
    };

    // Generar tokens JWT
    const tokenPair = await this.jwtService.generateTokenPair(authenticatedUser);

    // Registrar login exitoso en auditoría
    await this.auditoriaService.registrar({
      id_user: user.id_user,
      user_alias: user.alias,
      user_role: user.role.role_name,
      accion: TipoAccionAuditoria.LOGIN,
      entidad_afectada: EntidadAfectada.USUARIOS,
      descripcion: `Login exitoso de usuario ${user.alias} con rol ${user.role.role_name}`,
      exitosa: true
    });

    // Preparar respuesta
    const loginResponse: LoginResponse = {
      access_token: tokenPair.access_token,
      refresh_token: tokenPair.refresh_token,
      user: {
        id_user: user.id_user,
        alias: user.alias,
        email: user.email,
        nombre: user.nombre,
        apellido1: user.apellido1,
        apellido2: user.apellido2,
        role: {
          id_role: user.role.id_role,
          role_name: user.role.role_name
        }
      }
    };

    return loginResponse;
  }

  /**
   * Refresh token - generar nuevos tokens usando refresh token válido
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      // Verificar y decodificar refresh token
      const decoded = await this.jwtService.verifyToken(refreshToken, true);
      
      // Buscar usuario y verificar token_version
      const user = await this.userRepository.findOne({
        where: { 
          id_user: decoded.id_user,
          token_version: decoded.token_version
        },
        relations: ['role']
      });

      if (!user || !user.status) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }

      // Preparar datos del usuario autenticado
      const authenticatedUser: AuthenticatedUser = {
        id_user: user.id_user,
        alias: user.alias,
        email: user.email,
        nombre: user.nombre,
        apellido1: user.apellido1,
        apellido2: user.apellido2,
        role: {
          id_role: user.role.id_role,
          role_name: user.role.role_name
        },
        token_version: user.token_version
      };

      // Generar nuevos tokens
      const tokenPair = await this.jwtService.generateTokenPair(authenticatedUser);

      return {
        access_token: tokenPair.access_token,
        refresh_token: tokenPair.refresh_token
      };
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Logout - invalidar tokens incrementando token_version
   */
  // Ajuste: userId ahora es entero
  async logout(userId: number): Promise<void> {
    // Buscar información del usuario para auditoría
    const user = await this.userRepository.findOne({
      where: { id_user: userId },
      relations: ['role']
    });

    await this.userRepository.update(
      { id_user: userId },
      { token_version: () => 'token_version + 1' }
    );

    // Registrar logout en auditoría
    if (user) {
      await this.auditoriaService.registrar({
        id_user: userId,
        user_alias: user.alias,
        user_role: user.role?.role_name || 'UNKNOWN',
        accion: TipoAccionAuditoria.LOGOUT,
        entidad_afectada: EntidadAfectada.USUARIOS,
        descripcion: `Logout de usuario ${user.alias}`,
        exitosa: true
      });
    }
  }
}
