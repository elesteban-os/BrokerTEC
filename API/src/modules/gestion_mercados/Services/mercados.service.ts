import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { Mercado } from '../../../entities/mercado.entity';
import { Empresa } from '../../../entities/empresa.entity';
import { CreateMercadoDto } from '../DTOs/create-mercado.dto';
import { UpdateMercadoDto } from '../DTOs/update-mercado.dto';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

/**
 * Servicio para gestión de mercados
 * Maneja toda la lógica de negocio relacionada con mercados
 */
export class MercadosService {
  private mercadoRepository: Repository<Mercado>;
  private empresaRepository: Repository<Empresa>;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.mercadoRepository = AppDataSource.getRepository(Mercado);
    this.empresaRepository = AppDataSource.getRepository(Empresa);
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Crear un nuevo mercado
   * @param dto Datos del mercado a crear
   * @param adminId ID del administrador que crea el mercado
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   * @returns Mercado creado
   */
  async create(dto: CreateMercadoDto, adminId: number, adminAlias: string, adminRole: string): Promise<Mercado> {
    // Verificar si ya existe un mercado con el mismo nombre
    const mercadoExistente = await this.mercadoRepository.findOne({
      where: { nombre: dto.nombre }
    });

    if (mercadoExistente) {
      throw new Error('MERCADO_ALREADY_EXISTS');
    }

    // Crear el nuevo mercado
    const nuevoMercado = this.mercadoRepository.create({
      nombre: dto.nombre,
      habilitado: true // Por defecto habilitado
    });

    // Guardar en la base de datos
    const mercadoGuardado = await this.mercadoRepository.save(nuevoMercado);

    // Registrar auditoría
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.MERCADO_CREATE,
      entidad_afectada: EntidadAfectada.MERCADOS,
      id_registro_afectado: mercadoGuardado.id_mercado,
      descripcion: `Mercado creado: ${mercadoGuardado.nombre}`,
      exitosa: true
    });

    return mercadoGuardado;
  }

  /**
   * Listar todos los mercados
   * @returns Array de mercados
   */
  async findAll(): Promise<Mercado[]> {
    return await this.mercadoRepository.find({
      order: { fecha_creacion: 'DESC' }
    });
  }

  /**
   * Buscar un mercado por ID
   * @param id ID del mercado
   * @returns Mercado encontrado
   */
  async findOne(id: number): Promise<Mercado> {
    const mercado = await this.mercadoRepository.findOne({
      where: { id_mercado: id },
      relations: ['empresas'] // Incluir empresas relacionadas
    });

    if (!mercado) {
      throw new Error('MERCADO_NOT_FOUND');
    }

    return mercado;
  }

  /**
   * Actualizar un mercado existente
   * @param id ID del mercado a actualizar
   * @param dto Datos a actualizar
   * @param adminId ID del administrador que actualiza
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   * @returns Mercado actualizado
   */
  async update(id: number, dto: UpdateMercadoDto, adminId: number, adminAlias: string, adminRole: string): Promise<Mercado> {
    // Verificar que el mercado existe
    const mercado = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro mercado con ese nombre
    if (dto.nombre && dto.nombre !== mercado.nombre) {
      const mercadoConMismoNombre = await this.mercadoRepository.findOne({
        where: { nombre: dto.nombre }
      });

      if (mercadoConMismoNombre) {
        throw new Error('MERCADO_ALREADY_EXISTS');
      }
    }

    // Actualizar campos
    if (dto.nombre !== undefined) {
      mercado.nombre = dto.nombre;
    }
    if (dto.habilitado !== undefined) {
      mercado.habilitado = dto.habilitado;
    }

    // Guardar cambios
    const mercadoActualizado = await this.mercadoRepository.save(mercado);

    // Registrar auditoría
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.MERCADO_UPDATE,
      entidad_afectada: EntidadAfectada.MERCADOS,
      id_registro_afectado: mercadoActualizado.id_mercado,
      descripcion: `Mercado actualizado: ${mercadoActualizado.nombre}`,
      exitosa: true
    });

    return mercadoActualizado;
  }

  /**
   * Eliminar un mercado
   * Valida que no tenga empresas activas antes de eliminar
   * @param id ID del mercado a eliminar
   * @param adminId ID del administrador que elimina
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   */
  async delete(id: number, adminId: number, adminAlias: string, adminRole: string): Promise<{ success: boolean; message: string }> {
    // Verificar que el mercado existe
    const mercado = await this.findOne(id);

    // Verificar que no tenga empresas activas (habilitadas)
    const empresasActivas = await this.empresaRepository.count({
      where: { 
        id_mercado: id,
        habilitado: true 
      }
    });

    if (empresasActivas > 0) {
      throw new Error('MERCADO_HAS_ACTIVE_EMPRESAS');
    }

    // Eliminar el mercado
    await this.mercadoRepository.remove(mercado);

    // Registrar auditoría
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.MERCADO_DELETE,
      entidad_afectada: EntidadAfectada.MERCADOS,
      id_registro_afectado: id,
      descripcion: `Mercado eliminado: ${mercado.nombre}`,
      exitosa: true
    });

    return {
      success: true,
      message: 'Mercado eliminado correctamente'
    };
  }
}
