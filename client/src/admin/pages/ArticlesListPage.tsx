import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { Article } from '../../api/types';
import {
  AdminButton,
  AdminSelect,
  EmptyState,
  ErrorBanner,
  PageHeader,
  StatusBadge,
} from '../components/ui';

export function ArticlesListPage() {
  const [params, setParams] = useSearchParams();
  const statut = params.get('statut') || '';
  const [items, setItems] = useState<Article[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await adminApi.listArticles(statut || undefined);
    setItems(res.data);
  };

  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [statut]);

  return (
    <div>
      <PageHeader
        title="Articles"
        description="Actualités du cabinet — brouillon, publication, programmation."
        actions={
          <Link to="/admin/articles/new">
            <AdminButton type="button">
              <Plus size={16} /> Nouvel article
            </AdminButton>
          </Link>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}

      <div className="mb-4 max-w-xs">
        <AdminSelect
          label="Filtrer par statut"
          value={statut}
          onChange={(e) => {
            if (e.target.value) setParams({ statut: e.target.value });
            else setParams({});
          }}
        >
          <option value="">Tous</option>
          <option value="brouillon">Brouillon</option>
          <option value="publie">Publié</option>
          <option value="programme">Programmé</option>
        </AdminSelect>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Aucun article." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-admin-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-admin-border bg-admin-bg text-xs uppercase text-admin-mute">
              <tr>
                <th className="px-4 py-2.5 font-medium">Titre</th>
                <th className="px-4 py-2.5 font-medium">Catégorie</th>
                <th className="px-4 py-2.5 font-medium">Statut</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <Link to={`/admin/articles/${a.id}`} className="font-medium text-admin-accent hover:underline">
                      {a.titreFR}
                    </Link>
                    <p className="text-xs text-admin-mute">/{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-admin-mute">{a.categorie}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <AdminButton
                        variant="ghost"
                        type="button"
                        title="Dupliquer"
                        onClick={() =>
                          void adminApi
                            .duplicateArticle(a.id)
                            .then(load)
                            .catch((e) => setError(e.message))
                        }
                      >
                        <Copy size={14} />
                      </AdminButton>
                      <AdminButton
                        variant="ghost"
                        type="button"
                        title="Supprimer"
                        onClick={() => {
                          if (!window.confirm('Supprimer ?')) return;
                          void adminApi
                            .deleteArticle(a.id)
                            .then(load)
                            .catch((e) => setError(e.message));
                        }}
                      >
                        <Trash2 size={14} />
                      </AdminButton>
                    </div>
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
