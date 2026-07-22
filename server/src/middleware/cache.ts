import type { NextFunction, Request, Response } from 'express';

/**
 * Cache HTTP court pour les routes publiques (lecture seule).
 * max-age=60s, stale-while-revalidate=120s
 */
export function shortPublicCache(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  next();
}
