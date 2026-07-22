import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, Save } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { slugify } from '../../api/types';
import { ImageUpload } from '../components/ImageUpload';
import { LanguageToggle } from '../components/LanguageToggle';
import { RichTextEditor } from '../components/RichTextEditor';
import { SerpPreview } from '../components/SerpPreview';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  ErrorBanner,
  PageHeader,
  SuccessBanner,
} from '../components/ui';

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

export function ArticleEditPage() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titreFR: '',
    titreEN: '',
    slug: '',
    extraitFR: '',
    extraitEN: '',
    contenuFR: emptyDoc as unknown,
    contenuEN: emptyDoc as unknown,
    imageCouverture: null as string | null,
    categorie: 'Actualité',
    tags: '' as string,
    auteur: 'Rédaction',
    datePublication: '',
    statut: 'brouillon' as 'brouillon' | 'publie' | 'programme',
    seoTitleFR: '',
    seoTitleEN: '',
    seoDescriptionFR: '',
    seoDescriptionEN: '',
  });

  useEffect(() => {
    if (isNew) return;
    void adminApi
      .getArticle(id!)
      .then((res) => {
        const a = res.data;
        const tags = Array.isArray(a.tags) ? a.tags.join(', ') : '';
        setForm({
          titreFR: a.titreFR,
          titreEN: a.titreEN,
          slug: a.slug,
          extraitFR: a.extraitFR,
          extraitEN: a.extraitEN,
          contenuFR: a.contenuFR || emptyDoc,
          contenuEN: a.contenuEN || emptyDoc,
          imageCouverture: a.imageCouverture ?? null,
          categorie: a.categorie,
          tags,
          auteur: a.auteur,
          datePublication: a.datePublication
            ? new Date(a.datePublication).toISOString().slice(0, 16)
            : '',
          statut: a.statut,
          seoTitleFR: a.seoTitleFR || '',
          seoTitleEN: a.seoTitleEN || '',
          seoDescriptionFR: a.seoDescriptionFR || '',
          seoDescriptionEN: a.seoDescriptionEN || '',
        });
        setSlugManual(true);
      })
      .catch((e) => setError(e.message));
  }, [id, isNew]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'titreFR' && !slugManual && isNew) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const seoTitle = locale === 'fr' ? form.seoTitleFR || form.titreFR : form.seoTitleEN || form.titreEN;
  const seoDesc =
    locale === 'fr'
      ? form.seoDescriptionFR || form.extraitFR
      : form.seoDescriptionEN || form.extraitEN;

  const suggestSeo = () => {
    setForm((prev) => ({
      ...prev,
      seoTitleFR: prev.seoTitleFR || prev.titreFR.slice(0, 60),
      seoTitleEN: prev.seoTitleEN || prev.titreEN.slice(0, 60),
      seoDescriptionFR: prev.seoDescriptionFR || prev.extraitFR.slice(0, 160),
      seoDescriptionEN: prev.seoDescriptionEN || prev.extraitEN.slice(0, 160),
    }));
  };

  const payload = useMemo(
    () => ({
      titreFR: form.titreFR,
      titreEN: form.titreEN || form.titreFR,
      slug: form.slug || slugify(form.titreFR),
      extraitFR: form.extraitFR,
      extraitEN: form.extraitEN || form.extraitFR,
      contenuFR: form.contenuFR,
      contenuEN: form.contenuEN || form.contenuFR,
      imageCouverture: form.imageCouverture,
      categorie: form.categorie,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      auteur: form.auteur,
      datePublication: form.datePublication
        ? new Date(form.datePublication).toISOString()
        : form.statut === 'publie'
          ? new Date().toISOString()
          : null,
      statut: form.statut,
      seoTitleFR: form.seoTitleFR || null,
      seoTitleEN: form.seoTitleEN || null,
      seoDescriptionFR: form.seoDescriptionFR || null,
      seoDescriptionEN: form.seoDescriptionEN || null,
    }),
    [form],
  );

  const save = async (statut?: typeof form.statut) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = { ...payload, statut: statut || form.statut };
      if (statut) set('statut', statut);
      if (isNew) {
        const res = await adminApi.createArticle(body);
        setSuccess('Article créé');
        navigate(`/admin/articles/${res.data.id}`, { replace: true });
      } else {
        await adminApi.updateArticle(id!, body);
        setSuccess('Article enregistré');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouvel article' : 'Éditer l’article'}
        actions={
          <>
            <Link to="/admin/articles">
              <AdminButton variant="ghost" type="button">
                Retour
              </AdminButton>
            </Link>
            <AdminButton
              variant="secondary"
              type="button"
              onClick={() => window.open(`/actualites/${form.slug || 'aperçu'}?preview=1`, '_blank')}
            >
              <Eye size={16} /> Aperçu
            </AdminButton>
            <AdminButton variant="secondary" type="button" disabled={saving} onClick={() => void save('brouillon')}>
              Brouillon
            </AdminButton>
            <AdminButton variant="secondary" type="button" disabled={saving} onClick={() => void save('programme')}>
              Programmer
            </AdminButton>
            <AdminButton type="button" disabled={saving} onClick={() => void save('publie')}>
              <Save size={16} /> Publier
            </AdminButton>
          </>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}

      <div className="mb-4 flex justify-end">
        <LanguageToggle locale={locale} onChange={setLocale} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <AdminCard title="Contenu">
            <div className="space-y-3">
              {locale === 'fr' ? (
                <>
                  <AdminInput label="Titre FR" value={form.titreFR} onChange={(e) => set('titreFR', e.target.value)} />
                  <AdminTextarea label="Extrait FR" rows={3} value={form.extraitFR} onChange={(e) => set('extraitFR', e.target.value)} />
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-admin-mute">Contenu FR</p>
                    <RichTextEditor value={form.contenuFR} onChange={(v) => set('contenuFR', v)} />
                  </div>
                </>
              ) : (
                <>
                  <AdminInput label="Titre EN" value={form.titreEN} onChange={(e) => set('titreEN', e.target.value)} />
                  <AdminTextarea label="Extrait EN" rows={3} value={form.extraitEN} onChange={(e) => set('extraitEN', e.target.value)} />
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-admin-mute">Contenu EN</p>
                    <RichTextEditor value={form.contenuEN} onChange={(v) => set('contenuEN', v)} />
                  </div>
                </>
              )}
            </div>
          </AdminCard>

          <AdminCard
            title="SEO article"
            actions={
              <AdminButton variant="ghost" type="button" onClick={suggestSeo}>
                Suggérer depuis l’extrait
              </AdminButton>
            }
          >
            <div className="space-y-3">
              {locale === 'fr' ? (
                <>
                  <AdminInput
                    label={`Title FR (${form.seoTitleFR.length}/60)`}
                    maxLength={70}
                    value={form.seoTitleFR}
                    onChange={(e) => set('seoTitleFR', e.target.value)}
                  />
                  <AdminTextarea
                    label={`Description FR (${form.seoDescriptionFR.length}/160)`}
                    maxLength={160}
                    rows={3}
                    value={form.seoDescriptionFR}
                    onChange={(e) => set('seoDescriptionFR', e.target.value)}
                  />
                </>
              ) : (
                <>
                  <AdminInput
                    label={`Title EN (${form.seoTitleEN.length}/60)`}
                    maxLength={70}
                    value={form.seoTitleEN}
                    onChange={(e) => set('seoTitleEN', e.target.value)}
                  />
                  <AdminTextarea
                    label={`Description EN (${form.seoDescriptionEN.length}/160)`}
                    maxLength={160}
                    rows={3}
                    value={form.seoDescriptionEN}
                    onChange={(e) => set('seoDescriptionEN', e.target.value)}
                  />
                </>
              )}
              <SerpPreview title={seoTitle} description={seoDesc} urlPath={`/actualites/${form.slug || '…'}`} />
            </div>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard title="Publication">
            <div className="space-y-3">
              <AdminInput
                label="Slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  set('slug', slugify(e.target.value));
                }}
              />
              <AdminSelect
                label="Statut"
                value={form.statut}
                onChange={(e) => set('statut', e.target.value as typeof form.statut)}
              >
                <option value="brouillon">Brouillon</option>
                <option value="publie">Publié</option>
                <option value="programme">Programmé</option>
              </AdminSelect>
              <AdminInput
                label="Date de publication"
                type="datetime-local"
                value={form.datePublication}
                onChange={(e) => set('datePublication', e.target.value)}
              />
              <AdminInput label="Catégorie" value={form.categorie} onChange={(e) => set('categorie', e.target.value)} />
              <AdminInput label="Tags (virgules)" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
              <AdminInput label="Auteur" value={form.auteur} onChange={(e) => set('auteur', e.target.value)} />
            </div>
          </AdminCard>
          <AdminCard title="Couverture">
            <ImageUpload
              value={form.imageCouverture}
              onChange={(url) => set('imageCouverture', url)}
            />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
