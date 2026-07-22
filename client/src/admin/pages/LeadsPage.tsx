import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { Lead } from '../../api/types';
import {
  AdminButton,
  AdminSelect,
  EmptyState,
  ErrorBanner,
  PageHeader,
  StatusBadge,
} from '../components/ui';

export function LeadsPage() {
  const [statut, setStatut] = useState('');
  const [items, setItems] = useState<Lead[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await adminApi.listLeads(statut || undefined);
    setItems(res.data);
  };

  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [statut]);

  const exportCsv = async () => {
    const token = localStorage.getItem('admin_token');
    const url = adminApi.exportLeadsCsvUrl(statut || undefined);
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <PageHeader
        title="Leads / Demandes"
        description="Formulaire ContactFlow multi-étapes."
        actions={
          <AdminButton variant="secondary" type="button" onClick={() => void exportCsv()}>
            <Download size={16} /> Export CSV
          </AdminButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}

      <div className="mb-4 max-w-xs">
        <AdminSelect label="Statut" value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="">Tous</option>
          <option value="nouveau">Nouveau</option>
          <option value="traite">Traité</option>
        </AdminSelect>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Aucune demande." />
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <article key={l.id} className="rounded-lg border border-admin-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-admin-ink">
                    {l.nom} {l.societe ? `· ${l.societe}` : ''}
                  </h3>
                  <p className="text-sm text-admin-mute">
                    {l.service} · {l.zone} · {l.secteur}
                  </p>
                  <p className="mt-1 text-sm">
                    <a className="text-admin-accent" href={`mailto:${l.email}`}>
                      {l.email}
                    </a>
                    {l.telephone ? ` · ${l.telephone}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={l.statut} />
                  {l.statut === 'nouveau' ? (
                    <AdminButton
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void adminApi.updateLead(l.id, 'traite').then(load).catch((e) => setError(e.message))
                      }
                    >
                      Marquer traité
                    </AdminButton>
                  ) : (
                    <AdminButton
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        void adminApi.updateLead(l.id, 'nouveau').then(load).catch((e) => setError(e.message))
                      }
                    >
                      Rouvrir
                    </AdminButton>
                  )}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-admin-ink">{l.description}</p>
              <p className="mt-2 text-xs text-admin-mute">
                {new Date(l.createdAt).toLocaleString('fr-FR')}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
