import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { assertFound } from '../../lib/errors';
import {
  SECTION_TYPES_API,
  serializeSection,
  toPrismaSectionType,
} from '../../lib/sectionType';

const router = Router();

const sectionBodySchema = z.object({
  pageId: z.string().min(1),
  type: z.enum(SECTION_TYPES_API),
  ordre: z.number().int().optional(),
  visible: z.boolean().optional(),
  contenuFR: z.unknown(),
  contenuEN: z.unknown(),
});

const sectionUpdateSchema = sectionBodySchema.partial().omit({ pageId: true }).extend({
  pageId: z.string().min(1).optional(),
});

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        ordre: z.number().int().min(0),
      }),
    )
    .min(1),
});

router.get('/', async (req, res, next) => {
  try {
    const pageId = typeof req.query.pageId === 'string' ? req.query.pageId : undefined;
    const includeHidden = req.query.includeHidden === 'true';

    const sections = await prisma.section.findMany({
      where: {
        ...(pageId ? { pageId } : {}),
        ...(includeHidden ? {} : { visible: true }),
      },
      orderBy: { ordre: 'asc' },
    });

    res.json({ data: sections.map(serializeSection) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const section = assertFound(
      await prisma.section.findUnique({ where: { id: req.params.id } }),
      'Section introuvable',
    );
    res.json({ data: serializeSection(section) });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = sectionBodySchema.parse(req.body);
    const page = await prisma.page.findUnique({ where: { id: body.pageId } });
    assertFound(page, 'Page introuvable');

    const maxOrdre = await prisma.section.aggregate({
      where: { pageId: body.pageId },
      _max: { ordre: true },
    });

    const section = await prisma.section.create({
      data: {
        pageId: body.pageId,
        type: toPrismaSectionType(body.type),
        ordre: body.ordre ?? (maxOrdre._max.ordre ?? -1) + 1,
        visible: body.visible ?? true,
        contenuFR: body.contenuFR as object,
        contenuEN: body.contenuEN as object,
      },
    });

    res.status(201).json({ data: serializeSection(section) });
  } catch (err) {
    next(err);
  }
});

router.patch('/order', async (req, res, next) => {
  try {
    const { items } = orderSchema.parse(req.body);

    await prisma.$transaction(
      items.map((item) =>
        prisma.section.update({
          where: { id: item.id },
          data: { ordre: item.ordre },
        }),
      ),
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = sectionUpdateSchema.parse(req.body);
    assertFound(
      await prisma.section.findUnique({ where: { id: req.params.id } }),
      'Section introuvable',
    );

    if (body.pageId) {
      assertFound(await prisma.page.findUnique({ where: { id: body.pageId } }), 'Page introuvable');
    }

    const section = await prisma.section.update({
      where: { id: req.params.id },
      data: {
        ...(body.pageId ? { pageId: body.pageId } : {}),
        ...(body.type ? { type: toPrismaSectionType(body.type) } : {}),
        ...(body.ordre != null ? { ordre: body.ordre } : {}),
        ...(body.visible != null ? { visible: body.visible } : {}),
        ...(body.contenuFR !== undefined ? { contenuFR: body.contenuFR as object } : {}),
        ...(body.contenuEN !== undefined ? { contenuEN: body.contenuEN as object } : {}),
      },
    });

    res.json({ data: serializeSection(section) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.section.findUnique({ where: { id: req.params.id } });
    assertFound(existing, 'Section introuvable');
    await prisma.section.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
