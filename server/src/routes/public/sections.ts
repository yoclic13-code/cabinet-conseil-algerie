import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { serializeSection } from '../../lib/sectionType';
import { shortPublicCache } from '../../middleware/cache';

const router = Router();

/** Lecture publique des sections visibles (filtrable par pageId ou slug de page) */
router.get('/', shortPublicCache, async (req, res, next) => {
  try {
    const pageId = typeof req.query.pageId === 'string' ? req.query.pageId : undefined;
    const pageSlug = typeof req.query.pageSlug === 'string' ? req.query.pageSlug : undefined;

    let resolvedPageId = pageId;
    if (!resolvedPageId && pageSlug) {
      const page = await prisma.page.findUnique({ where: { slug: pageSlug } });
      resolvedPageId = page?.id;
    }

    const sections = await prisma.section.findMany({
      where: {
        visible: true,
        ...(resolvedPageId ? { pageId: resolvedPageId } : {}),
      },
      orderBy: { ordre: 'asc' },
    });

    res.json({ data: sections.map(serializeSection) });
  } catch (err) {
    next(err);
  }
});

export default router;
