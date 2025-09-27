/**
 * CONTROLLER = define rutas HTTP y usa el repositorio de TypeORM.
 * Repositorio: provee métodos de alto nivel (find, findOne, save, delete, etc.)
 * Esto es lo que muestra claramente "qué hace un ORM": operas con objetos,
 * no escribes SQL manual para cada CRUD.
 */
import { Router } from 'express';
import { AppDataSource } from '../../config/data-source';
import { User } from './user.entity';
import { validateDto } from '../../common/validate-dto';
import { CreateUserDto, UpdateUserDto } from './user.dto';

const router = Router();

// Función helper para obtener el repositorio de la entidad.
// Un "Repository<User>" expone métodos CRUD ya implementados por TypeORM.
const repo = () => AppDataSource.getRepository(User);

/**
 * GET /api/users
 * Lista todos los usuarios.
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
 * GET /api/users/:id
 * Obtiene un usuario por ID.
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
 * POST /api/users
 * Crea un usuario (valida DTO antes).
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
 * PUT /api/users/:id
 * Reemplaza alias/role del usuario (valida DTO).
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
      return res.status(409).json({ message: 'Alias already exists' });
    }
    next(err);
  }
});

/**
 * DELETE /api/users/:id
 * Elimina un usuario por ID.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const result = await repo().delete(id);
    // result.affected = cantidad de filas afectadas
    if (!result.affected) return res.status(404).json({ message: 'User not found' });

    res.status(204).send(); // 204 No Content
  } catch (err) {
    next(err);
  }
});

export default router;
