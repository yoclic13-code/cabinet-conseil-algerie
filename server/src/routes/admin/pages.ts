import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { serializeSection } from '../../lib/sectionType';
import { slugify } from '../../utils/text';

const router = Router();

const pageSchema = z.object({
  slug: z.string().min(1).max(120).optional(),
  titreHint: z.string().optional(),
  ordre: z.number().int().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { ordre: 'asc' },
      include: {
        seoMeta: true,
        sections: { orderBy: { ordre: 'asc' } },
        _count: { select: { sections: true } },
      },
    });

    res.json({
      data: pages.map((p) => ({
        ...p,
        sections: p.sections.map(serializeSection),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = pageSchema.parse(req.body);
    const slug = body.slug || slugify(body.titreHint || `page-${Date.now()}`);

    const maxOrdre = await prisma.page.aggregate({ _max: { ordre: true } });
    const page = await prisma.page.create({
      data: {
        slug,
        ordre: body.ordre ?? (maxOrdre._max.ordre ?? -1) + 1,
      },
    });

    res.status(201).json({ data: page });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = pageSchema.parse(req.body);
    assertFound(await prisma.page.findUnique({ where: { id: req.params.id } }), 'Page introuvable');

    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: {
        ...(body.slug ? { slug: body.slug } : {}),
        ...(body.ordre != null ? { ordre: body.ordre } : {}),
      },
    });

    res.json({ data: page });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    assertFound(await prisma.page.findUnique({ where: { id: req.params.id } }), 'Page introuvable');
    await prisma.page.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
