import { Router } from 'express';
import { z } from 'zod';
import { LeadStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import { toCsv } from '../../utils/csv';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const statut =
      typeof req.query.statut === 'string' &&
      Object.values(LeadStatus).includes(req.query.statut as LeadStatus)
        ? (req.query.statut as LeadStatus)
        : undefined;

    const data = await prisma.contactLead.findMany({
      where: statut ? { statut } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/export.csv', async (req, res, next) => {
  try {
    const statut =
      typeof req.query.statut === 'string' &&
      Object.values(LeadStatus).includes(req.query.statut as LeadStatus)
        ? (req.query.statut as LeadStatus)
        : undefined;

    const leads = await prisma.contactLead.findMany({
      where: statut ? { statut } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const csv = toCsv(
      leads.map((l) => ({
        id: l.id,
        service: l.service,
        zone: l.zone,
        secteur: l.secteur,
        description: l.description,
        nom: l.nom,
        societe: l.societe ?? '',
        email: l.email,
        telephone: l.telephone ?? '',
        statut: l.statut,
        createdAt: l.createdAt.toISOString(),
      })),
      [
        'id',
        'service',
        'zone',
        'secteur',
        'description',
        'nom',
        'societe',
        'email',
        'telephone',
        'statut',
        'createdAt',
      ],
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = z
      .object({
        statut: z.nativeEnum(LeadStatus),
      })
      .parse(req.body);

    assertFound(await prisma.contactLead.findUnique({ where: { id: req.params.id } }), 'Lead introuvable');
    const data = await prisma.contactLead.update({
      where: { id: req.params.id },
      data: { statut: body.statut },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    assertFound(await prisma.contactLead.findUnique({ where: { id: req.params.id } }), 'Lead introuvable');
    await prisma.contactLead.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
