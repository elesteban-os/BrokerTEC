/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id_user:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         alias:
 *           type: string
 *           example: "trader_001"
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@brokertec.com"
 *         nombre:
 *           type: string
 *           example: "Juan"
 *         apellido1:
 *           type: string
 *           example: "Pérez"
 *         apellido2:
 *           type: string
 *           nullable: true
 *           example: "González"
 *         password:
 *           type: string
 *           example: "$2b$10$..."
 *         country_origin:
 *           type: string
 *           example: "Costa Rica"
 *         status:
 *           type: boolean
 *           example: true
 */
import { Router } from 'express';
import { validateDto } from '../../../common/validate-dto';
import { CreateUserDto, UpdateUserDto } from '../DTOs/user.dto';
import { UserService } from '../Services/user.service';

const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Obtener todos los usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (_req, res, next) => {
  try {
    const users = await userService.list();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id_user = req.params.id;
    const user = await userService.getById(id_user);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Alias ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/', validateDto(CreateUserDto), async (req, res, next) => {
  try {
    const userData = (req as any).dto as CreateUserDto;
    const saved = await userService.create(userData);
    res.status(201).json(saved);
  } catch (err: any) {
    if (err.message.includes('ya está en uso')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Alias o email ya existe
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', validateDto(UpdateUserDto), async (req, res, next) => {
  try {
    const id_user = req.params.id;
    const userData = (req as any).dto as UpdateUserDto;

    const saved = await userService.update(id_user, userData);
    if (!saved) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(saved);
  } catch (err: any) {
    if (err.message.includes('ya está en uso')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id_user = req.params.id;
    const success = await userService.remove(id_user);
    
    if (!success) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(204).send(); // 204 No Content
  } catch (err) {
    next(err);
  }
});

export default router;
