import 'dotenv/config';
import { prisma } from './lib/prisma';
import { env } from './config/env';

async function seed() {
  const email = env.ADMIN_EMAIL.toLowerCase();

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: env.ADMIN_PASSWORD_HASH,
      role: 'superadmin',
    },
    create: {
      email,
      passwordHash: env.ADMIN_PASSWORD_HASH,
      role: 'superadmin',
    },
  });

  const accueil = await prisma.page.upsert({
    where: { slug: 'accueil' },
    update: {},
    create: { slug: 'accueil', ordre: 0 },
  });

  await prisma.seoMeta.upsert({
    where: { pageId: accueil.id },
    update: {},
    create: {
      pageId: accueil.id,
      titleFR: 'Cabinet Conseil Algérie | QSE HSE Environnement',
      titleEN: 'Algeria Consulting Firm | QSE HSE Environment',
      descriptionFR:
        'Cabinet de conseil QSE, HSE et Environnement en Algérie, avec rayonnement Afrique et International.',
      descriptionEN:
        'QSE, HSE and Environment consulting firm based in Algeria, serving Africa and international markets.',
    },
  });

  const sectionCount = await prisma.section.count({ where: { pageId: accueil.id } });
  if (sectionCount === 0) {
    await prisma.section.create({
      data: {
        pageId: accueil.id,
        type: 'hero',
        ordre: 0,
        visible: true,
        contenuFR: {
          title: 'Maîtriser le risque, sécuriser la performance',
          subtitle: 'Conseil QSE / HSE / Environnement — Algérie, Afrique & International',
          ctaLabel: 'Nous contacter',
          ctaHref: '/contact',
        },
        contenuEN: {
          title: 'Master risk, secure performance',
          subtitle: 'QSE / HSE / Environment consulting — Algeria, Africa & International',
          ctaLabel: 'Contact us',
          ctaHref: '/contact',
        },
      },
    });
  }

  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        nomCabinet: 'Cabinet Conseil Algérie',
        baselineFR: 'Conseil QSE / HSE / Environnement — Algérie, Afrique & International',
        baselineEN: 'QSE / HSE / Environment consulting — Algeria, Africa & International',
        ville: 'Alger',
        pays: 'Algérie',
        email: 'contact@cabinet-conseil.dz',
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('[seed] Admin + page accueil + settings OK');
}

seed()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seed] Erreur:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
