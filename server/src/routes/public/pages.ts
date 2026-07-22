import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { serializeSection } from '../../lib/sectionType';
import { shortPublicCache } from '../../middleware/cache';

const router = Router();

router.get('/', shortPublicCache, async (_req, res, next) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { ordre: 'asc' },
      include: {
        seoMeta: true,
        sections: {
          where: { visible: true },
          orderBy: { ordre: 'asc' },
        },
      },
    });

    res.json({
      data: pages.map((page) => ({
        ...page,
        sections: page.sections.map(serializeSection),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', shortPublicCache, async (req, res, next) => {
  try {
    const page = assertFound(
      await prisma.page.findUnique({
        where: { slug: req.params.slug },
        include: {
          seoMeta: true,
          sections: {
            where: { visible: true },
            orderBy: { ordre: 'asc' },
          },
        },
      }),
      'Page introuvable',
    );

    res.json({
      data: {
        ...page,
        sections: page.sections.map(serializeSection),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
