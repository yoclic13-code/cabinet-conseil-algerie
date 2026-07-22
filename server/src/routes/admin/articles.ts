import { Router } from 'express';
import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { estimateReadingTimeMinutes, jsonToPlainText, slugify } from '../../utils/text';

const router = Router();

const articleSchema = z.object({
  titreFR: z.string().min(1).max(255),
  titreEN: z.string().min(1).max(255),
  slug: z.string().min(1).max(180).optional(),
  extraitFR: z.string().min(1),
  extraitEN: z.string().min(1),
  contenuFR: z.unknown(),
  contenuEN: z.unknown(),
  imageCouverture: z.string().max(500).optional().nullable(),
  categorie: z.string().min(1).max(100),
  tags: z.array(z.string()).optional(),
  auteur: z.string().min(1).max(120),
  datePublication: z.string().datetime().optional().nullable(),
  statut: z.nativeEnum(ArticleStatus).optional(),
  seoTitleFR: z.string().max(70).optional().nullable(),
  seoTitleEN: z.string().max(70).optional().nullable(),
  seoDescriptionFR: z.string().max(160).optional().nullable(),
  seoDescriptionEN: z.string().max(160).optional().nullable(),
});

const articleUpdateSchema = articleSchema.partial();

async function uniqueArticleSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || `article-${Date.now()}`;
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.article.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

router.get('/', async (req, res, next) => {
  try {
    const statut =
      typeof req.query.statut === 'string' &&
      Object.values(ArticleStatus).includes(req.query.statut as ArticleStatus)
        ? (req.query.statut as ArticleStatus)
        : undefined;

    const data = await prisma.article.findMany({
      where: statut ? { statut } : undefined,
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({ where: { id: req.params.id } });
    assertFound(article, 'Article introuvable');
    res.json({ data: article });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = articleSchema.parse(req.body);
    const slug = await uniqueArticleSlug(body.slug || body.titreFR);
    const tempsLecture = estimateReadingTimeMinutes(
      body.extraitFR,
      jsonToPlainText(body.contenuFR),
    );

    const article = await prisma.article.create({
      data: {
        titreFR: body.titreFR,
        titreEN: body.titreEN,
        slug,
        extraitFR: body.extraitFR,
        extraitEN: body.extraitEN,
        contenuFR: body.contenuFR as object,
        contenuEN: body.contenuEN as object,
        imageCouverture: body.imageCouverture ?? null,
        categorie: body.categorie,
        tags: body.tags ?? [],
        auteur: body.auteur,
        datePublication: body.datePublication ? new Date(body.datePublication) : null,
        statut: body.statut ?? 'brouillon',
        tempsLecture,
        seoTitleFR: body.seoTitleFR ?? null,
        seoTitleEN: body.seoTitleEN ?? null,
        seoDescriptionFR: body.seoDescriptionFR ?? null,
        seoDescriptionEN: body.seoDescriptionEN ?? null,
      },
    });

    res.status(201).json({ data: article });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const source = assertFound(
      await prisma.article.findUnique({ where: { id: req.params.id } }),
      'Article introuvable',
    );

    const slug = await uniqueArticleSlug(`${source.slug}-copie`);
    const article = await prisma.article.create({
      data: {
        titreFR: `${source.titreFR} (copie)`,
        titreEN: `${source.titreEN} (copy)`,
        slug,
        extraitFR: source.extraitFR,
        extraitEN: source.extraitEN,
        contenuFR: source.contenuFR as object,
        contenuEN: source.contenuEN as object,
        imageCouverture: source.imageCouverture,
        categorie: source.categorie,
        tags: source.tags as object,
        auteur: source.auteur,
        datePublication: null,
        statut: 'brouillon',
        tempsLecture: source.tempsLecture,
        seoTitleFR: source.seoTitleFR,
        seoTitleEN: source.seoTitleEN,
        seoDescriptionFR: source.seoDescriptionFR,
        seoDescriptionEN: source.seoDescriptionEN,
      },
    });

    res.status(201).json({ data: article });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = articleUpdateSchema.parse(req.body);
    const existing = assertFound(
      await prisma.article.findUnique({ where: { id: req.params.id } }),
      'Article introuvable',
    );

    const slug = body.slug
      ? await uniqueArticleSlug(body.slug, existing.id)
      : body.titreFR
        ? await uniqueArticleSlug(body.titreFR, existing.id)
        : undefined;

    const tempsLecture =
      body.extraitFR != null || body.contenuFR != null
        ? estimateReadingTimeMinutes(
            body.extraitFR ?? existing.extraitFR,
            jsonToPlainText(body.contenuFR ?? existing.contenuFR),
          )
        : undefined;

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        ...(body.titreFR != null ? { titreFR: body.titreFR } : {}),
        ...(body.titreEN != null ? { titreEN: body.titreEN } : {}),
        ...(slug ? { slug } : {}),
        ...(body.extraitFR != null ? { extraitFR: body.extraitFR } : {}),
        ...(body.extraitEN != null ? { extraitEN: body.extraitEN } : {}),
        ...(body.contenuFR !== undefined ? { contenuFR: body.contenuFR as object } : {}),
        ...(body.contenuEN !== undefined ? { contenuEN: body.contenuEN as object } : {}),
        ...(body.imageCouverture !== undefined ? { imageCouverture: body.imageCouverture } : {}),
        ...(body.categorie != null ? { categorie: body.categorie } : {}),
        ...(body.tags != null ? { tags: body.tags } : {}),
        ...(body.auteur != null ? { auteur: body.auteur } : {}),
        ...(body.datePublication !== undefined
          ? { datePublication: body.datePublication ? new Date(body.datePublication) : null }
          : {}),
        ...(body.statut != null ? { statut: body.statut } : {}),
        ...(tempsLecture != null ? { tempsLecture } : {}),
        ...(body.seoTitleFR !== undefined ? { seoTitleFR: body.seoTitleFR } : {}),
        ...(body.seoTitleEN !== undefined ? { seoTitleEN: body.seoTitleEN } : {}),
        ...(body.seoDescriptionFR !== undefined
          ? { seoDescriptionFR: body.seoDescriptionFR }
          : {}),
        ...(body.seoDescriptionEN !== undefined
          ? { seoDescriptionEN: body.seoDescriptionEN }
          : {}),
      },
    });

    res.json({ data: article });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    assertFound(await prisma.article.findUnique({ where: { id: req.params.id } }), 'Article introuvable');
    await prisma.article.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
