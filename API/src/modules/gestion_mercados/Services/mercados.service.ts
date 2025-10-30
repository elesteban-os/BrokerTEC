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
   * Deshabilitar un mercado
   * Delista automáticamente TODAS las empresas activas del mercado
   * Esto causa la liquidación de todas las posiciones de traders en esas empresas
   * @param id ID del mercado a deshabilitar
   * @param justificacion Justificación del cierre del mercado
   * @param adminId ID del administrador que ejecuta
   * @param adminAlias Alias del administrador
   * @param adminRole Rol del administrador
   */
  async disable(
    id: number, 
    justificacion: string,
    adminId: number, 
    adminAlias: string, 
    adminRole: string
  ): Promise<{ success: boolean; message: string; empresas_delistadas: number; total_posiciones_liquidadas: number }> {
    
    // Verificar que el mercado existe
    const mercado = await this.findOne(id);

    // Verificar que no esté ya deshabilitado
    if (!mercado.habilitado) {
      throw new Error('El mercado ya está deshabilitado');
    }

    // Obtener TODAS las empresas activas del mercado
    const empresasActivas = await this.empresaRepository.find({
      where: { 
        id_mercado: id,
        habilitado: true 
      }
    });

    let empresasDelistadas = 0;
    let totalPosicionesLiquidadas = 0;

    // Delista cada empresa usando el SP usp_DelistEmpresa
    for (const empresa of empresasActivas) {
      try {
        await AppDataSource.query(
          `EXEC usp_DelistEmpresa 
            @id_empresa = @0, 
            @justificacion = @1, 
            @id_admin = @2, 
            @admin_alias = @3, 
            @admin_role = @4`,
          [
            empresa.id_empresa,
            `Delisting automático por cierre del mercado "${mercado.nombre}". Justificación: ${justificacion}`,
            adminId,
            adminAlias,
            adminRole
          ]
        );
        empresasDelistadas++;
      } catch (error: any) {
        console.error(`Error al delista empresa ${empresa.nombre}:`, error);
        // Continuar con las demás empresas aunque una falle
      }
    }

    // Deshabilitar el mercado
    mercado.habilitado = false;
    await this.mercadoRepository.save(mercado);

    // Registrar auditoría del cierre del mercado
    await this.auditoriaService.registrar({
      id_user: adminId,
      user_alias: adminAlias,
      user_role: adminRole,
      accion: TipoAccionAuditoria.DESHABILITAR_MERCADO,
      entidad_afectada: EntidadAfectada.MERCADOS,
      id_registro_afectado: id,
      justificacion: justificacion,
      descripcion: `Mercado "${mercado.nombre}" deshabilitado. ${empresasDelistadas} empresas delistadas automáticamente.`,
      exitosa: true
    });

    return {
      success: true,
      message: `Mercado "${mercado.nombre}" deshabilitado correctamente. Se delistaron ${empresasDelistadas} empresas.`,
      empresas_delistadas: empresasDelistadas,
      total_posiciones_liquidadas: totalPosicionesLiquidadas
    };
  }
}
