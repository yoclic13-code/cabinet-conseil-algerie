import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { shortPublicCache } from '../../middleware/cache';

const router = Router();

router.get('/', shortPublicCache, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const categorie = typeof req.query.categorie === 'string' ? req.query.categorie : undefined;
    const skip = (page - 1) * limit;

    const where = {
      statut: 'publie' as const,
      datePublication: { lte: new Date() },
      ...(categorie ? { categorie } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { datePublication: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          titreFR: true,
          titreEN: true,
          slug: true,
          extraitFR: true,
          extraitEN: true,
          imageCouverture: true,
          categorie: true,
          tags: true,
          auteur: true,
          datePublication: true,
          tempsLecture: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    res.json({
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', shortPublicCache, async (req, res, next) => {
  try {
    const article = assertFound(
      await prisma.article.findFirst({
        where: {
          slug: req.params.slug,
          statut: 'publie',
          datePublication: { lte: new Date() },
        },
      }),
      'Article introuvable',
    );
    res.json({ data: article });
  } catch (err) {
    next(err);
  }
});

export default router;
