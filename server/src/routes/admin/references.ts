import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';

const router = Router();

const schema = z.object({
  nom: z.string().min(1).max(150),
  logo: z.string().min(1).max(500),
  url: z.string().max(500).optional().nullable(),
  ordre: z.number().int().optional(),
});

const orderSchema = z.object({
  items: z.array(z.object({ id: z.string(), ordre: z.number().int().min(0) })).min(1),
});

router.get('/', async (_req, res, next) => {
  try {
    res.json({ data: await prisma.reference.findMany({ orderBy: { ordre: 'asc' } }) });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const maxOrdre = await prisma.reference.aggregate({ _max: { ordre: true } });
    const data = await prisma.reference.create({
      data: {
        nom: body.nom,
        logo: body.logo,
        url: body.url ?? null,
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
        prisma.reference.update({ where: { id: item.id }, data: { ordre: item.ordre } }),
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
    assertFound(await prisma.reference.findUnique({ where: { id: req.params.id } }), 'Référence introuvable');
    const data = await prisma.reference.update({ where: { id: req.params.id }, data: body });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    assertFound(await prisma.reference.findUnique({ where: { id: req.params.id } }), 'Référence introuvable');
    await prisma.reference.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
