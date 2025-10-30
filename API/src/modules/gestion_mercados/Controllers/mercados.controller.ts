import { Router, Response } from 'express';
import { JwtAuthGuard } from '../../auth/Guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/Guards/roles.guard';
import { validateDto } from '../../../common/validate-dto';
import { CreateMercadoDto } from '../DTOs/create-mercado.dto';
import { UpdateMercadoDto } from '../DTOs/update-mercado.dto';
import { DisableMercadoDto } from '../DTOs/disable-mercado.dto';
import { MercadosService } from '../Services/mercados.service';

/**
 * @swagger
 * tags:
 *   name: Gestión de Mercados (Admin)
 *   description: Endpoints para administrar mercados (Solo Administradores)
 */

const router = Router();
const service = new MercadosService();

/**
 * @swagger
 * /api/admin/mercados:
 *   post:
 *     summary: Crear un nuevo mercado
 *     description: Crea un nuevo mercado en el sistema. Solo administradores pueden realizar esta acción.
 *     tags: [Gestión de Mercados (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMercadoDto'
 *     responses:
 *       201:
 *         description: Mercado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mercado creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_mercado:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "NASDAQ"
 *                     habilitado:
 *                       type: boolean
 *                       example: true
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       409:
 *         description: El mercado ya existe
 */
router.post(
  '/',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(CreateMercadoDto),
  async (req: any, res: Response) => {
    try {
      const adminId = req.user.id_user as number;
      const adminAlias = req.user.alias as string;
      const adminRole = req.user.role.role_name as string;
      const dto: CreateMercadoDto = req.body;

      const nuevoMercado = await service.create(dto, adminId, adminAlias, adminRole);

      res.status(201).json({
        success: true,
        message: 'Mercado creado exitosamente',
        data: nuevoMercado
      });
    } catch (error: any) {
      if (error.message === 'MERCADO_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un mercado con ese nombre'
        });
      }

      console.error('Error al crear mercado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/mercados:
 *   get:
 *     summary: Listar todos los mercados
 *     description: Obtiene la lista completa de mercados del sistema. Solo administradores pueden acceder.
 *     tags: [Gestión de Mercados (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mercados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_mercado:
 *                         type: integer
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "NASDAQ"
 *                       habilitado:
 *                         type: boolean
 *                         example: true
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
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
      const mercados = await service.findAll();

      res.status(200).json({
        success: true,
        data: mercados
      });
    } catch (error: any) {
      console.error('Error al listar mercados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/mercados/{id}:
 *   get:
 *     summary: Obtener detalle de un mercado
 *     description: Obtiene la información detallada de un mercado específico, incluyendo sus empresas. Solo administradores pueden acceder.
 *     tags: [Gestión de Mercados (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mercado
 *     responses:
 *       200:
 *         description: Mercado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_mercado:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: "NASDAQ"
 *                     habilitado:
 *                       type: boolean
 *                       example: true
 *                     fecha_creacion:
 *                       type: string
 *                       format: date-time
 *                     empresas:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Mercado no encontrado
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
          message: 'ID de mercado inválido'
        });
      }

      const mercado = await service.findOne(id);

      res.status(200).json({
        success: true,
        data: mercado
      });
    } catch (error: any) {
      if (error.message === 'MERCADO_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Mercado no encontrado'
        });
      }

      console.error('Error al obtener mercado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/mercados/{id}:
 *   put:
 *     summary: Actualizar un mercado
 *     description: Actualiza la información de un mercado existente. Solo administradores pueden realizar esta acción.
 *     tags: [Gestión de Mercados (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mercado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMercadoDto'
 *     responses:
 *       200:
 *         description: Mercado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mercado actualizado exitosamente"
 *                 data:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Mercado no encontrado
 *       409:
 *         description: El nombre del mercado ya existe
 */
router.put(
  '/:id',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(UpdateMercadoDto),
  async (req: any, res: Response) => {
    try {
      const adminId = req.user.id_user as number;
      const adminAlias = req.user.alias as string;
      const adminRole = req.user.role.role_name as string;
      const id = parseInt(req.params.id);
      const dto: UpdateMercadoDto = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de mercado inválido'
        });
      }

      const mercadoActualizado = await service.update(id, dto, adminId, adminAlias, adminRole);

      res.status(200).json({
        success: true,
        message: 'Mercado actualizado exitosamente',
        data: mercadoActualizado
      });
    } catch (error: any) {
      if (error.message === 'MERCADO_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Mercado no encontrado'
        });
      }

      if (error.message === 'MERCADO_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un mercado con ese nombre'
        });
      }

      console.error('Error al actualizar mercado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/mercados/{id}/disable:
 *   patch:
 *     summary: Deshabilitar un mercado
 *     description: |
 *       Deshabilita un mercado y DELISTA AUTOMÁTICAMENTE todas sus empresas activas.
 *       Esto causa la liquidación de todas las posiciones de todos los traders en esas empresas.
 *       OPERACIÓN CRÍTICA Y MASIVA - Usar con precaución.
 *       Solo administradores pueden realizar esta acción.
 *     tags: [Gestión de Mercados (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del mercado a deshabilitar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisableMercadoDto'
 *     responses:
 *       200:
 *         description: Mercado deshabilitado y empresas delistadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mercado 'NASDAQ' deshabilitado correctamente. Se delistaron 10 empresas."
 *                 empresas_delistadas:
 *                   type: integer
 *                   example: 10
 *                 total_posiciones_liquidadas:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: ID inválido o mercado ya está deshabilitado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (no es administrador)
 *       404:
 *         description: Mercado no encontrado
 */
router.patch(
  '/:id/disable',
  JwtAuthGuard.middleware(),
  RolesGuard.adminOnly(),
  validateDto(DisableMercadoDto),
  async (req: any, res: Response) => {
    try {
      const adminId = req.user.id_user as number;
      const adminAlias = req.user.alias as string;
      const adminRole = req.user.role.role_name as string;
      const id = parseInt(req.params.id);
      const dto: DisableMercadoDto = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de mercado inválido'
        });
      }

      const result = await service.disable(
        id, 
        dto.justificacion,
        adminId, 
        adminAlias, 
        adminRole
      );

      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'MERCADO_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Mercado no encontrado'
        });
      }

      if (error.message === 'El mercado ya está deshabilitado') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error al deshabilitar mercado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;
