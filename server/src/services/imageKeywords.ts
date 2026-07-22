/**
 * Mots-clés Freepik dérivés du contenu éditorial.
 * Hero + secteurs : monochrome (respiration visuelle).
 * Expertises + méthode : couleur sobre (tons neutres).
 */

export interface ImageSearchSpec {
  id: string;
  target: string;
  term: string;
  orientation: 'landscape' | 'portrait' | 'square';
  color?: 'black' | 'gray';
  altFR: string;
  altEN?: string;
}

const MONO_STYLE = 'professional black and white';
const COLOR_STYLE = 'muted tones professional neutral colors industrial';

/** Hero accueil — monochrome */
export const KEYWORD_HERO_ACCUEIL: ImageSearchSpec = {
  id: 'accueil-hero',
  target: 'Section hero — Accueil',
  term: `industrial safety inspection workplace ${MONO_STYLE}`,
  orientation: 'landscape',
  color: 'black',
  altFR: 'Inspection sécurité industrielle sur site',
  altEN: 'Industrial safety inspection on site',
};

/** Image-texte méthode — couleur sobre */
export const KEYWORD_IMAGE_TEXTE_METHODE: ImageSearchSpec = {
  id: 'accueil-image-texte-methode',
  target: 'Section image-texte « Méthode » — Accueil',
  term: `engineer audit report documentation plans industrial site ${COLOR_STYLE}`,
  orientation: 'landscape',
  altFR: 'Ingénieur consultant avec dossier d’audit QSE',
  altEN: 'Consulting engineer reviewing a QSE audit report',
};

/** Grille expertises — visuel d’ambiance section (couleur sobre) */
export const KEYWORD_GRILLE_EXPERTISES: ImageSearchSpec = {
  id: 'accueil-grille-expertises',
  target: 'Section grille-cartes « Expertises » — featuredImageUrl',
  term: `QSE HSE consulting team meeting industrial facility ${COLOR_STYLE}`,
  orientation: 'landscape',
  altFR: 'Équipe conseil QSE en réunion sur site industriel',
  altEN: 'QSE consulting team meeting at an industrial site',
};

/** Cartes expertises — sujets visuels différenciés, couleur sobre */
export function expertiseItemKeywords(title: string): ImageSearchSpec {
  const map: Record<string, string> = {
    'Audit & diagnostic QSE':
      `safety inspector hard hat clipboard industrial plant equipment ${COLOR_STYLE}`,
    'Études HSE & risques':
      `HSE engineer technical drawings data analysis risk assessment office ${COLOR_STYLE}`,
    'Formation & culture sécurité':
      `safety training group workshop meeting industrial workers classroom ${COLOR_STYLE}`,
    'Inspection & conformité':
      `industrial machinery close up compliance inspection equipment detail ${COLOR_STYLE}`,
    'Conseil environnement':
      `industrial landscape environmental site outdoor nature factory horizon ${COLOR_STYLE}`,
  };

  const term =
    map[title] ??
    `${title.replace(/&/g, 'and')} industrial ${COLOR_STYLE}`;

  return {
    id: `expertise-item-${title.slice(0, 24).toLowerCase().replace(/\s+/g, '-')}`,
    target: `Carte expertises — ${title}`,
    term,
    orientation: 'landscape',
    altFR: title,
    altEN: title,
  };
}

/** Secteurs — monochrome */
export function secteurKeywords(nomFR: string, nomEN?: string): ImageSearchSpec {
  const normalized = nomFR.toLowerCase();
  let term: string;

  if (normalized.includes('hydrocarbure') || normalized.includes('énergie')) {
    term = `oil refinery industrial safety ${MONO_STYLE}`;
  } else if (normalized.includes('mine') || normalized.includes('carrière')) {
    term = `mining site safety engineer industrial ${MONO_STYLE}`;
  } else if (normalized.includes('manufactur') || normalized.includes('industrie')) {
    term = `manufacturing plant industrial engineer workplace ${MONO_STYLE}`;
  } else if (normalized.includes('btp') || normalized.includes('infrastructure')) {
    term = `construction site engineer safety industrial ${MONO_STYLE}`;
  } else if (normalized.includes('pétrole') || normalized.includes('gaz')) {
    term = `oil gas refinery industrial ${MONO_STYLE}`;
  } else {
    term = `${nomFR} industrial sector ${MONO_STYLE}`;
  }

  return {
    id: `secteur-${nomFR.slice(0, 20).toLowerCase().replace(/\s+/g, '-')}`,
    target: `Secteur — ${nomFR}`,
    term,
    orientation: 'landscape',
    color: 'black',
    altFR: nomFR,
    altEN: nomEN ?? nomFR,
  };
}

export function buildDefaultKeywordPlan(): ImageSearchSpec[] {
  const expertiseTitles = [
    'Audit & diagnostic QSE',
    'Études HSE & risques',
    'Formation & culture sécurité',
    'Inspection & conformité',
    'Conseil environnement',
  ];

  const secteurNames = [
    { nomFR: 'Hydrocarbures & énergie', nomEN: 'Oil, gas & energy' },
    { nomFR: 'Mines & carrières', nomEN: 'Mining & quarries' },
    { nomFR: 'Industrie manufacturière', nomEN: 'Manufacturing' },
    { nomFR: 'Infrastructure & BTP', nomEN: 'Infrastructure & construction' },
  ];

  return [
    KEYWORD_HERO_ACCUEIL,
    KEYWORD_GRILLE_EXPERTISES,
    ...expertiseTitles.map((t) => expertiseItemKeywords(t)),
    KEYWORD_IMAGE_TEXTE_METHODE,
    ...secteurNames.map((s) => secteurKeywords(s.nomFR, s.nomEN)),
  ];
}

export function isPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes('placeholder') || url.startsWith('/images/placeholder');
}
