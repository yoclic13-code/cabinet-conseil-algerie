import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { Reference, Secteur, Zone } from '../../api/types';
import { SortableList } from '../components/SortableList';
import { ImageUpload } from '../components/ImageUpload';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  EmptyState,
  ErrorBanner,
  PageHeader,
  SuccessBanner,
} from '../components/ui';

export function SecteursPage() {
  const [items, setItems] = useState<Secteur[]>([]);
  const [selected, setSelected] = useState<Secteur | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    const res = await adminApi.listSecteurs();
    setItems(res.data);
  }, []);

  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [load]);

  const create = async () => {
    const res = await adminApi.createSecteur({
      nomFR: 'Nouveau secteur',
      nomEN: 'New sector',
    });
    setItems((p) => [...p, res.data]);
    setSelected(res.data);
  };

  const save = async () => {
    if (!selected) return;
    const res = await adminApi.updateSecteur(selected.id, selected);
    setItems((p) => p.map((i) => (i.id === res.data.id ? res.data : i)));
    setSelected(res.data);
    setSuccess('Secteur enregistré');
  };

  return (
    <CrudShell
      title="Secteurs d’activité"
      error={error}
      success={success}
      onAdd={() => void create().catch((e) => setError(e.message))}
      list={
        items.length === 0 ? (
          <EmptyState message="Aucun secteur." />
        ) : (
          <SortableList
            items={items}
            onReorder={(next) => {
              setItems(next);
              void adminApi
                .reorderSecteurs(next.map((i, ordre) => ({ id: i.id, ordre })))
                .then(() => setSuccess('Ordre enregistré'));
            }}
            renderItem={(s) => (
              <button type="button" className="w-full text-left text-sm" onClick={() => setSelected(s)}>
                <span className="font-medium">{s.nomFR}</span>
                <span className="ml-2 text-xs text-admin-mute">{s.nomEN}</span>
              </button>
            )}
          />
        )
      }
      editor={
        !selected ? (
          <EmptyState message="Sélectionnez un secteur." />
        ) : (
          <div className="space-y-3">
            <AdminInput label="Nom FR" value={selected.nomFR} onChange={(e) => setSelected({ ...selected, nomFR: e.target.value })} />
            <AdminInput label="Nom EN" value={selected.nomEN} onChange={(e) => setSelected({ ...selected, nomEN: e.target.value })} />
            <AdminInput label="Icône" value={selected.icone || ''} onChange={(e) => setSelected({ ...selected, icone: e.target.value })} />
            <AdminTextarea label="Description FR" rows={3} value={selected.descriptionFR || ''} onChange={(e) => setSelected({ ...selected, descriptionFR: e.target.value })} />
            <AdminTextarea label="Description EN" rows={3} value={selected.descriptionEN || ''} onChange={(e) => setSelected({ ...selected, descriptionEN: e.target.value })} />
            <div className="flex gap-2">
              <AdminButton type="button" onClick={() => void save().catch((e) => setError(e.message))}>
                <Save size={14} /> Enregistrer
              </AdminButton>
              <AdminButton
                variant="danger"
                type="button"
                onClick={() => {
                  if (!window.confirm('Supprimer ?')) return;
                  void adminApi.deleteSecteur(selected.id).then(() => {
                    setSelected(null);
                    return load();
                  });
                }}
              >
                <Trash2 size={14} />
              </AdminButton>
            </div>
          </div>
        )
      }
    />
  );
}

export function ZonesPage() {
  const [items, setItems] = useState<Zone[]>([]);
  const [selected, setSelected] = useState<Zone | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    const res = await adminApi.listZones();
    setItems(res.data);
  }, []);

  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [load]);

  const create = async () => {
    const res = await adminApi.createZone({
      paysRegionFR: 'Nouvelle zone',
      paysRegionEN: 'New zone',
      descriptionFR: 'Description courte',
      descriptionEN: 'Short description',
      niveau: 'algerie',
    });
    setItems((p) => [...p, res.data]);
    setSelected(res.data);
  };

  return (
    <CrudShell
      title="Zones d’intervention"
      error={error}
      success={success}
      onAdd={() => void create().catch((e) => setError(e.message))}
      list={
        items.length === 0 ? (
          <EmptyState message="Aucune zone." />
        ) : (
          <SortableList
            items={items}
            onReorder={(next) => {
              setItems(next);
              void adminApi.reorderZones(next.map((i, ordre) => ({ id: i.id, ordre }))).then(() => setSuccess('Ordre enregistré'));
            }}
            renderItem={(z) => (
              <button type="button" className="w-full text-left text-sm" onClick={() => setSelected(z)}>
                <span className="font-medium">{z.paysRegionFR}</span>
                <span className="ml-2 text-xs uppercase text-admin-mute">{z.niveau}</span>
              </button>
            )}
          />
        )
      }
      editor={
        !selected ? (
          <EmptyState message="Sélectionnez une zone." />
        ) : (
          <div className="space-y-3">
            <AdminInput label="Pays/région FR" value={selected.paysRegionFR} onChange={(e) => setSelected({ ...selected, paysRegionFR: e.target.value })} />
            <AdminInput label="Pays/région EN" value={selected.paysRegionEN} onChange={(e) => setSelected({ ...selected, paysRegionEN: e.target.value })} />
            <AdminTextarea label="Description FR" rows={3} value={selected.descriptionFR} onChange={(e) => setSelected({ ...selected, descriptionFR: e.target.value })} />
            <AdminTextarea label="Description EN" rows={3} value={selected.descriptionEN} onChange={(e) => setSelected({ ...selected, descriptionEN: e.target.value })} />
            <AdminSelect label="Niveau" value={selected.niveau} onChange={(e) => setSelected({ ...selected, niveau: e.target.value })}>
              <option value="algerie">Algérie</option>
              <option value="afrique">Afrique</option>
              <option value="international">International</option>
            </AdminSelect>
            <div className="flex gap-2">
              <AdminButton
                type="button"
                onClick={() =>
                  void adminApi
                    .updateZone(selected.id, selected)
                    .then((r) => {
                      setSelected(r.data);
                      setSuccess('Zone enregistrée');
                      return load();
                    })
                    .catch((e) => setError(e.message))
                }
              >
                <Save size={14} /> Enregistrer
              </AdminButton>
              <AdminButton
                variant="danger"
                type="button"
                onClick={() => {
                  if (!window.confirm('Supprimer ?')) return;
                  void adminApi.deleteZone(selected.id).then(() => {
                    setSelected(null);
                    return load();
                  });
                }}
              >
                <Trash2 size={14} />
              </AdminButton>
            </div>
          </div>
        )
      }
    />
  );
}

export function ReferencesPage() {
  const [items, setItems] = useState<Reference[]>([]);
  const [selected, setSelected] = useState<Reference | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    const res = await adminApi.listReferences();
    setItems(res.data);
  }, []);

  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [load]);

  const create = async () => {
    const res = await adminApi.createReference({
      nom: 'Nouveau client',
      logo: '/uploads/placeholder.webp',
    });
    setItems((p) => [...p, res.data]);
    setSelected(res.data);
  };

  return (
    <CrudShell
      title="Références clients"
      error={error}
      success={success}
      onAdd={() => void create().catch((e) => setError(e.message))}
      list={
        items.length === 0 ? (
          <EmptyState message="Aucune référence." />
        ) : (
          <SortableList
            items={items}
            onReorder={(next) => {
              setItems(next);
              void adminApi
                .reorderReferences(next.map((i, ordre) => ({ id: i.id, ordre })))
                .then(() => setSuccess('Ordre enregistré'));
            }}
            renderItem={(r) => (
              <button type="button" className="flex w-full items-center gap-3 text-left text-sm" onClick={() => setSelected(r)}>
                {r.logo ? <img src={r.logo} alt="" className="h-8 w-8 object-contain" /> : null}
                <span className="font-medium">{r.nom}</span>
              </button>
            )}
          />
        )
      }
      editor={
        !selected ? (
          <EmptyState message="Sélectionnez une référence." />
        ) : (
          <div className="space-y-3">
            <AdminInput label="Nom" value={selected.nom} onChange={(e) => setSelected({ ...selected, nom: e.target.value })} />
            <AdminInput label="URL" value={selected.url || ''} onChange={(e) => setSelected({ ...selected, url: e.target.value })} />
            <ImageUpload value={selected.logo} onChange={(url) => setSelected({ ...selected, logo: url || '' })} label="Logo" />
            <div className="flex gap-2">
              <AdminButton
                type="button"
                onClick={() =>
                  void adminApi
                    .updateReference(selected.id, selected)
                    .then((r) => {
                      setSelected(r.data);
                      setSuccess('Référence enregistrée');
                      return load();
                    })
                }
              >
                <Save size={14} /> Enregistrer
              </AdminButton>
              <AdminButton
                variant="danger"
                type="button"
                onClick={() => {
                  if (!window.confirm('Supprimer ?')) return;
                  void adminApi.deleteReference(selected.id).then(() => {
                    setSelected(null);
                    return load();
                  });
                }}
              >
                <Trash2 size={14} />
              </AdminButton>
            </div>
          </div>
        )
      }
    />
  );
}

function CrudShell({
  title,
  error,
  success,
  onAdd,
  list,
  editor,
}: {
  title: string;
  error: string;
  success: string;
  onAdd: () => void;
  list: React.ReactNode;
  editor: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <AdminButton type="button" onClick={onAdd}>
            <Plus size={16} /> Ajouter
          </AdminButton>
        }
      />
      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <AdminCard title="Liste (glisser pour classer)">{list}</AdminCard>
        <AdminCard title="Édition">{editor}</AdminCard>
      </div>
    </div>
  );
}
