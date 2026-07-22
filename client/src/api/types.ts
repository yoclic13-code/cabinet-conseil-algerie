/** Types alignés sur l’API Phase 3 */

export type SectionTypeApi =
  | 'hero'
  | 'texte'
  | 'image-texte'
  | 'grille-cartes'
  | 'logos-clients'
  | 'stats'
  | 'cta'
  | 'actualites'
  | 'zones-intervention'
  | 'contact';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export interface Page {
  id: string;
  slug: string;
  ordre: number;
  sections?: Section[];
  seoMeta?: SeoMeta | null;
  _count?: { sections: number };
}

export interface Section {
  id: string;
  pageId: string;
  type: SectionTypeApi;
  ordre: number;
  visible: boolean;
  contenuFR: Record<string, unknown>;
  contenuEN: Record<string, unknown>;
}

export interface SeoMeta {
  id: string;
  pageId: string;
  titleFR: string;
  titleEN: string;
  descriptionFR: string;
  descriptionEN: string;
  ogImage?: string | null;
}

export interface Article {
  id: string;
  titreFR: string;
  titreEN: string;
  slug: string;
  extraitFR: string;
  extraitEN: string;
  contenuFR: unknown;
  contenuEN: unknown;
  imageCouverture?: string | null;
  categorie: string;
  tags: string[] | unknown;
  auteur: string;
  datePublication?: string | null;
  statut: 'brouillon' | 'publie' | 'programme';
  tempsLecture: number;
  seoTitleFR?: string | null;
  seoTitleEN?: string | null;
  seoDescriptionFR?: string | null;
  seoDescriptionEN?: string | null;
  updatedAt?: string;
}

export interface Evenement {
  id: string;
  titreFR: string;
  titreEN: string;
  descriptionFR: string;
  descriptionEN: string;
  compteRenduFR?: string | null;
  compteRenduEN?: string | null;
  image?: string | null;
  dateDebut: string;
  dateFin?: string | null;
  lieu: string;
  lienInscription?: string | null;
  statut: 'a_venir' | 'passe' | 'annule';
  slug: string;
}

export interface Secteur {
  id: string;
  nomFR: string;
  nomEN: string;
  icone?: string | null;
  descriptionFR?: string | null;
  descriptionEN?: string | null;
  ordre: number;
}

export interface Zone {
  id: string;
  paysRegionFR: string;
  paysRegionEN: string;
  descriptionFR: string;
  descriptionEN: string;
  niveau: string;
  ordre: number;
}

export interface Reference {
  id: string;
  nom: string;
  logo: string;
  url?: string | null;
  ordre: number;
}

export interface Lead {
  id: string;
  service: string;
  zone: string;
  secteur: string;
  description: string;
  nom: string;
  societe?: string | null;
  email: string;
  telephone?: string | null;
  statut: 'nouveau' | 'traite';
  createdAt: string;
}

export interface Settings {
  id: string;
  nomCabinet: string;
  logoUrl?: string | null;
  baselineFR: string;
  baselineEN: string;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  pays?: string | null;
  telephone?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  googleSearchConsoleCode?: string | null;
  googleAnalyticsId?: string | null;
}

export const SECTION_TYPE_OPTIONS: { value: SectionTypeApi; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'texte', label: 'Texte' },
  { value: 'image-texte', label: 'Image + texte' },
  { value: 'grille-cartes', label: 'Grille de cartes' },
  { value: 'logos-clients', label: 'Logos clients' },
  { value: 'stats', label: 'Stats' },
  { value: 'cta', label: 'CTA' },
  { value: 'actualites', label: 'Actualités' },
  { value: 'zones-intervention', label: 'Zones d’intervention' },
  { value: 'contact', label: 'Contact' },
];

export function defaultSectionContent(type: SectionTypeApi): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return { title: '', subtitle: '', ctaLabel: '', ctaHref: '/contact', imageUrl: '' };
    case 'texte':
      return { title: '', body: '' };
    case 'image-texte':
      return { title: '', body: '', imageUrl: '', imagePosition: 'right' };
    case 'grille-cartes':
      return { title: '', items: [] };
    case 'logos-clients':
      return { title: '' };
    case 'stats':
      return { title: '', items: [] };
    case 'cta':
      return { title: '', body: '', buttonLabel: '', buttonHref: '/contact' };
    case 'actualites':
      return { title: '', limit: 3 };
    case 'zones-intervention':
      return { title: '', intro: '' };
    case 'contact':
      return { title: '', intro: '' };
    default:
      return {};
  }
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 160);
}
