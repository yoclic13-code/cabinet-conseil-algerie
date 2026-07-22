import { Router } from 'express';
import { z } from 'zod';
import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { prisma } from '../../lib/prisma';
import {
  FreepikError,
  searchFreepikResources,
  type FreepikResource,
} from '../../services/freepik';
import { importFreepikResourceToMedia } from '../../services/freepikImport';

const router = Router();

const searchSchema = z.object({
  q: z.string().min(2).max(200),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  orientation: z.enum(['landscape', 'portrait', 'square', 'panoramic']).optional(),
  color: z.enum(['black', 'gray', 'white']).optional(),
});

const importSchema = z.object({
  resourceId: z.coerce.number().int().positive(),
  altFR: z.string().max(255).optional(),
  altEN: z.string().max(255).optional(),
  /** Payload complet renvoyé par la recherche (évite un 2e appel API) */
  resource: z
    .object({
      id: z.number(),
      title: z.string(),
      url: z.string(),
      licenses: z.array(z.object({ type: z.string(), url: z.string() })),
      author: z
        .object({
          id: z.number(),
          name: z.string(),
        })
        .optional(),
    })
    .optional(),
});

router.get('/freepik-search', async (req, res, next) => {
  try {
    if (!env.freepikConfigured) {
      throw new AppError(503, 'Intégration Freepik non configurée', 'FREEPIK_NOT_CONFIGURED');
    }

    const query = searchSchema.parse(req.query);
    const result = await searchFreepikResources(query.q, {
      page: query.page,
      limit: query.limit,
      orientation: query.orientation,
      color: query.color,
      contentType: 'photo',
      order: 'relevance',
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/freepik-import', async (req, res, next) => {
  try {
    if (!env.freepikConfigured) {
      throw new AppError(503, 'Intégration Freepik non configurée', 'FREEPIK_NOT_CONFIGURED');
    }

    const body = importSchema.parse(req.body);
    const resource: FreepikResource = body.resource
      ? (body.resource as FreepikResource)
      : {
          id: body.resourceId,
          title: body.altFR ?? 'Freepik',
          url: '',
          licenses: [],
        };

    const imported = await importFreepikResourceToMedia(resource, {
      resourceId: body.resourceId,
      altFR: body.altFR,
      altEN: body.altEN,
    });

    res.status(201).json({
      data: {
        ...imported.asset,
        width: imported.saved.width,
        height: imported.saved.height,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const data = await prisma.mediaAsset.findMany({ orderBy: { uploadedAt: 'desc' } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export { FreepikError };
export default router;
