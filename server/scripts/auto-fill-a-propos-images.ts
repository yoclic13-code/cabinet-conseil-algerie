/**
 * Import Freepik — page À propos (hero + image-texte « Notre approche » uniquement).
 * Usage: npx ts-node --transpile-only scripts/auto-fill-a-propos-images.ts --execute
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { prisma } from '../src/lib/prisma';
import { toApiSectionType } from '../src/lib/sectionType';
import { searchAndImportBest } from '../src/services/freepikImport';
import { isPlaceholderUrl, type ImageSearchSpec } from '../src/services/imageKeywords';
import { KEYWORDS_A_PROPOS } from '../src/services/imageKeywordsAPropos';
import { FreepikError } from '../src/services/freepik';

const EXECUTE = process.argv.includes('--execute');
const stats = { imported: 0, skipped: 0, failed: 0, noResult: 0 };

type JsonObj = Record<string, unknown>;

const [SPEC_HERO, SPEC_APPROCHE] = KEYWORDS_A_PROPOS;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function logSkip(target: string, reason: string) {
  console.log(`⊘ ${target} — ignoré : ${reason}`);
  stats.skipped += 1;
}

async function importOne(spec: ImageSearchSpec) {
  console.log(`→ ${spec.target}`);
  console.log(`  term: ${spec.term}`);
  try {
    const result = await searchAndImportBest(spec.term, {
      orientation: spec.orientation,
      color: spec.color,
      altFR: spec.altFR,
      altEN: spec.altEN,
    });
    if (!result) {
      console.warn(`  ⚠ Aucun résultat`);
      stats.noResult += 1;
      return null;
    }
    console.log(`  ✓ ${result.asset.url} (Freepik #${result.resource.id})`);
    stats.imported += 1;
    return result.asset.url;
  } catch (err) {
    stats.failed += 1;
    if (err instanceof FreepikError) {
      console.error(`  ✗ [${err.code}] ${err.message}`);
    } else if (err instanceof Error) {
      console.error(`  ✗ ${err.message}`);
    } else {
      console.error(`  ✗`, err);
    }
    return null;
  } finally {
    await sleep(1200);
  }
}

async function main() {
  console.log('\n=== Plan À propos (2 imports) ===\n');
  for (const row of KEYWORDS_A_PROPOS) {
    console.log(`- ${row.target}`);
    console.log(`  ${row.term}\n`);
  }

  if (!EXECUTE) {
    console.log('Relancez avec --execute pour importer.\n');
    return;
  }

  const page = await prisma.page.findFirst({ where: { slug: 'a-propos' } });
  if (!page) {
    console.error('Page a-propos introuvable');
    process.exit(1);
  }

  const sections = await prisma.section.findMany({
    where: { pageId: page.id },
    orderBy: { ordre: 'asc' },
  });

  console.log('=== Import Freepik (À propos) ===\n');

  for (const section of sections) {
    const apiType = toApiSectionType(section.type);
    const fr = (section.contenuFR ?? {}) as JsonObj;
    const en = (section.contenuEN ?? {}) as JsonObj;

    if (apiType === 'page-hero') {
      if (!isPlaceholderUrl(String(fr.imageUrl ?? ''))) {
        logSkip(SPEC_HERO.target, 'image déjà définie');
        continue;
      }
      const url = await importOne(SPEC_HERO);
      if (!url) continue;
      await prisma.section.update({
        where: { id: section.id },
        data: {
          contenuFR: { ...fr, imageUrl: url },
          contenuEN: { ...en, imageUrl: url },
        },
      });
    }

    if (apiType === 'image-texte') {
      if (!isPlaceholderUrl(String(fr.imageUrl ?? ''))) {
        logSkip(SPEC_APPROCHE.target, 'image déjà définie');
        continue;
      }
      const url = await importOne(SPEC_APPROCHE);
      if (!url) continue;
      await prisma.section.update({
        where: { id: section.id },
        data: {
          contenuFR: { ...fr, imageUrl: url },
          contenuEN: { ...en, imageUrl: url },
        },
      });
    }
  }

  console.log('\n=== Bilan ===');
  console.log(`  Importés : ${stats.imported}`);
  console.log(`  Ignorés  : ${stats.skipped}`);
  console.log(`  Sans résultat : ${stats.noResult}`);
  console.log(`  Échecs   : ${stats.failed}`);
  if (stats.failed > 0 || stats.noResult > 0) process.exitCode = 1;
  console.log('\nTerminé.\n');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
