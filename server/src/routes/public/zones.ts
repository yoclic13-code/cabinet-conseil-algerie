import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { shortPublicCache } from '../../middleware/cache';

const router = Router();

router.get('/', shortPublicCache, async (_req, res, next) => {
  try {
    const data = await prisma.zoneIntervention.findMany({ orderBy: { ordre: 'asc' } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
