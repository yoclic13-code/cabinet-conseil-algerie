/**
 * Mots-clés Freepik — page À propos
 * Rythme : N&B institutionnel (hero) / couleur sobre (approche)
 *
 * Équipe : PAS de Freepik — avatars initiales (MemberAvatar) jusqu’à photos réelles.
 */
import type { ImageSearchSpec } from './imageKeywords';

const MONO = 'professional black and white';
const COLOR = 'muted tones professional neutral colors industrial';

export const KEYWORDS_A_PROPOS: ImageSearchSpec[] = [
  {
    id: 'apropos-page-hero',
    target: 'Hero page — À propos',
    term: `corporate consulting firm institutional Algeria industrial leadership ${MONO}`,
    orientation: 'landscape',
    color: 'black',
    altFR: 'Cabinet de conseil QSE en environnement institutionnel',
    altEN: 'QSE consulting firm in an institutional setting',
  },
  {
    id: 'apropos-image-texte-approche',
    target: 'Image-texte — Notre approche',
    term: `senior consultant industrial site client meeting advisory ${COLOR}`,
    orientation: 'landscape',
    altFR: 'Consultant en réunion sur site industriel',
    altEN: 'Consultant meeting on an industrial site',
  },
];
