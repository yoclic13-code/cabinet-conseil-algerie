/**
 * Peuple les sections / secteurs avec des images Freepik pertinentes (one-shot).
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/auto-fill-images.ts --list
 *   npx ts-node --transpile-only scripts/auto-fill-images.ts --execute
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { prisma } from '../src/lib/prisma';
import { toApiSectionType } from '../src/lib/sectionType';
import { searchAndImportBest } from '../src/services/freepikImport';
import {
  KEYWORD_GRILLE_EXPERTISES,
  KEYWORD_HERO_ACCUEIL,
  KEYWORD_IMAGE_TEXTE_METHODE,
  buildDefaultKeywordPlan,
  expertiseItemKeywords,
  isPlaceholderUrl,
  secteurKeywords,
  type ImageSearchSpec,
} from '../src/services/imageKeywords';
import { FreepikError } from '../src/services/freepik';

const args = new Set(process.argv.slice(2));
const EXECUTE = args.has('--execute');
const LIST_ONLY = !EXECUTE;

type JsonObj = Record<string, unknown>;

const stats = { imported: 0, skipped: 0, failed: 0, noResult: 0 };

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function logSkip(target: string, reason: string) {
  console.log(`⊘ ${target} — ignoré : ${reason}`);
  stats.skipped += 1;
}

function printPlan(plan: ImageSearchSpec[]) {
  console.log('\n=== Plan mots-clés Freepik (validation) ===\n');
  console.log('| Cible | Requête (term) | Orientation | Filtre couleur | Style |');
  console.log('|-------|----------------|-------------|----------------|-------|');
  for (const row of plan) {
    const style = row.color ? 'monochrome' : 'couleur sobre';
    console.log(
      `| ${row.target} | \`${row.term}\` | ${row.orientation} | ${row.color ?? '—'} | ${style} |`,
    );
  }
  console.log(`\nTotal : ${plan.length} recherches prévues.\n`);
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
      console.warn(`  ⚠ Aucun résultat Freepik pour « ${spec.target} »`);
      stats.noResult += 1;
      return null;
    }

    console.log(`  ✓ ${result.asset.url} (Freepik #${result.resource.id})`);
    stats.imported += 1;
    return result.asset.url;
  } catch (err) {
    stats.failed += 1;
    if (err instanceof FreepikError) {
      console.error(`  ✗ [${spec.id}] [${err.code}] ${err.message}`);
    } else if (err instanceof Error) {
      console.error(`  ✗ [${spec.id}] ${err.message}`);
    } else {
      console.error(`  ✗ [${spec.id}]`, err);
    }
    return null;
  } finally {
    await sleep(1200);
  }
}

async function fillAccueilSections() {
  const page = await prisma.page.findFirst({ where: { slug: 'accueil' } });
  if (!page) {
    console.warn('Page accueil introuvable — skip sections');
    return;
  }

  const sections = await prisma.section.findMany({
    where: { pageId: page.id },
    orderBy: { ordre: 'asc' },
  });

  for (const section of sections) {
    const apiType = toApiSectionType(section.type);
    const fr = (section.contenuFR ?? {}) as JsonObj;
    const en = (section.contenuEN ?? {}) as JsonObj;

    if (apiType === 'hero') {
      if (!isPlaceholderUrl(String(fr.imageUrl ?? ''))) {
        logSkip(KEYWORD_HERO_ACCUEIL.target, 'image déjà définie (non placeholder)');
        continue;
      }
      const url = await importOne(KEYWORD_HERO_ACCUEIL);
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
        logSkip(KEYWORD_IMAGE_TEXTE_METHODE.target, 'image déjà définie (non placeholder)');
        continue;
      }
      const url = await importOne(KEYWORD_IMAGE_TEXTE_METHODE);
      if (!url) continue;
      await prisma.section.update({
        where: { id: section.id },
        data: {
          contenuFR: { ...fr, imageUrl: url },
          contenuEN: { ...en, imageUrl: url },
        },
      });
    }

    if (apiType === 'grille-cartes' && fr.source !== 'secteurs') {
      const items = Array.isArray(fr.items) ? [...(fr.items as JsonObj[])] : [];
      let changed = false;

      if (isPlaceholderUrl(String(fr.featuredImageUrl ?? ''))) {
        const featuredUrl = await importOne(KEYWORD_GRILLE_EXPERTISES);
        if (featuredUrl) {
          fr.featuredImageUrl = featuredUrl;
          en.featuredImageUrl = featuredUrl;
          changed = true;
        }
      } else {
        logSkip(KEYWORD_GRILLE_EXPERTISES.target, 'featuredImageUrl déjà définie');
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = String(item.title ?? '');
        if (!title) {
          logSkip(`Carte expertises #${i + 1}`, 'titre manquant dans contenuFR.items');
          continue;
        }
        if (!isPlaceholderUrl(String(item.imageUrl ?? ''))) {
          logSkip(`Carte expertises — ${title}`, 'image déjà définie');
          continue;
        }
        const spec = expertiseItemKeywords(title);
        const url = await importOne(spec);
        if (url) {
          items[i] = { ...item, imageUrl: url };
          changed = true;
        }
      }

      if (changed) {
        await prisma.section.update({
          where: { id: section.id },
          data: {
            contenuFR: { ...fr, items },
            contenuEN: { ...en, items: Array.isArray(en.items) ? en.items : items },
          },
        });
      }
    } else if (apiType === 'grille-cartes' && fr.source === 'secteurs') {
      logSkip('Grille secteurs', 'images gérées via table secteurs_activite');
    }
  }
}

async function fillSecteurs() {
  const secteurs = await prisma.secteurActivite.findMany({ orderBy: { ordre: 'asc' } });
  for (const secteur of secteurs) {
    if (secteur.icone && !isPlaceholderUrl(secteur.icone) && secteur.icone.startsWith('/uploads/')) {
      logSkip(`Secteur — ${secteur.nomFR}`, 'icône déjà importée');
      continue;
    }
    const spec = secteurKeywords(secteur.nomFR, secteur.nomEN);
    const url = await importOne(spec);
    if (!url) continue;
    await prisma.secteurActivite.update({
      where: { id: secteur.id },
      data: { icone: url },
    });
  }
}

async function main() {
  const plan = buildDefaultKeywordPlan();
  printPlan(plan);

  if (LIST_ONLY) {
    console.log('Mode liste uniquement. Relancez avec --execute pour importer.\n');
    return;
  }

  console.log('=== Import Freepik (execute) ===\n');
  await fillAccueilSections();
  await fillSecteurs();
  console.log('\n=== Bilan ===');
  console.log(`  Importés : ${stats.imported}`);
  console.log(`  Ignorés  : ${stats.skipped}`);
  console.log(`  Sans résultat : ${stats.noResult}`);
  console.log(`  Échecs   : ${stats.failed}`);
  if (stats.failed > 0 || stats.noResult > 0) {
    console.log('\n⚠ Certaines entrées n’ont pas été importées — voir les logs ci-dessus.');
    process.exitCode = 1;
  }
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
