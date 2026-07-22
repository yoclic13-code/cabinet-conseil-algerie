/**
 * Vérifie sync schema Prisma / base + test recherche/import Freepik.
 * Usage: node server/scripts/verify-freepik-setup.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE = process.env.API_URL || 'http://localhost:3001';

async function req(pathname, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  // 1. Vérifier colonnes DB via Prisma
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const cols = await prisma.$queryRaw`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'media_assets'
      ORDER BY ORDINAL_POSITION
    `;
    const names = cols.map((c) => c.COLUMN_NAME);
    console.log('\n[DB] Colonnes media_assets:', names.join(', '));

    const required = [
      'source',
      'freepik_id',
      'license_type',
      'license_url',
      'author_name',
      'author_id',
      'resource_title',
      'resource_page_url',
    ];
    const missing = required.filter((c) => !names.includes(c));
    if (missing.length) {
      console.error('[DB] ERREUR — colonnes manquantes:', missing.join(', '));
      console.error('       Lancez: cd server && npx prisma db push && npx prisma generate');
      process.exit(1);
    }
    console.log('[DB] OK — toutes les colonnes Freepik présentes');

    // Test create minimal (rollback via delete)
    const test = await prisma.mediaAsset.create({
      data: {
        url: '/uploads/_test-freepik-schema.webp',
        source: 'freepik',
        freepikId: 0,
        licenseType: 'test',
        licenseUrl: 'https://example.com',
        authorName: 'Test',
        resourceTitle: 'Schema test',
      },
    });
    await prisma.mediaAsset.delete({ where: { id: test.id } });
    console.log('[Prisma] OK — create MediaAsset avec source=freepik');
  } finally {
    await prisma.$disconnect();
  }

  // 2. Test API recherche + import (si serveur up)
  const login = await req('/api/admin/auth/login', {
    method: 'POST',
    body: { email: 'admin@cabinet-conseil.dz', password: 'Admin123!' },
  });
  if (!login.ok) {
    console.warn('\n[API] Serveur non joignable ou login échoué — skip tests API');
    return;
  }
  const token = login.data.token;

  const searches = [
    { label: 'pétrole pipeline', q: 'pétrole pipeline', orientation: 'landscape' },
    {
      label: 'image-texte Méthode',
      q: 'engineer audit report documentation plans industrial site muted tones professional neutral colors industrial',
      orientation: 'landscape',
    },
  ];

  for (const s of searches) {
    const params = new URLSearchParams({ q: s.q, orientation: s.orientation, limit: '5' });
    const search = await req(`/api/admin/media/freepik-search?${params}`, { token });
    if (!search.ok) {
      console.error(`\n[API] Recherche "${s.label}" échouée:`, search.status, search.data);
      continue;
    }
    const hits = search.data?.data ?? [];
    console.log(`\n[API] Recherche "${s.label}" → ${hits.length} résultat(s)`);
    for (const h of hits.slice(0, 3)) {
      console.log(`  - #${h.id} ${h.title}`);
    }

    const aiHits = hits.filter(
      (h) =>
        /generative\s*ai|ai\s*generated/i.test(h.title ?? '') ||
        /generative\s*ai|ai\s*generated/i.test(h.url ?? ''),
    );
    if (aiHits.length) {
      console.warn(`  ⚠ ${aiHits.length} résultat(s) potentiellement IA dans le top`);
    } else {
      console.log('  ✓ Aucun résultat IA évident dans le top');
    }

    const first = hits[0];
    if (!first) continue;

    const imp = await req('/api/admin/media/freepik-import', {
      method: 'POST',
      token,
      body: {
        resourceId: first.id,
        altFR: first.title,
        resource: first,
      },
    });
    if (imp.ok) {
      console.log(`  ✓ Import OK → ${imp.data.data.url} (source=${imp.data.data.source})`);
    } else {
      console.error(`  ✗ Import échoué:`, imp.status, imp.data);
    }
  }

  console.log('\nVérification terminée.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
