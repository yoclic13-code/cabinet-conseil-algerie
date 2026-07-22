import { useState } from 'react';
import type { Section, SectionTypeApi } from '../../api/types';
import { AdminInput, AdminSelect, AdminTextarea } from '../components/ui';
import { ImageUpload } from '../components/ImageUpload';
import { LanguageToggle, BilingualFields } from '../components/LanguageToggle';

type Content = Record<string, unknown>;

function setField(content: Content, key: string, value: unknown): Content {
  return { ...content, [key]: value };
}

export function SectionForm({
  section,
  onChange,
}: {
  section: Section;
  onChange: (patch: Partial<Section>) => void;
}) {
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const contentKey = locale === 'fr' ? 'contenuFR' : 'contenuEN';
  const content = (locale === 'fr' ? section.contenuFR : section.contenuEN) || {};

  const updateContent = (next: Content) => {
    onChange({ [contentKey]: next } as Partial<Section>);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSelect
          label="Type"
          value={section.type}
          onChange={(e) => onChange({ type: e.target.value as SectionTypeApi })}
        >
          {(
            [
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
            ] as SectionTypeApi[]
          ).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </AdminSelect>
        <label className="flex items-center gap-2 text-sm text-admin-ink">
          <input
            type="checkbox"
            checked={section.visible}
            onChange={(e) => onChange({ visible: e.target.checked })}
          />
          Visible sur le site
        </label>
        <LanguageToggle locale={locale} onChange={setLocale} />
      </div>

      <BilingualFields
        locale={locale}
        fr={<TypeFields type={section.type} content={content} onChange={updateContent} />}
        en={<TypeFields type={section.type} content={content} onChange={updateContent} />}
      />
    </div>
  );
}

function TypeFields({
  type,
  content,
  onChange,
}: {
  type: SectionTypeApi;
  content: Content;
  onChange: (c: Content) => void;
}) {
  const str = (key: string) => String(content[key] ?? '');

  switch (type) {
    case 'hero':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminTextarea label="Sous-titre" rows={2} value={str('subtitle')} onChange={(e) => onChange(setField(content, 'subtitle', e.target.value))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Label CTA" value={str('ctaLabel')} onChange={(e) => onChange(setField(content, 'ctaLabel', e.target.value))} />
            <AdminInput label="Lien CTA" value={str('ctaHref')} onChange={(e) => onChange(setField(content, 'ctaHref', e.target.value))} />
          </div>
          <ImageUpload value={str('imageUrl') || null} onChange={(url) => onChange(setField(content, 'imageUrl', url || ''))} />
        </div>
      );
    case 'texte':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminTextarea label="Corps" rows={6} value={str('body')} onChange={(e) => onChange(setField(content, 'body', e.target.value))} />
        </div>
      );
    case 'image-texte':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminTextarea label="Corps" rows={5} value={str('body')} onChange={(e) => onChange(setField(content, 'body', e.target.value))} />
          <AdminSelect
            label="Position image"
            value={str('imagePosition') || 'right'}
            onChange={(e) => onChange(setField(content, 'imagePosition', e.target.value))}
          >
            <option value="left">Gauche</option>
            <option value="right">Droite</option>
          </AdminSelect>
          <ImageUpload value={str('imageUrl') || null} onChange={(url) => onChange(setField(content, 'imageUrl', url || ''))} />
        </div>
      );
    case 'grille-cartes':
    case 'stats':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminTextarea
            label="Items (JSON)"
            rows={6}
            hint='Ex: [{"title":"...","body":"..."}] ou [{"label":"...","value":"..."}]'
            value={JSON.stringify(content.items ?? [], null, 2)}
            onChange={(e) => {
              try {
                onChange(setField(content, 'items', JSON.parse(e.target.value || '[]')));
              } catch {
                /* ignore while typing */
              }
            }}
          />
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminTextarea label="Texte" rows={3} value={str('body')} onChange={(e) => onChange(setField(content, 'body', e.target.value))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Bouton" value={str('buttonLabel')} onChange={(e) => onChange(setField(content, 'buttonLabel', e.target.value))} />
            <AdminInput label="Lien" value={str('buttonHref')} onChange={(e) => onChange(setField(content, 'buttonHref', e.target.value))} />
          </div>
        </div>
      );
    case 'actualites':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminInput
            label="Nombre d’articles"
            type="number"
            min={1}
            max={12}
            value={Number(content.limit ?? 3)}
            onChange={(e) => onChange(setField(content, 'limit', Number(e.target.value)))}
          />
        </div>
      );
    case 'logos-clients':
    case 'zones-intervention':
    case 'contact':
      return (
        <div className="space-y-3">
          <AdminInput label="Titre" value={str('title')} onChange={(e) => onChange(setField(content, 'title', e.target.value))} />
          <AdminTextarea label="Intro" rows={3} value={str('intro')} onChange={(e) => onChange(setField(content, 'intro', e.target.value))} />
        </div>
      );
    default:
      return <p className="text-sm text-admin-mute">Formulaire non défini pour ce type.</p>;
  }
}
