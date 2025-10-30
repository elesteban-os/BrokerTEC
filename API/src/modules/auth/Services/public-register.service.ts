import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../../../entities/user.entity';
import { PhoneNumberUser } from '../../../entities/phone-number-user.entity';
import { RegisterPublicDto } from '../DTOs/public-register.dto';
import { JwtService } from './jwt.service';
import { AuthenticatedUser } from '../auth.types';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';
import * as bcrypt from 'bcrypt';

export class PublicRegisterService {
  private userRepository: Repository<User>;
  private phoneNumberRepository: Repository<PhoneNumberUser>;
  private jwtService: JwtService;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.phoneNumberRepository = AppDataSource.getRepository(PhoneNumberUser);
    this.jwtService = new JwtService();
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Registra un nuevo usuario con rol TRADER (registro público)
   */
  async registerPublic(registerDto: RegisterPublicDto) {
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

    // Crear el usuario con rol TRADER (id_role = 3)
    const newUser = this.userRepository.create({
      alias: registerDto.alias,
      email: registerDto.email,
      nombre: registerDto.nombre,
      apellido1: registerDto.apellido1,
      apellido2: registerDto.apellido2,
      password: hashedPassword,
      country_origin: registerDto.country_origin,
      status: true, // true = ACTIVE
      id_role: 3, // TRADER
      token_version: 0
    });

    // Guardar el usuario
    const savedUser = await this.userRepository.save(newUser);

    // Guardar números de teléfono si se proporcionaron
    if (registerDto.phone_numbers && registerDto.phone_numbers.length > 0) {
      const phoneNumbers = registerDto.phone_numbers.map(phoneNumber => 
        this.phoneNumberRepository.create({
          id_user: savedUser.id_user,
          phone_number: phoneNumber,
          user: savedUser
        })
      );
      await this.phoneNumberRepository.save(phoneNumbers);
    }

    // ========================================================================================
    // CREAR WALLET AUTOMÁTICAMENTE PARA TRADER
    // Como es registro público, siempre será TRADER
    // Se llama al Stored Procedure para crear el wallet con categoría JUNIOR por defecto
    try {
      await AppDataSource.query(
        'EXEC usp_CreateWalletForTrader @id_user = @0, @categoria = @1',
        [savedUser.id_user, 'JUNIOR']
      );
    } catch (error) {
      console.error('Error al crear wallet para trader:', error);
      // No lanzamos error aquí para no interrumpir el registro
      // El wallet se puede crear después manualmente si falla
    }

    // Preparar datos del usuario autenticado para JWT
    const authenticatedUser: AuthenticatedUser = {
      id_user: savedUser.id_user,
      alias: savedUser.alias,
      email: savedUser.email,
      nombre: savedUser.nombre,
      apellido1: savedUser.apellido1,
      apellido2: savedUser.apellido2,
      role: {
        id_role: 3,
        role_name: 'TRADER'
      },
      token_version: savedUser.token_version
    };

    // Generar tokens JWT
    const tokenPair = await this.jwtService.generateTokenPair(authenticatedUser);

    // Registrar creación de usuario en auditoría
    await this.auditoriaService.registrar({
      id_user: savedUser.id_user,
      user_alias: savedUser.alias,
      user_role: 'TRADER',
      accion: TipoAccionAuditoria.USER_CREATE,
      entidad_afectada: EntidadAfectada.USUARIOS,
      id_registro_afectado: savedUser.id_user,
      descripcion: `Usuario TRADER creado exitosamente: ${savedUser.alias} (${savedUser.email})`,
      exitosa: true
    });

    // Retornar respuesta exitosa (sin password)
    const { password, token_version, ...userResponse } = savedUser;
    
    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      tokens: {
        accessToken: tokenPair.access_token,
        refreshToken: tokenPair.refresh_token
      }
    };
  }
}