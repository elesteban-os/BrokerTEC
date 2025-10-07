import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { AdminRegisterDto } from '../DTOs/admin-register.dto';
import { JwtService } from './jwt.service';
import { AuthenticatedUser } from '../auth.types';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';
import * as bcrypt from 'bcrypt';

export class AdminRegisterService {
  private userRepository: Repository<User>;
  private jwtService: JwtService;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.jwtService = new JwtService();
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Registra un nuevo usuario con rol ADMIN o ANALISTA (solo desde admin)
   */
  async registerAdmin(registerDto: AdminRegisterDto) {
    // Verificar si el alias ya existe
    const existingUserByAlias = await this.userRepository.findOne({
      where: { alias: registerDto.alias }
    });

    if (existingUserByAlias) {
      throw new Error('ALIAS_ALREADY_EXISTS');
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUserByEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Crear el usuario con el rol especificado (ADMIN o ANALISTA)
    const newUser = this.userRepository.create({
      alias: registerDto.alias,
      email: registerDto.email,
      nombre: registerDto.nombre,
      apellido1: registerDto.apellido1,
      apellido2: registerDto.apellido2,
      password: hashedPassword,
      country_origin: registerDto.country_origin,
      status: true, // true = ACTIVE
      id_role: registerDto.id_role, // 1 = ADMIN, 2 = ANALISTA
      token_version: 0
    });

    // Guardar el usuario
    const savedUser = await this.userRepository.save(newUser);

    // Determinar el nombre del rol
    const roleName = registerDto.id_role === 1 ? 'ADMINISTRADOR' : 'ANALISTA';

    // Preparar datos del usuario autenticado para JWT
    const authenticatedUser: AuthenticatedUser = {
      id_user: savedUser.id_user,
      alias: savedUser.alias,
      email: savedUser.email,
      nombre: savedUser.nombre,
      apellido1: savedUser.apellido1,
      apellido2: savedUser.apellido2,
      role: {
        id_role: registerDto.id_role,
        role_name: roleName
      },
      token_version: savedUser.token_version
    };

    // Generar tokens JWT
    const tokenPair = await this.jwtService.generateTokenPair(authenticatedUser);

    // Registrar creación de usuario administrativo en auditoría
    await this.auditoriaService.registrar({
      id_user: savedUser.id_user,
      user_alias: savedUser.alias,
      user_role: roleName,
      accion: TipoAccionAuditoria.USER_CREATE,
      entidad_afectada: EntidadAfectada.USUARIOS,
      id_registro_afectado: savedUser.id_user,
      descripcion: `Usuario ${roleName} creado exitosamente: ${savedUser.alias} (${savedUser.email})`,
      exitosa: true
    });

    // Retornar respuesta exitosa (sin password)
    const { password, token_version, ...userResponse } = savedUser;
    
    return {
      success: true,
      message: `Usuario ${roleName} registrado exitosamente`,
      user: {
        ...userResponse,
        role_name: roleName
      },
      tokens: {
        accessToken: tokenPair.access_token,
        refreshToken: tokenPair.refresh_token
      }
    };
  }
}