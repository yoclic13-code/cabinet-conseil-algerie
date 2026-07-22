import { Router } from 'express';
import { z } from 'zod';
import { EvenementStatut } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { slugify } from '../../utils/text';
import { computeEvenementStatut } from '../../utils/evenement';

const router = Router();

const evenementSchema = z.object({
  titreFR: z.string().min(1).max(255),
  titreEN: z.string().min(1).max(255),
  descriptionFR: z.string().min(1),
  descriptionEN: z.string().min(1),
  compteRenduFR: z.string().optional().nullable(),
  compteRenduEN: z.string().optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  dateDebut: z.string().datetime(),
  dateFin: z.string().datetime().optional().nullable(),
  lieu: z.string().min(1).max(255),
  lienInscription: z.string().max(500).optional().nullable(),
  statut: z.nativeEnum(EvenementStatut).optional(),
  slug: z.string().min(1).max(180).optional(),
});

const evenementUpdateSchema = evenementSchema.partial();

async function uniqueEventSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || `evenement-${Date.now()}`;
  let i = 0;
  while (true) {
    const candidate = i === 0 ? slug : `${slug}-${i}`;
    const existing = await prisma.evenement.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
  }
}

router.get('/', async (_req, res, next) => {
  try {
    const data = await prisma.evenement.findMany({ orderBy: { dateDebut: 'desc' } });
    res.json({
      data: data.map((e) => ({
        ...e,
        statut: computeEvenementStatut(e.dateDebut, e.dateFin, e.statut),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const evenement = assertFound(
      await prisma.evenement.findUnique({ where: { id: req.params.id } }),
      'Événement introuvable',
    );
    res.json({
      data: {
        ...evenement,
        statut: computeEvenementStatut(
          evenement.dateDebut,
          evenement.dateFin,
          evenement.statut,
        ),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = evenementSchema.parse(req.body);
    const dateDebut = new Date(body.dateDebut);
    const dateFin = body.dateFin ? new Date(body.dateFin) : null;
    const statut =
      body.statut === 'annule'
        ? 'annule'
        : computeEvenementStatut(dateDebut, dateFin, body.statut);

    const evenement = await prisma.evenement.create({
      data: {
        titreFR: body.titreFR,
        titreEN: body.titreEN,
        descriptionFR: body.descriptionFR,
        descriptionEN: body.descriptionEN,
        compteRenduFR: body.compteRenduFR ?? null,
        compteRenduEN: body.compteRenduEN ?? null,
        image: body.image ?? null,
        dateDebut,
        dateFin,
        lieu: body.lieu,
        lienInscription: body.lienInscription ?? null,
        statut,
        slug: await uniqueEventSlug(body.slug || body.titreFR),
      },
    });

    res.status(201).json({ data: evenement });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = evenementUpdateSchema.parse(req.body);
    const existing = assertFound(
      await prisma.evenement.findUnique({ where: { id: req.params.id } }),
      'Événement introuvable',
    );

    const dateDebut = body.dateDebut ? new Date(body.dateDebut) : existing.dateDebut;
    const dateFin =
      body.dateFin !== undefined
        ? body.dateFin
          ? new Date(body.dateFin)
          : null
        : existing.dateFin;

    const statut =
      body.statut === 'annule'
        ? 'annule'
        : body.statut || body.dateDebut || body.dateFin !== undefined
          ? computeEvenementStatut(dateDebut, dateFin, body.statut ?? existing.statut)
          : existing.statut;

    const evenement = await prisma.evenement.update({
      where: { id: req.params.id },
      data: {
        ...(body.titreFR != null ? { titreFR: body.titreFR } : {}),
        ...(body.titreEN != null ? { titreEN: body.titreEN } : {}),
        ...(body.descriptionFR != null ? { descriptionFR: body.descriptionFR } : {}),
        ...(body.descriptionEN != null ? { descriptionEN: body.descriptionEN } : {}),
        ...(body.compteRenduFR !== undefined ? { compteRenduFR: body.compteRenduFR } : {}),
        ...(body.compteRenduEN !== undefined ? { compteRenduEN: body.compteRenduEN } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.dateDebut ? { dateDebut } : {}),
        ...(body.dateFin !== undefined ? { dateFin } : {}),
        ...(body.lieu != null ? { lieu: body.lieu } : {}),
        ...(body.lienInscription !== undefined ? { lienInscription: body.lienInscription } : {}),
        statut,
        ...(body.slug || body.titreFR
          ? { slug: await uniqueEventSlug(body.slug || body.titreFR || existing.titreFR, existing.id) }
          : {}),
      },
    });

    res.json({ data: evenement });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    assertFound(await prisma.evenement.findUnique({ where: { id: req.params.id } }), 'Événement introuvable');
    await prisma.evenement.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
