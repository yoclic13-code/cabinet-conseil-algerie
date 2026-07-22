/**
 * Types partagés client / server
 * Étendus au fur et à mesure des phases API & admin.
 */

export type Locale = 'fr' | 'en';

export type SectionType =
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

export type ArticleStatus = 'brouillon' | 'publie' | 'programme';

export type LeadStatus = 'nouveau' | 'traite';

export type UserRole = 'superadmin' | 'admin';

export interface LocalizedString {
  fr: string;
  en: string;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}
