import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { shortPublicCache } from '../../middleware/cache';
import { computeEvenementStatut } from '../../utils/evenement';

const router = Router();

router.get('/', shortPublicCache, async (_req, res, next) => {
  try {
    const items = await prisma.evenement.findMany({
      where: { statut: { not: 'annule' } },
      orderBy: { dateDebut: 'desc' },
    });

    // Recalcule à la lecture (sans persister) pour rester cohérent
    const data = items.map((ev) => ({
      ...ev,
      statut: computeEvenementStatut(ev.dateDebut, ev.dateFin, ev.statut),
    }));

    const aVenir = data
      .filter((e) => e.statut === 'a_venir')
      .sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime());
    const passes = data.filter((e) => e.statut === 'passe');

    res.json({ data: [...aVenir, ...passes] });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', shortPublicCache, async (req, res, next) => {
  try {
    const evenement = assertFound(
      await prisma.evenement.findUnique({ where: { slug: req.params.slug } }),
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

export default router;
