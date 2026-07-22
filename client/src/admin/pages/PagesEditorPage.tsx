import { useCallback, useEffect, useState } from 'react';
import { Eye, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/admin';
import {
  defaultSectionContent,
  SECTION_TYPE_OPTIONS,
  type Page,
  type Section,
  type SectionTypeApi,
} from '../../api/types';
import { SortableList } from '../components/SortableList';
import { SectionForm } from '../components/SectionForm';
import {
  AdminButton,
  AdminCard,
  AdminSelect,
  EmptyState,
  ErrorBanner,
  PageHeader,
  SuccessBanner,
} from '../components/ui';

export function PagesEditorPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageId, setPageId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newType, setNewType] = useState<SectionTypeApi>('texte');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPages = useCallback(async () => {
    const res = await adminApi.listPages();
    setPages(res.data);
    if (!pageId && res.data[0]) setPageId(res.data[0].id);
  }, [pageId]);

  const loadSections = useCallback(async (id: string) => {
    const res = await adminApi.listSections(id, true);
    setSections(res.data);
    setSelectedId((prev) => (prev && res.data.some((s) => s.id === prev) ? prev : res.data[0]?.id ?? null));
  }, []);

  useEffect(() => {
    void loadPages().catch((err) => setError(err.message));
  }, [loadPages]);

  useEffect(() => {
    if (!pageId) return;
    void loadSections(pageId).catch((err) => setError(err.message));
  }, [pageId, loadSections]);

  const selected = sections.find((s) => s.id === selectedId) || null;
  const currentPage = pages.find((p) => p.id === pageId);

  const persistOrder = async (next: Section[]) => {
    setSections(next);
    const items = next.map((s, ordre) => ({ id: s.id, ordre }));
    await adminApi.reorderSections(items);
    setSuccess('Ordre enregistré');
  };

  const addSection = async () => {
    if (!pageId) return;
    setError('');
    const res = await adminApi.createSection({
      pageId,
      type: newType,
      visible: false,
      contenuFR: defaultSectionContent(newType),
      contenuEN: defaultSectionContent(newType),
    });
    setSections((prev) => [...prev, res.data]);
    setSelectedId(res.data.id);
    setSuccess('Section créée (invisible — activez « Visible » pour publier)');
  };

  const saveSelected = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const res = await adminApi.updateSection(selected.id, {
        type: selected.type,
        visible: selected.visible,
        contenuFR: selected.contenuFR,
        contenuEN: selected.contenuEN,
      });
      setSections((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
      setSuccess('Section enregistrée');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const removeSelected = async () => {
    if (!selected || !window.confirm('Supprimer cette section ?')) return;
    await adminApi.deleteSection(selected.id);
    const next = sections.filter((s) => s.id !== selected.id);
    setSections(next);
    setSelectedId(next[0]?.id ?? null);
    setSuccess('Section supprimée');
  };

  const previewUrl = currentPage
    ? `/?preview=1&page=${encodeURIComponent(currentPage.slug)}`
    : '/';

  return (
    <div>
      <PageHeader
        title="Éditeur de pages"
        description="Sections dynamiques, drag & drop, FR/EN."
        actions={
          <>
            <AdminButton
              variant="secondary"
              type="button"
              onClick={() => window.open(previewUrl, '_blank')}
            >
              <Eye size={16} /> Aperçu
            </AdminButton>
            <AdminButton type="button" onClick={() => void saveSelected()} disabled={!selected || saving}>
              <Save size={16} /> {saving ? '…' : 'Enregistrer'}
            </AdminButton>
          </>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <AdminSelect label="Page" value={pageId} onChange={(e) => setPageId(e.target.value)}>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                /{p.slug}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div className="min-w-[180px]">
          <AdminSelect
            label="Nouvelle section"
            value={newType}
            onChange={(e) => setNewType(e.target.value as SectionTypeApi)}
          >
            {SECTION_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </AdminSelect>
        </div>
        <AdminButton type="button" onClick={() => void addSection().catch((e) => setError(e.message))}>
          <Plus size={16} /> Ajouter
        </AdminButton>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <AdminCard title="Sections (glisser pour classer)">
          {sections.length === 0 ? (
            <EmptyState message="Aucune section. Ajoutez-en une." />
          ) : (
            <SortableList
              items={sections}
              onReorder={(next) => void persistOrder(next).catch((e) => setError(e.message))}
              renderItem={(s) => (
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left ${selectedId === s.id ? 'text-admin-accent' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{s.type}</span>
                    <span className="text-[10px] uppercase text-admin-mute">
                      {s.visible ? 'visible' : 'masqué'}
                    </span>
                  </div>
                  <p className="truncate text-xs text-admin-mute">
                    {String((s.contenuFR as { title?: string })?.title || 'Sans titre')}
                  </p>
                </button>
              )}
            />
          )}
        </AdminCard>

        <AdminCard
          title="Édition de la section"
          actions={
            selected ? (
              <AdminButton variant="danger" type="button" onClick={() => void removeSelected()}>
                <Trash2 size={14} /> Supprimer
              </AdminButton>
            ) : null
          }
        >
          {!selected ? (
            <EmptyState message="Sélectionnez une section." />
          ) : (
            <SectionForm
              section={selected}
              onChange={(patch) =>
                setSections((prev) =>
                  prev.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)),
                )
              }
            />
          )}
        </AdminCard>
      </div>
    </div>
  );
}
