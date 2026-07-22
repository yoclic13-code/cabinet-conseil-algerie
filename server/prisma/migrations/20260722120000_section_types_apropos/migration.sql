-- Nouveaux types de section CMS (page À propos)
ALTER TABLE `sections` MODIFY `type` ENUM(
  'hero',
  'page_hero',
  'texte',
  'image_texte',
  'grille_cartes',
  'logos_clients',
  'stats',
  'equipe',
  'certifications',
  'cta',
  'actualites',
  'zones_intervention',
  'contact'
) NOT NULL;
