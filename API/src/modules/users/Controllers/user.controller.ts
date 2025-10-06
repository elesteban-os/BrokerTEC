/**
 * CONTROLLER = define rutas HTTP y usa el repositorio de TypeORM.
 * Repositorio: provee métodos de alto nivel (find, findOne, save, delete, etc.)
 * Se opera con objetos evitando SQL manual para cada CRUD.
 */
import { Router } from 'express';
import { AppDataSource } from '../../../config/data-source';
import { User } from '../user.entity';
import { validateDto } from '../../../common/validate-dto';
import { CreateUserDto, UpdateUserDto } from '../DTOs/user.dto';

const router = Router();

// Función helper para obtener el repositorio de la entidad.
// Un "Repository<User>" expone métodos CRUD ya implementados por TypeORM.
const repo = () => AppDataSource.getRepository(User);

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
    const users = await repo().find();
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
 *           type: integer
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
    const id = Number(req.params.id);
    const user = await repo().findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
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
    const { alias, role } = (req as any).dto as CreateUserDto;

    // create() no inserta en BD, solo prepara el objeto
    const user = repo().create({ alias, role });

    // save() inserta/actualiza en BD según tenga PK o no
    const saved = await repo().save(user);

    res.status(201).json(saved);
  } catch (err: any) {
    // Si rompes la restricción única de alias, caerá aquí
    if (err?.code === 'EREQUEST' || err?.number === 2627 /* unique index */) {
      return res.status(409).json({ message: 'Alias already exists' });
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
 *           type: integer
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
 *         description: Alias ya existe
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', validateDto(UpdateUserDto), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { alias, role } = (req as any).dto as UpdateUserDto;

    const user = await repo().findOne({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // merge() aplica cambios al entity existente
    repo().merge(user, { alias, role });

    const saved = await repo().save(user);
    res.json(saved);
  } catch (err: any) {
    if (err?.code === 'EREQUEST' || err?.number === 2627) {
      return res.status(409).json({ message: 'Alias Existente' });
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
 *           type: integer
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
    const id = Number(req.params.id);

    const result = await repo().delete(id);
    // result.affected = cantidad de filas afectadas
    if (!result.affected) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(204).send(); // 204 No Content
  } catch (err) {
    next(err);
  }
});

export default router;
