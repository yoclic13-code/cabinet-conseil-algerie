import { SectionType as PrismaSectionType } from '@prisma/client';

/** Valeurs API / cahier des charges (kebab-case) */
export const SECTION_TYPES_API = [
  'hero',
  'texte',
  'image-texte',
  'grille-cartes',
  'logos-clients',
  'stats',
  'cta',
  'actualites',
  'zones-intervention',
  'contact',
] as const;

export type SectionTypeApi = (typeof SECTION_TYPES_API)[number];

const apiToPrisma: Record<SectionTypeApi, PrismaSectionType> = {
  hero: 'hero',
  texte: 'texte',
  'image-texte': 'image_texte',
  'grille-cartes': 'grille_cartes',
  'logos-clients': 'logos_clients',
  stats: 'stats',
  cta: 'cta',
  actualites: 'actualites',
  'zones-intervention': 'zones_intervention',
  contact: 'contact',
};

const prismaToApi = Object.fromEntries(
  Object.entries(apiToPrisma).map(([api, prisma]) => [prisma, api]),
) as Record<PrismaSectionType, SectionTypeApi>;

export function toPrismaSectionType(apiType: string): PrismaSectionType {
  const mapped = apiToPrisma[apiType as SectionTypeApi];
  if (!mapped) {
    throw new Error(`Type de section invalide: ${apiType}`);
  }
  return mapped;
}

export function toApiSectionType(prismaType: PrismaSectionType): SectionTypeApi {
  return prismaToApi[prismaType];
}

export function serializeSection<T extends { type: PrismaSectionType }>(section: T) {
  return {
    ...section,
    type: toApiSectionType(section.type),
  };
}
