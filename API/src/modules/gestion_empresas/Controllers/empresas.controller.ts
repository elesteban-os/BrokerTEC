import { Router, Response } from 'express';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { validateDto } from '../../../common/validate-dto';
import { CreateEmpresaDto } from '../DTOs/create-empresa.dto';
import { UpdateEmpresaDto } from '../DTOs/update-empresa.dto';
import { DelistEmpresaDto } from '../DTOs/delist-empresa.dto';
import { EmpresasService } from '../Services/empresas.service';

/**
 * @swagger
 * tags:
 *   name: Gestión de Empresas (Admin)
 *   description: Endpoints para administrar empresas (Solo Administradores)
 */

const router = Router();
const service = new EmpresasService();

/**
 * @swagger
 * /api/admin/empresas:
 *   post:
 *     summary: Crear una nueva empresa
 *     description: Crea una nueva empresa en un mercado. Solo administradores pueden realizar esta acción.
 *     tags: [Gestión de Empresas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmpresaDto'
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Mercado no encontrado
 *       409:
 *         description: La empresa ya existe
 */
router.post(
  '/',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(CreateEmpresaDto),
  async (req: any, res: Response) => {
    try {
      const adminId = req.user.id_user as number;
      const adminAlias = req.user.alias as string;
      const adminRole = req.user.role.role_name as string;
      const dto: CreateEmpresaDto = req.body;

      const nuevaEmpresa = await service.create(dto, adminId, adminAlias, adminRole);

      res.status(201).json({
        success: true,
        message: 'Empresa creada exitosamente',
        data: nuevaEmpresa
      });
    } catch (error: any) {
      if (error.message === 'MERCADO_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'El mercado especificado no existe'
        });
      }

      if (error.message === 'MERCADO_NOT_ENABLED') {
        return res.status(400).json({
          success: false,
          message: 'El mercado no está habilitado'
        });
      }

      if (error.message === 'EMPRESA_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una empresa con ese nombre'
        });
      }

      console.error('Error al crear empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/empresas:
 *   get:
 *     summary: Listar todas las empresas
 *     description: Obtiene la lista completa de empresas con filtros opcionales. Solo administradores pueden acceder.
 *     tags: [Gestión de Empresas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_mercado
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de mercado
 *       - in: query
 *         name: habilitado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true/false)
 *     responses:
 *       200:
 *         description: Lista de empresas obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 */
router.get(
  '/',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  async (req: any, res: Response) => {
    try {
      const filtros: any = {};

      // Aplicar filtros de query params
      if (req.query.id_mercado) {
        filtros.id_mercado = parseInt(req.query.id_mercado as string);
      }

      if (req.query.habilitado !== undefined) {
        filtros.habilitado = req.query.habilitado === 'true';
      }

      const empresas = await service.findAll(filtros);

      res.status(200).json({
        success: true,
        data: empresas
      });
    } catch (error: any) {
      console.error('Error al listar empresas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/empresas/{id}:
 *   get:
 *     summary: Obtener detalle de una empresa
 *     description: Obtiene la información detallada de una empresa específica. Solo administradores pueden acceder.
 *     tags: [Gestión de Empresas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Empresa no encontrada
 */
router.get(
  '/:id',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  async (req: any, res: Response) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de empresa inválido'
        });
      }

      const empresa = await service.findOne(id);

      // Calcular acciones disponibles y mayor tenedor
      const accionesDisponibles = await service.getAccionesDisponibles(id);
      const mayorTenedor = await service.getMayorTenedor(id);

      res.status(200).json({
        success: true,
        data: {
          ...empresa,
          acciones_disponibles: accionesDisponibles,
          mayor_tenedor: mayorTenedor
        }
      });
    } catch (error: any) {
      if (error.message === 'EMPRESA_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      console.error('Error al obtener empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/empresas/{id}:
 *   put:
 *     summary: Actualizar una empresa
 *     description: Actualiza la información de una empresa existente. Solo administradores pueden realizar esta acción.
 *     tags: [Gestión de Empresas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmpresaDto'
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Empresa no encontrada
 *       409:
 *         description: El nombre de la empresa ya existe
 */
router.put(
  '/:id',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(UpdateEmpresaDto),
  async (req: any, res: Response) => {
    try {
      const adminId = req.user.id_user as number;
      const adminAlias = req.user.alias as string;
      const adminRole = req.user.role.role_name as string;
      const id = parseInt(req.params.id);
      const dto: UpdateEmpresaDto = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de empresa inválido'
        });
      }

      const empresaActualizada = await service.update(id, dto, adminId, adminAlias, adminRole);

      res.status(200).json({
        success: true,
        message: 'Empresa actualizada exitosamente',
        data: empresaActualizada
      });
    } catch (error: any) {
      if (error.message === 'EMPRESA_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      if (error.message === 'MERCADO_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'El mercado especificado no existe'
        });
      }

      if (error.message === 'MERCADO_NOT_ENABLED') {
        return res.status(400).json({
          success: false,
          message: 'El mercado no está habilitado'
        });
      }

      if (error.message === 'EMPRESA_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una empresa con ese nombre'
        });
      }

      console.error('Error al actualizar empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/empresas/{id}:
 *   delete:
 *     summary: Eliminar una empresa (Delisting)
 *     description: Elimina una empresa del sistema y liquida automáticamente todas las posiciones activas. Solo administradores pueden realizar esta acción.
 *     tags: [Gestión de Empresas (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DelistEmpresaDto'
 *     responses:
 *       200:
 *         description: Empresa eliminada exitosamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Empresa no encontrada
 */
router.delete(
  '/:id',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(DelistEmpresaDto),
  async (req: any, res: Response) => {
    try {
      const adminId = req.user.id_user as number;
      const adminAlias = req.user.alias as string;
      const adminRole = req.user.role.role_name as string;
      const id = parseInt(req.params.id);
      const { justificacion } = req.body as DelistEmpresaDto;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de empresa inválido'
        });
      }

      const result = await service.delist(id, justificacion, adminId, adminAlias, adminRole);

      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'EMPRESA_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      if (error.message === 'DELISTING_FAILED') {
        return res.status(500).json({
          success: false,
          message: 'Error al realizar el delisting. Por favor, inténtelo de nuevo.'
        });
      }

      console.error('Error al eliminar empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;
