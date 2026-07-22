import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import type { UserRole } from '@prisma/client';

export interface AuthPayload {
  sub: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const COOKIE_NAME = 'admin_token';

export function signAdminToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: env.isDev ? 'lax' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: env.isDev ? 'lax' : 'strict',
    path: '/',
  });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.[COOKIE_NAME] as string | undefined;
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = cookieToken || bearer;

    if (!token) {
      throw new AppError(401, 'Authentification requise', 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError(401, 'Jeton invalide ou expiré', 'INVALID_TOKEN'));
  }
}
