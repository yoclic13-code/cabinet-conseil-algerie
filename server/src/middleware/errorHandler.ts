import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { env } from '../config/env';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, 'Route introuvable', 'ROUTE_NOT_FOUND'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    });
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({
      message: 'JSON invalide',
      code: 'INVALID_JSON',
    });
  }

  // Multer / body-parser errors with status
  if (err && typeof err === 'object' && 'status' in err && 'type' in err) {
    const status = Number((err as { status?: number }).status) || 400;
    const type = String((err as { type?: string }).type);
    if (type === 'entity.parse.failed') {
      return res.status(400).json({
        message: 'JSON invalide',
        code: 'INVALID_JSON',
      });
    }
    if (status >= 400 && status < 500) {
      return res.status(status).json({
        message: err instanceof Error ? err.message : 'Requête invalide',
        code: 'BAD_REQUEST',
      });
    }
  }

  // Multer errors
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code);
    if (code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: `Fichier trop volumineux (max ${env.MAX_UPLOAD_SIZE_MB} Mo)`,
        code: 'FILE_TOO_LARGE',
      });
    }
  }

  // eslint-disable-next-line no-console
  console.error('[error]', err);

  return res.status(500).json({
    message: env.isDev && err instanceof Error ? err.message : 'Erreur serveur interne',
    code: 'INTERNAL_ERROR',
  });
}
