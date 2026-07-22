import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

const router = Router();

const settingsSchema = z.object({
  nomCabinet: z.string().min(1).max(200),
  logoUrl: z.string().max(500).optional().nullable(),
  baselineFR: z.string().min(1).max(300),
  baselineEN: z.string().min(1).max(300),
  adresse: z.string().max(300).optional().nullable(),
  ville: z.string().max(120).optional().nullable(),
  codePostal: z.string().max(20).optional().nullable(),
  pays: z.string().max(100).optional().nullable(),
  telephone: z.string().max(40).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  linkedinUrl: z.string().max(300).optional().nullable(),
  facebookUrl: z.string().max(300).optional().nullable(),
  twitterUrl: z.string().max(300).optional().nullable(),
  youtubeUrl: z.string().max(300).optional().nullable(),
  googleSearchConsoleCode: z.string().max(120).optional().nullable(),
  googleAnalyticsId: z.string().max(40).optional().nullable(),
});

async function getOrCreateSettings() {
  const existing = await prisma.settings.findFirst();
  if (existing) return existing;
  return prisma.settings.create({
    data: {
      nomCabinet: 'Cabinet Conseil Algérie',
      baselineFR: 'Conseil QSE / HSE / Environnement — Algérie, Afrique & International',
      baselineEN: 'QSE / HSE / Environment consulting — Algeria, Africa & International',
      pays: 'Algérie',
    },
  });
}

router.get('/', async (_req, res, next) => {
  try {
    res.json({ data: await getOrCreateSettings() });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const body = settingsSchema.parse(req.body);
    const current = await getOrCreateSettings();
    const data = await prisma.settings.update({
      where: { id: current.id },
      data: body,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
