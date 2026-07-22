import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../lib/errors';
import { uploadMiddleware, processAndSaveImage } from '../../services/upload';

const router = Router();

const metaSchema = z.object({
  altFR: z.string().max(255).optional(),
  altEN: z.string().max(255).optional(),
});

router.post('/', uploadMiddleware.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'Fichier image requis (champ « file »)', 'FILE_REQUIRED');
    }

    const meta = metaSchema.parse({
      altFR: req.body?.altFR,
      altEN: req.body?.altEN,
    });

    const saved = await processAndSaveImage(req.file);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: saved.url,
        altFR: meta.altFR ?? null,
        altEN: meta.altEN ?? null,
        source: 'upload',
      },
    });

    res.status(201).json({
      data: {
        ...asset,
        width: saved.width,
        height: saved.height,
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

export default router;
