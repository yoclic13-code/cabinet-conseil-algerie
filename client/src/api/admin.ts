import { api } from './client';
import type {
  AdminUser,
  Article,
  Evenement,
  Lead,
  Page,
  Reference,
  Section,
  SectionTypeApi,
  SeoMeta,
  Secteur,
  Settings,
  Zone,
} from './types';

export const adminApi = {
  login: (email: string, password: string) =>
    api.post<{ user: AdminUser; token: string }>('/api/admin/auth/login', { email, password }),

  logout: () => api.post<{ ok: boolean }>('/api/admin/auth/logout'),

  me: () => api.get<{ user: AdminUser }>('/api/admin/auth/me'),

  // Pages / sections
  listPages: () => api.get<{ data: Page[] }>('/api/admin/pages'),
  createPage: (body: { slug?: string; titreHint?: string; ordre?: number }) =>
    api.post<{ data: Page }>('/api/admin/pages', body),
  updatePage: (id: string, body: { slug?: string; ordre?: number }) =>
    api.patch<{ data: Page }>(`/api/admin/pages/${id}`, body),
  deletePage: (id: string) => api.delete(`/api/admin/pages/${id}`),

  listSections: (pageId: string, includeHidden = true) =>
    api.get<{ data: Section[] }>(
      `/api/admin/sections?pageId=${encodeURIComponent(pageId)}&includeHidden=${includeHidden}`,
    ),
  createSection: (body: {
    pageId: string;
    type: SectionTypeApi;
    visible?: boolean;
    contenuFR: Record<string, unknown>;
    contenuEN: Record<string, unknown>;
    ordre?: number;
  }) => api.post<{ data: Section }>('/api/admin/sections', body),
  updateSection: (
    id: string,
    body: Partial<{
      type: SectionTypeApi;
      visible: boolean;
      contenuFR: Record<string, unknown>;
      contenuEN: Record<string, unknown>;
      ordre: number;
    }>,
  ) => api.patch<{ data: Section }>(`/api/admin/sections/${id}`, body),
  deleteSection: (id: string) => api.delete(`/api/admin/sections/${id}`),
  reorderSections: (items: { id: string; ordre: number }[]) =>
    api.patch<{ ok: boolean }>('/api/admin/sections/order', { items }),

  upload: (file: File, altFR?: string, altEN?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    if (altFR) fd.append('altFR', altFR);
    if (altEN) fd.append('altEN', altEN);
    return api.upload<{ data: { id: string; url: string } }>('/api/admin/upload', fd);
  },

  // Articles
  listArticles: (statut?: string) =>
    api.get<{ data: Article[] }>(
      statut ? `/api/admin/articles?statut=${statut}` : '/api/admin/articles',
    ),
  getArticle: (id: string) => api.get<{ data: Article }>(`/api/admin/articles/${id}`),
  createArticle: (body: Record<string, unknown>) =>
    api.post<{ data: Article }>('/api/admin/articles', body),
  updateArticle: (id: string, body: Record<string, unknown>) =>
    api.patch<{ data: Article }>(`/api/admin/articles/${id}`, body),
  duplicateArticle: (id: string) =>
    api.post<{ data: Article }>(`/api/admin/articles/${id}/duplicate`),
  deleteArticle: (id: string) => api.delete(`/api/admin/articles/${id}`),

  // Événements
  listEvenements: () => api.get<{ data: Evenement[] }>('/api/admin/evenements'),
  getEvenement: (id: string) => api.get<{ data: Evenement }>(`/api/admin/evenements/${id}`),
  createEvenement: (body: Record<string, unknown>) =>
    api.post<{ data: Evenement }>('/api/admin/evenements', body),
  updateEvenement: (id: string, body: Record<string, unknown>) =>
    api.patch<{ data: Evenement }>(`/api/admin/evenements/${id}`, body),
  deleteEvenement: (id: string) => api.delete(`/api/admin/evenements/${id}`),

  // Secteurs / zones / refs
  listSecteurs: () => api.get<{ data: Secteur[] }>('/api/admin/secteurs'),
  createSecteur: (body: Partial<Secteur>) =>
    api.post<{ data: Secteur }>('/api/admin/secteurs', body),
  updateSecteur: (id: string, body: Partial<Secteur>) =>
    api.patch<{ data: Secteur }>(`/api/admin/secteurs/${id}`, body),
  deleteSecteur: (id: string) => api.delete(`/api/admin/secteurs/${id}`),
  reorderSecteurs: (items: { id: string; ordre: number }[]) =>
    api.patch<{ ok: boolean }>('/api/admin/secteurs/order', { items }),

  listZones: () => api.get<{ data: Zone[] }>('/api/admin/zones'),
  createZone: (body: Partial<Zone>) =>
    api.post<{ data: Zone }>('/api/admin/zones', body),
  updateZone: (id: string, body: Partial<Zone>) =>
    api.patch<{ data: Zone }>(`/api/admin/zones/${id}`, body),
  deleteZone: (id: string) => api.delete(`/api/admin/zones/${id}`),
  reorderZones: (items: { id: string; ordre: number }[]) =>
    api.patch<{ ok: boolean }>('/api/admin/zones/order', { items }),

  listReferences: () => api.get<{ data: Reference[] }>('/api/admin/references'),
  createReference: (body: Partial<Reference>) =>
    api.post<{ data: Reference }>('/api/admin/references', body),
  updateReference: (id: string, body: Partial<Reference>) =>
    api.patch<{ data: Reference }>(`/api/admin/references/${id}`, body),
  deleteReference: (id: string) => api.delete(`/api/admin/references/${id}`),
  reorderReferences: (items: { id: string; ordre: number }[]) =>
    api.patch<{ ok: boolean }>('/api/admin/references/order', { items }),

  // Leads
  listLeads: (statut?: string) =>
    api.get<{ data: Lead[] }>(
      statut ? `/api/admin/leads?statut=${statut}` : '/api/admin/leads',
    ),
  updateLead: (id: string, statut: 'nouveau' | 'traite') =>
    api.patch<{ data: Lead }>(`/api/admin/leads/${id}`, { statut }),
  deleteLead: (id: string) => api.delete(`/api/admin/leads/${id}`),
  exportLeadsCsvUrl: (statut?: string) =>
    statut ? `/api/admin/leads/export.csv?statut=${statut}` : '/api/admin/leads/export.csv',

  // Settings / SEO
  getSettings: () => api.get<{ data: Settings }>('/api/admin/settings'),
  updateSettings: (body: Record<string, unknown>) =>
    api.put<{ data: Settings }>('/api/admin/settings', body),
  listSeo: () => api.get<{ data: (SeoMeta & { page?: Page })[] }>('/api/admin/seo'),
  getSeoByPage: (pageId: string) =>
    api.get<{ data: SeoMeta | null }>(`/api/admin/seo/by-page/${pageId}`),
  upsertSeo: (body: Record<string, unknown>) => api.put<{ data: SeoMeta }>('/api/admin/seo', body),
};
