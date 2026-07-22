import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { contactRateLimit } from '../../middleware/rateLimit';
import { sendContactConfirmation, sendContactNotification } from '../../services/mail';

const router = Router();

const contactSchema = z.object({
  service: z.string().min(2).max(80),
  zone: z.string().min(2).max(120),
  secteur: z.string().min(2).max(150),
  description: z.string().min(10).max(5000),
  nom: z.string().min(2).max(150),
  societe: z.string().max(150).optional().nullable(),
  email: z.string().email().max(255),
  telephone: z.string().max(40).optional().nullable(),
  /** Honeypot — doit rester vide */
  website: z.string().max(0).optional().default(''),
});

router.post('/', contactRateLimit, async (req, res, next) => {
  try {
    // Honeypot : bots remplissent souvent ce champ
    if (typeof req.body?.website === 'string' && req.body.website.length > 0) {
      // Réponse trompeuse « succès » sans persister
      return res.status(201).json({ ok: true });
    }

    const body = contactSchema.parse(req.body);

    const lead = await prisma.contactLead.create({
      data: {
        service: body.service,
        zone: body.zone,
        secteur: body.secteur,
        description: body.description,
        nom: body.nom,
        societe: body.societe ?? null,
        email: body.email.toLowerCase(),
        telephone: body.telephone ?? null,
      },
    });

    await Promise.allSettled([
      sendContactConfirmation({
        to: lead.email,
        nom: lead.nom,
        service: lead.service,
      }),
      sendContactNotification({
        service: lead.service,
        zone: lead.zone,
        secteur: lead.secteur,
        description: lead.description,
        nom: lead.nom,
        societe: lead.societe,
        email: lead.email,
        telephone: lead.telephone,
      }),
    ]).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          // eslint-disable-next-line no-console
          console.warn('[mail] Échec envoi (lead déjà enregistré):', result.reason);
        }
      }
    });

    res.status(201).json({
      ok: true,
      data: { id: lead.id },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
