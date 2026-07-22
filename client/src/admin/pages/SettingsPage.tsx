import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { Settings } from '../../api/types';
import { ImageUpload } from '../components/ImageUpload';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  ErrorBanner,
  PageHeader,
  SuccessBanner,
} from '../components/ui';

export function SettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    void adminApi
      .getSettings()
      .then((r) => setForm(r.data))
      .catch((e) => setError(e.message));
  }, []);

  const set = (key: keyof Settings, value: string | null) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const save = async () => {
    if (!form) return;
    setError('');
    try {
      const { id: _id, ...body } = form;
      const res = await adminApi.updateSettings(body);
      setForm(res.data);
      setSuccess('Réglages enregistrés');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  if (!form) {
    return <p className="text-sm text-admin-mute">Chargement…</p>;
  }

  return (
    <div>
      <PageHeader
        title="Réglages"
        description="Identité du cabinet, coordonnées, tracking."
        actions={
          <AdminButton type="button" onClick={() => void save()}>
            <Save size={16} /> Enregistrer
          </AdminButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard title="Identité">
          <div className="space-y-3">
            <AdminInput label="Nom du cabinet" value={form.nomCabinet} onChange={(e) => set('nomCabinet', e.target.value)} />
            <AdminInput label="Baseline FR" value={form.baselineFR} onChange={(e) => set('baselineFR', e.target.value)} />
            <AdminInput label="Baseline EN" value={form.baselineEN} onChange={(e) => set('baselineEN', e.target.value)} />
            <ImageUpload label="Logo" value={form.logoUrl} onChange={(url) => set('logoUrl', url)} />
          </div>
        </AdminCard>

        <AdminCard title="Coordonnées">
          <div className="space-y-3">
            <AdminInput label="Adresse" value={form.adresse || ''} onChange={(e) => set('adresse', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Ville" value={form.ville || ''} onChange={(e) => set('ville', e.target.value)} />
              <AdminInput label="Code postal" value={form.codePostal || ''} onChange={(e) => set('codePostal', e.target.value)} />
            </div>
            <AdminInput label="Pays" value={form.pays || ''} onChange={(e) => set('pays', e.target.value)} />
            <AdminInput label="Téléphone" value={form.telephone || ''} onChange={(e) => set('telephone', e.target.value)} />
            <AdminInput label="Email" type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
          </div>
        </AdminCard>

        <AdminCard title="Réseaux sociaux">
          <div className="space-y-3">
            <AdminInput label="LinkedIn" value={form.linkedinUrl || ''} onChange={(e) => set('linkedinUrl', e.target.value)} />
            <AdminInput label="Facebook" value={form.facebookUrl || ''} onChange={(e) => set('facebookUrl', e.target.value)} />
            <AdminInput label="X / Twitter" value={form.twitterUrl || ''} onChange={(e) => set('twitterUrl', e.target.value)} />
            <AdminInput label="YouTube" value={form.youtubeUrl || ''} onChange={(e) => set('youtubeUrl', e.target.value)} />
          </div>
        </AdminCard>

        <AdminCard title="Search Console & Analytics">
          <div className="space-y-3">
            <AdminInput
              label="Code vérification Google Search Console"
              hint="Contenu de l’attribut content de la meta google-site-verification"
              value={form.googleSearchConsoleCode || ''}
              onChange={(e) => set('googleSearchConsoleCode', e.target.value)}
            />
            <AdminInput
              label="ID Google Analytics"
              hint="Ex. G-XXXXXXXX"
              value={form.googleAnalyticsId || ''}
              onChange={(e) => set('googleAnalyticsId', e.target.value)}
            />
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
