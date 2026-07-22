import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';

const router = Router();

const schema = z.object({
  nomFR: z.string().min(1).max(150),
  nomEN: z.string().min(1).max(150),
  icone: z.string().max(255).optional().nullable(),
  descriptionFR: z.string().optional().nullable(),
  descriptionEN: z.string().optional().nullable(),
  ordre: z.number().int().optional(),
});

const orderSchema = z.object({
  items: z.array(z.object({ id: z.string(), ordre: z.number().int().min(0) })).min(1),
});

router.get('/', async (_req, res, next) => {
  try {
    res.json({ data: await prisma.secteurActivite.findMany({ orderBy: { ordre: 'asc' } }) });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const maxOrdre = await prisma.secteurActivite.aggregate({ _max: { ordre: true } });
    const data = await prisma.secteurActivite.create({
      data: {
        ...body,
        icone: body.icone ?? null,
        descriptionFR: body.descriptionFR ?? null,
        descriptionEN: body.descriptionEN ?? null,
        ordre: body.ordre ?? (maxOrdre._max.ordre ?? -1) + 1,
      },
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

router.patch('/order', async (req, res, next) => {
  try {
    const { items } = orderSchema.parse(req.body);
    await prisma.$transaction(
      items.map((item) =>
        prisma.secteurActivite.update({ where: { id: item.id }, data: { ordre: item.ordre } }),
      ),
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = schema.partial().parse(req.body);
    assertFound(await prisma.secteurActivite.findUnique({ where: { id: req.params.id } }), 'Secteur introuvable');
    const data = await prisma.secteurActivite.update({ where: { id: req.params.id }, data: body });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    assertFound(await prisma.secteurActivite.findUnique({ where: { id: req.params.id } }), 'Secteur introuvable');
    await prisma.secteurActivite.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
