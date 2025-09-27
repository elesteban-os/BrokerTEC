/**
 * Middleware reutilizable para validar DTOs en Express.
 * - Convierte req.body → instancia del DTO.
 * - Valida con class-validator.
 * - Si hay errores, devuelve 400; si no, adjunta dto saneado en req.
 */
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export const validateDto = <T extends object>(cls: new () => T) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(cls, req.body) as T;
    const errors = await validate(dto as any, {
      whitelist: true,            // quita campos no definidos en el DTO
      forbidNonWhitelisted: true, // error si mandan campos desconocidos
    });
    if (errors.length) {
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }
    (req as any).dto = dto; // guardamos el dto validado para el handler
    next();
  };
