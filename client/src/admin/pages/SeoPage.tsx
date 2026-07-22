import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { Page, SeoMeta } from '../../api/types';
import { LanguageToggle } from '../components/LanguageToggle';
import { SerpPreview } from '../components/SerpPreview';
import { ImageUpload } from '../components/ImageUpload';
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

export function SeoPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageId, setPageId] = useState('');
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const [form, setForm] = useState({
    titleFR: '',
    titleEN: '',
    descriptionFR: '',
    descriptionEN: '',
    ogImage: null as string | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    void adminApi.listPages().then((r) => {
      setPages(r.data);
      if (r.data[0]) setPageId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!pageId) return;
    void adminApi.getSeoByPage(pageId).then((r) => {
      const seo = r.data as SeoMeta | null;
      if (seo) {
        setForm({
          titleFR: seo.titleFR,
          titleEN: seo.titleEN,
          descriptionFR: seo.descriptionFR,
          descriptionEN: seo.descriptionEN,
          ogImage: seo.ogImage ?? null,
        });
      } else {
        setForm({
          titleFR: '',
          titleEN: '',
          descriptionFR: '',
          descriptionEN: '',
          ogImage: null,
        });
      }
    });
  }, [pageId]);

  const page = pages.find((p) => p.id === pageId);
  const title = locale === 'fr' ? form.titleFR : form.titleEN;
  const description = locale === 'fr' ? form.descriptionFR : form.descriptionEN;

  const save = async () => {
    setError('');
    try {
      await adminApi.upsertSeo({
        pageId,
        ...form,
        ogImage: form.ogImage,
      });
      setSuccess('SEO enregistré');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div>
      <PageHeader
        title="SEO par page"
        description="Titles, descriptions et aperçu SERP Google."
        actions={
          <AdminButton type="button" onClick={() => void save()}>
            <Save size={16} /> Enregistrer
          </AdminButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px]">
          <AdminSelect label="Page" value={pageId} onChange={(e) => setPageId(e.target.value)}>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                /{p.slug}
              </option>
            ))}
          </AdminSelect>
        </div>
        <LanguageToggle locale={locale} onChange={setLocale} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard title="Métadonnées">
          <div className="space-y-3">
            {locale === 'fr' ? (
              <>
                <AdminInput
                  label={`Title FR (${form.titleFR.length}/60)`}
                  maxLength={70}
                  value={form.titleFR}
                  onChange={(e) => setForm((f) => ({ ...f, titleFR: e.target.value }))}
                />
                <AdminTextarea
                  label={`Description FR (${form.descriptionFR.length}/160)`}
                  maxLength={160}
                  rows={4}
                  value={form.descriptionFR}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionFR: e.target.value }))}
                />
              </>
            ) : (
              <>
                <AdminInput
                  label={`Title EN (${form.titleEN.length}/60)`}
                  maxLength={70}
                  value={form.titleEN}
                  onChange={(e) => setForm((f) => ({ ...f, titleEN: e.target.value }))}
                />
                <AdminTextarea
                  label={`Description EN (${form.descriptionEN.length}/160)`}
                  maxLength={160}
                  rows={4}
                  value={form.descriptionEN}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionEN: e.target.value }))}
                />
              </>
            )}
            <ImageUpload
              label="OG Image"
              value={form.ogImage}
              onChange={(url) => setForm((f) => ({ ...f, ogImage: url }))}
            />
          </div>
        </AdminCard>
        <SerpPreview title={title} description={description} urlPath={page ? `/${page.slug}` : '/'} />
      </div>
    </div>
  );
}
