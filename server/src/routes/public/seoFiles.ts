import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';

const router = Router();

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const base = env.PUBLIC_SITE_URL.replace(/\/$/, '');

    const [pages, articles, evenements] = await Promise.all([
      prisma.page.findMany({ select: { slug: true, updatedAt: true }, orderBy: { ordre: 'asc' } }),
      prisma.article.findMany({
        where: { statut: 'publie', datePublication: { lte: new Date() } },
        select: { slug: true, updatedAt: true, datePublication: true },
      }),
      prisma.evenement.findMany({
        where: { statut: { not: 'annule' } },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const urls: { loc: string; lastmod: Date; priority: string }[] = [
      ...pages.map((p) => ({
        loc: p.slug === 'accueil' ? `${base}/` : `${base}/${p.slug}`,
        lastmod: p.updatedAt,
        priority: p.slug === 'accueil' ? '1.0' : '0.8',
      })),
      ...articles.map((a) => ({
        loc: `${base}/actualites/${a.slug}`,
        lastmod: a.updatedAt,
        priority: '0.7',
      })),
      ...evenements.map((e) => ({
        loc: `${base}/evenements/${e.slug}`,
        lastmod: e.updatedAt,
        priority: '0.6',
      })),
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod.toISOString()}</lastmod>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml').send(body);
  } catch (err) {
    next(err);
  }
});

router.get('/feed.xml', async (_req, res, next) => {
  try {
    const base = env.PUBLIC_SITE_URL.replace(/\/$/, '');
    const settings = await prisma.settings.findFirst();
    const articles = await prisma.article.findMany({
      where: { statut: 'publie', datePublication: { lte: new Date() } },
      orderBy: { datePublication: 'desc' },
      take: 30,
    });

    const channelTitle = settings?.nomCabinet ?? 'Cabinet Conseil Algérie';
    const items = articles
      .map((a) => {
        const link = `${base}/actualites/${a.slug}`;
        const pubDate = (a.datePublication ?? a.createdAt).toUTCString();
        return `    <item>
      <title>${xmlEscape(a.titreFR)}</title>
      <link>${xmlEscape(link)}</link>
      <guid>${xmlEscape(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xmlEscape(a.extraitFR)}</description>
    </item>`;
      })
      .join('\n');

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(channelTitle)} — Actualités</title>
    <link>${xmlEscape(`${base}/actualites`)}</link>
    <description>Actualités QSE / HSE / Environnement — Algérie, Afrique &amp; International</description>
    <language>fr</language>
${items}
  </channel>
</rss>`;

    res.type('application/rss+xml').send(body);
  } catch (err) {
    next(err);
  }
});

router.get('/robots.txt', (_req, res) => {
  const base = env.PUBLIC_SITE_URL.replace(/\/$/, '');
  res.type('text/plain').send(`User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`);
});

export default router;
