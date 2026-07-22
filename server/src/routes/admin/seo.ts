import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';

const router = Router();

const seoSchema = z.object({
  pageId: z.string().min(1),
  titleFR: z.string().min(1).max(70),
  titleEN: z.string().min(1).max(70),
  descriptionFR: z.string().min(1).max(160),
  descriptionEN: z.string().min(1).max(160),
  ogImage: z.string().max(500).optional().nullable(),
});

router.get('/', async (_req, res, next) => {
  try {
    const data = await prisma.seoMeta.findMany({ include: { page: true } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/by-page/:pageId', async (req, res, next) => {
  try {
    const data = await prisma.seoMeta.findUnique({ where: { pageId: req.params.pageId } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const body = seoSchema.parse(req.body);
    assertFound(await prisma.page.findUnique({ where: { id: body.pageId } }), 'Page introuvable');

    const data = await prisma.seoMeta.upsert({
      where: { pageId: body.pageId },
      create: {
        pageId: body.pageId,
        titleFR: body.titleFR,
        titleEN: body.titleEN,
        descriptionFR: body.descriptionFR,
        descriptionEN: body.descriptionEN,
        ogImage: body.ogImage ?? null,
      },
      update: {
        titleFR: body.titleFR,
        titleEN: body.titleEN,
        descriptionFR: body.descriptionFR,
        descriptionEN: body.descriptionEN,
        ogImage: body.ogImage ?? null,
      },
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
