import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/data-source';
import { Empresa } from '../../../entities/empresa.entity';
import { Mercado } from '../../../entities/mercado.entity';
import { Posicion } from '../../../entities/posicion.entity';
import { CreateEmpresaDto } from '../DTOs/create-empresa.dto';
import { UpdateEmpresaDto } from '../DTOs/update-empresa.dto';
import { AuditoriaService } from '../../auditoria/Services/auditoria.service';
import { TipoAccionAuditoria, EntidadAfectada } from '../../../common/audit.types';

/**
 * Servicio para gestión de empresas (Admin)
 * Maneja toda la lógica de negocio relacionada con empresas
 */
export class EmpresasService {
  private empresaRepository: Repository<Empresa>;
  private mercadoRepository: Repository<Mercado>;
  private posicionRepository: Repository<Posicion>;
  private auditoriaService: AuditoriaService;

  constructor() {
    this.empresaRepository = AppDataSource.getRepository(Empresa);
    this.mercadoRepository = AppDataSource.getRepository(Mercado);
    this.posicionRepository = AppDataSource.getRepository(Posicion);
    this.auditoriaService = new AuditoriaService();
  }

  /**
   * Crear una nueva empresa
   * @param dto Datos de la empresa a crear
   * @param adminId ID del administrador que crea la empresa
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   * @returns Empresa creada
   */
  async create(
    dto: CreateEmpresaDto,
    adminId: number,
    adminAlias: string,
    adminRole: string
  ): Promise<Empresa> {
    // 1. Verificar que el mercado existe y está habilitado
    const mercado = await this.mercadoRepository.findOne({
      where: { id_mercado: dto.id_mercado }
    });

    if (!mercado) {
      throw new Error('MERCADO_NOT_FOUND');
    }

    if (!mercado.habilitado) {
      throw new Error('MERCADO_NOT_ENABLED');
    }

    // 2. Verificar que no exista otra empresa con el mismo nombre
    const empresaExistente = await this.empresaRepository.findOne({
      where: { nombre: dto.nombre }
    });

    if (empresaExistente) {
      throw new Error('EMPRESA_ALREADY_EXISTS');
    }

    // 3. Crear la nueva empresa
    const nuevaEmpresa = this.empresaRepository.create({
      nombre: dto.nombre,
      id_mercado: dto.id_mercado,
      precio_actual: dto.precio_actual,
      cantidad_acciones: dto.cantidad_acciones,
      habilitado: true // Por defecto habilitada
    });

    // 4. Guardar en la base de datos
    const empresaGuardada = await this.empresaRepository.save(nuevaEmpresa);

    // 5. Registrar auditoría
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.EMPRESA_CREATE,
      entidad_afectada: EntidadAfectada.EMPRESAS,
      id_registro_afectado: empresaGuardada.id_empresa,
      descripcion: `Empresa creada: ${empresaGuardada.nombre} en mercado ${mercado.nombre}`,
      exitosa: true
    });

    return empresaGuardada;
  }

  /**
   * Listar todas las empresas con filtros opcionales
   * @param filtros Filtros opcionales (por mercado, estado)
   * @returns Array de empresas
   */
  async findAll(filtros?: { id_mercado?: number; habilitado?: boolean }): Promise<Empresa[]> {
    const query = this.empresaRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.mercado', 'm')
      .leftJoinAndSelect('e.precios_historicos', 'ph')
      .orderBy('e.fecha_creacion', 'DESC');

    // Aplicar filtros si existen
    if (filtros?.id_mercado) {
      query.andWhere('e.id_mercado = :id_mercado', { id_mercado: filtros.id_mercado });
    }

    if (filtros?.habilitado !== undefined) {
      query.andWhere('e.habilitado = :habilitado', { habilitado: filtros.habilitado });
    }

    return await query.getMany();
  }

  /**
   * Buscar una empresa por ID
   * @param id ID de la empresa
   * @returns Empresa encontrada con sus relaciones
   */
  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: id },
      relations: ['mercado', 'precios_historicos', 'posiciones']
    });

    if (!empresa) {
      throw new Error('EMPRESA_NOT_FOUND');
    }

    return empresa;
  }

  /**
   * Actualizar una empresa existente
   * @param id ID de la empresa a actualizar
   * @param dto Datos a actualizar
   * @param adminId ID del administrador que actualiza
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   * @returns Empresa actualizada
   */
  async update(
    id: number,
    dto: UpdateEmpresaDto,
    adminId: number,
    adminAlias: string,
    adminRole: string
  ): Promise<Empresa> {
    // 1. Verificar que la empresa existe
    const empresa = await this.findOne(id);

    // 2. Si se está actualizando el mercado, verificar que exista y esté habilitado
    if (dto.id_mercado && dto.id_mercado !== empresa.id_mercado) {
      const mercado = await this.mercadoRepository.findOne({
        where: { id_mercado: dto.id_mercado }
      });

      if (!mercado) {
        throw new Error('MERCADO_NOT_FOUND');
      }

      if (!mercado.habilitado) {
        throw new Error('MERCADO_NOT_ENABLED');
      }
    }

    // 3. Si se está actualizando el nombre, verificar que no exista otra empresa con ese nombre
    if (dto.nombre && dto.nombre !== empresa.nombre) {
      const empresaConMismoNombre = await this.empresaRepository.findOne({
        where: { nombre: dto.nombre }
      });

      if (empresaConMismoNombre) {
        throw new Error('EMPRESA_ALREADY_EXISTS');
      }
    }

    // 4. Actualizar campos
    if (dto.nombre !== undefined) empresa.nombre = dto.nombre;
    if (dto.id_mercado !== undefined) empresa.id_mercado = dto.id_mercado;
    if (dto.precio_actual !== undefined) empresa.precio_actual = dto.precio_actual;
    if (dto.cantidad_acciones !== undefined) empresa.cantidad_acciones = dto.cantidad_acciones;
    if (dto.habilitado !== undefined) empresa.habilitado = dto.habilitado;

    // 5. Guardar cambios
    const empresaActualizada = await this.empresaRepository.save(empresa);

    // 6. Registrar auditoría
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.EMPRESA_UPDATE,
      entidad_afectada: EntidadAfectada.EMPRESAS,
      id_registro_afectado: empresaActualizada.id_empresa,
      descripcion: `Empresa actualizada: ${empresaActualizada.nombre}`,
      exitosa: true
    });

    return empresaActualizada;
  }

  /**
   * Eliminar una empresa (Delisting)
   * Utiliza Stored Procedure para liquidar posiciones automáticamente
   * @param id ID de la empresa a eliminar
   * @param justificacion Justificación del delisting
   * @param adminId ID del administrador que elimina
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   */
  async delist(
    id: number,
    justificacion: string,
    adminId: number,
    adminAlias: string,
    adminRole: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. Verificar que la empresa existe
    const empresa = await this.findOne(id);

    // 2. Verificar si tiene posiciones activas
    const posicionesActivas = await this.posicionRepository.count({
      where: { id_empresa: id }
    });

    // 3. Llamar al Stored Procedure para delisting
    // El SP se encarga de:
    // - Liquidar todas las posiciones activas al precio actual
    // - Abonar al wallet de cada trader
    // - Deshabilitar la empresa
    // - Registrar auditoría
    try {
      await AppDataSource.query(
        'EXEC usp_DelistEmpresa @id_empresa = @0, @justificacion = @1, @id_admin = @2, @admin_alias = @3, @admin_role = @4',
        [id, justificacion, adminId, adminAlias, adminRole]
      );

      return {
        success: true,
        message: `Empresa ${empresa.nombre} eliminada exitosamente. ${posicionesActivas > 0 ? `Se liquidaron ${posicionesActivas} posiciones activas.` : ''}`
      };
    } catch (error: any) {
      console.error('Error en delisting de empresa:', error);
      throw new Error('DELISTING_FAILED');
    }
  }

  /**
   * Calcular acciones disponibles (inventario)
   * Acciones disponibles = cantidad_acciones_total - SUM(posiciones)
   * @param id_empresa ID de la empresa
   * @returns Cantidad de acciones disponibles
   */
  async getAccionesDisponibles(id_empresa: number): Promise<number> {
    // 1. Obtener empresa
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa }
    });

    if (!empresa) {
      throw new Error('EMPRESA_NOT_FOUND');
    }

    // 2. Sumar todas las posiciones de traders
    const result = await this.posicionRepository
      .createQueryBuilder('p')
      .select('SUM(p.cantidad)', 'total')
      .where('p.id_empresa = :id_empresa', { id_empresa })
      .getRawOne();

    const accionesEnPosesion = result?.total || 0;

    // 3. Calcular disponibles
    const disponibles = empresa.cantidad_acciones - accionesEnPosesion;

    return disponibles >= 0 ? disponibles : 0;
  }

  /**
   * Obtener el mayor tenedor de una empresa
   * Puede ser un trader o "administracion" si el inventario es mayor
   * @param id_empresa ID de la empresa
   * @returns Alias del mayor tenedor
   */
  async getMayorTenedor(id_empresa: number): Promise<string> {
    // 1. Buscar trader con más acciones
    const mayorPosicion = await this.posicionRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .where('p.id_empresa = :id_empresa', { id_empresa })
      .orderBy('p.cantidad', 'DESC')
      .getOne();

    if (!mayorPosicion) {
      // Nadie ha comprado, el inventario está completo en administración
      return 'administracion';
    }

    // 2. Calcular acciones disponibles (inventario)
    const accionesDisponibles = await this.getAccionesDisponibles(id_empresa);

    // 3. Comparar
    if (accionesDisponibles > mayorPosicion.cantidad) {
      return 'administracion';
    }

    return mayorPosicion.user.alias;
  }
}
