import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import {
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signAdminToken,
} from '../../middleware/auth';
import { loginRateLimit } from '../../middleware/rateLimit';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });

    if (!user) {
      throw new AppError(401, 'Identifiants invalides', 'INVALID_CREDENTIALS');
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      throw new AppError(401, 'Identifiants invalides', 'INVALID_CREDENTIALS');
    }

    const token = signAdminToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new AppError(401, 'Utilisateur introuvable', 'UNAUTHORIZED');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
