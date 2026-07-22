import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { slugify, type Evenement } from '../../api/types';
import { ImageUpload } from '../components/ImageUpload';
import { LanguageToggle } from '../components/LanguageToggle';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  ErrorBanner,
  PageHeader,
  StatusBadge,
  SuccessBanner,
} from '../components/ui';

export function EvenementsListPage() {
  const [items, setItems] = useState<Evenement[]>([]);
  const [error, setError] = useState('');

  const load = () =>
    adminApi.listEvenements().then((r) => setItems(r.data)).catch((e) => setError(e.message));

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Événements"
        actions={
          <Link to="/admin/evenements/new">
            <AdminButton type="button">
              <Plus size={16} /> Nouvel événement
            </AdminButton>
          </Link>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {items.length === 0 ? (
        <EmptyState message="Aucun événement." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-admin-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-admin-bg text-xs uppercase text-admin-mute">
              <tr>
                <th className="px-4 py-2.5">Titre</th>
                <th className="px-4 py-2.5">Dates</th>
                <th className="px-4 py-2.5">Statut</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3">
                    <Link className="font-medium text-admin-accent hover:underline" to={`/admin/evenements/${e.id}`}>
                      {e.titreFR}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-admin-mute">
                    {new Date(e.dateDebut).toLocaleDateString('fr-FR')}
                    {e.dateFin ? ` → ${new Date(e.dateFin).toLocaleDateString('fr-FR')}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminButton
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        if (!window.confirm('Supprimer ?')) return;
                        void adminApi.deleteEvenement(e.id).then(load);
                      }}
                    >
                      <Trash2 size={14} />
                    </AdminButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function EvenementEditPage() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [locale, setLocale] = useState<'fr' | 'en'>('fr');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    titreFR: '',
    titreEN: '',
    descriptionFR: '',
    descriptionEN: '',
    compteRenduFR: '',
    compteRenduEN: '',
    image: null as string | null,
    dateDebut: '',
    dateFin: '',
    lieu: '',
    lienInscription: '',
    statut: 'a_venir' as 'a_venir' | 'passe' | 'annule',
    slug: '',
  });

  useEffect(() => {
    if (isNew) return;
    void adminApi.getEvenement(id!).then((r) => {
      const e = r.data;
      setForm({
        titreFR: e.titreFR,
        titreEN: e.titreEN,
        descriptionFR: e.descriptionFR,
        descriptionEN: e.descriptionEN,
        compteRenduFR: e.compteRenduFR || '',
        compteRenduEN: e.compteRenduEN || '',
        image: e.image ?? null,
        dateDebut: e.dateDebut ? new Date(e.dateDebut).toISOString().slice(0, 16) : '',
        dateFin: e.dateFin ? new Date(e.dateFin).toISOString().slice(0, 16) : '',
        lieu: e.lieu,
        lienInscription: e.lienInscription || '',
        statut: e.statut,
        slug: e.slug,
      });
    });
  }, [id, isNew]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setError('');
    try {
      const body = {
        ...form,
        dateDebut: new Date(form.dateDebut).toISOString(),
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
        slug: form.slug || slugify(form.titreFR),
        image: form.image,
        lienInscription: form.lienInscription || null,
      };
      if (isNew) {
        const res = await adminApi.createEvenement(body);
        navigate(`/admin/evenements/${res.data.id}`, { replace: true });
      } else {
        await adminApi.updateEvenement(id!, body);
        setSuccess('Événement enregistré');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div>
      <PageHeader
        title={isNew ? 'Nouvel événement' : 'Éditer l’événement'}
        actions={
          <AdminButton type="button" onClick={() => void save()}>
            <Save size={16} /> Enregistrer
          </AdminButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}
      <div className="mb-4 flex justify-end">
        <LanguageToggle locale={locale} onChange={setLocale} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <AdminCard title="Contenu">
          <div className="space-y-3">
            {locale === 'fr' ? (
              <>
                <AdminInput label="Titre FR" value={form.titreFR} onChange={(e) => set('titreFR', e.target.value)} />
                <AdminTextarea label="Description FR" rows={5} value={form.descriptionFR} onChange={(e) => set('descriptionFR', e.target.value)} />
                <AdminTextarea label="Compte-rendu FR (passé)" rows={4} value={form.compteRenduFR} onChange={(e) => set('compteRenduFR', e.target.value)} />
              </>
            ) : (
              <>
                <AdminInput label="Titre EN" value={form.titreEN} onChange={(e) => set('titreEN', e.target.value)} />
                <AdminTextarea label="Description EN" rows={5} value={form.descriptionEN} onChange={(e) => set('descriptionEN', e.target.value)} />
                <AdminTextarea label="Compte-rendu EN" rows={4} value={form.compteRenduEN} onChange={(e) => set('compteRenduEN', e.target.value)} />
              </>
            )}
          </div>
        </AdminCard>
        <div className="space-y-4">
          <AdminCard title="Planification">
            <div className="space-y-3">
              <AdminInput label="Début" type="datetime-local" value={form.dateDebut} onChange={(e) => set('dateDebut', e.target.value)} />
              <AdminInput label="Fin" type="datetime-local" value={form.dateFin} onChange={(e) => set('dateFin', e.target.value)} />
              <AdminInput label="Lieu" value={form.lieu} onChange={(e) => set('lieu', e.target.value)} />
              <AdminInput label="Lien inscription" value={form.lienInscription} onChange={(e) => set('lienInscription', e.target.value)} />
              <AdminSelect label="Statut (annulé forcé)" value={form.statut} onChange={(e) => set('statut', e.target.value as typeof form.statut)}>
                <option value="a_venir">À venir</option>
                <option value="passe">Passé</option>
                <option value="annule">Annulé</option>
              </AdminSelect>
              <AdminInput label="Slug" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} />
            </div>
          </AdminCard>
          <AdminCard title="Image">
            <ImageUpload value={form.image} onChange={(u) => set('image', u)} />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
