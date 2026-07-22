import { AppError } from '../lib/errors';
import { env } from '../config/env';

const API_HOSTS = ['https://api.freepik.com', 'https://api.magnific.com'] as const;
const API_KEY_HEADERS = ['x-freepik-api-key', 'x-magnific-api-key'] as const;

export interface FreepikLicense {
  type: string;
  url: string;
}

export interface FreepikAuthor {
  id: number;
  name: string;
  avatar?: string;
  slug?: string;
}

export interface FreepikResource {
  id: number;
  title: string;
  url: string;
  filename?: string;
  licenses: FreepikLicense[];
  image?: {
    type?: string;
    orientation?: string;
    source?: { key?: string; url?: string; size?: string };
  };
  author?: FreepikAuthor;
  stats?: { downloads?: number; likes?: number };
}

export interface FreepikSearchOptions {
  page?: number;
  limit?: number;
  order?: 'relevance' | 'recent';
  contentType?: 'photo' | 'vector' | 'psd';
  orientation?: 'landscape' | 'portrait' | 'square' | 'panoramic';
  color?: 'black' | 'gray' | 'white' | 'blue' | 'green';
  /** Exclure les images générées par IA (filters[ai-generated][excluded]=1) */
  excludeAiGenerated?: boolean;
  /** Pas de filtre freemium — abonnement premium */
}

export interface FreepikDownloadResult {
  filename: string;
  url: string;
  signed_url?: string | null;
}

export class FreepikError extends AppError {
  constructor(
    statusCode: number,
    message: string,
    code: string,
    public freepikStatus?: number,
  ) {
    super(statusCode, message, code);
    this.name = 'FreepikError';
  }
}

function assertConfigured() {
  if (!env.freepikConfigured) {
    throw new FreepikError(
      503,
      'FREEPIK_API_KEY non configurée côté serveur',
      'FREEPIK_NOT_CONFIGURED',
    );
  }
}

async function freepikFetch<T>(
  path: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  assertConfigured();
  const apiKey = env.FREEPIK_API_KEY!;

  const qs = new URLSearchParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';

  let lastError: unknown;

  for (const host of API_HOSTS) {
    for (const headerName of API_KEY_HEADERS) {
      try {
        const res = await fetch(`${host}${path}${suffix}`, {
          headers: {
            [headerName]: apiKey,
            'Accept-Language': 'en-US',
          },
        });

        const text = await res.text();
        let body: unknown = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch {
          body = { message: text };
        }

        if (res.status === 401 && headerName === API_KEY_HEADERS[0]) {
          continue;
        }

        if (res.status === 403) {
          const msg =
            typeof body === 'object' && body && 'message' in body
              ? String((body as { message: string }).message)
              : 'Ressource Freepik non autorisée (403)';
          throw new FreepikError(
            403,
            msg,
            'FREEPIK_FORBIDDEN',
            403,
          );
        }

        if (res.status === 429) {
          throw new FreepikError(
            429,
            'Quota Freepik dépassé — réessayez plus tard ou vérifiez votre plan',
            'FREEPIK_RATE_LIMIT',
            429,
          );
        }

        if (!res.ok) {
          const msg =
            typeof body === 'object' && body && 'message' in body
              ? String((body as { message: string }).message)
              : `Erreur Freepik HTTP ${res.status}`;
          throw new FreepikError(
            res.status >= 500 ? 502 : res.status,
            msg,
            'FREEPIK_API_ERROR',
            res.status,
          );
        }

        return body as T;
      } catch (err) {
        if (err instanceof FreepikError) throw err;
        lastError = err;
      }
    }
  }

  throw new FreepikError(
    502,
    lastError instanceof Error ? lastError.message : 'Impossible de joindre l’API Freepik',
    'FREEPIK_UNAVAILABLE',
  );
}

function buildFilterParams(options: FreepikSearchOptions): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const ct = options.contentType ?? 'photo';
  params[`filters[content_type][${ct}]`] = 1;

  if (options.orientation === 'landscape') params['filters[orientation][landscape]'] = 1;
  if (options.orientation === 'portrait') params['filters[orientation][portrait]'] = 1;
  if (options.orientation === 'square') params['filters[orientation][square]'] = 1;
  if (options.orientation === 'panoramic') params['filters[orientation][panoramic]'] = 1;

  if (options.color) params['filters[color]'] = options.color;

  // Exclure le contenu IA par défaut — ne garder que de vraies photographies
  if (options.excludeAiGenerated !== false) {
    params['filters[ai-generated][excluded]'] = 1;
  }

  return params;
}

/** Recherche stock Freepik — sans filtre freemium (premium) */
export async function searchFreepikResources(
  term: string,
  options: FreepikSearchOptions = {},
) {
  const filterParams = buildFilterParams(options);
  const response = await freepikFetch<{
    data: FreepikResource[];
    meta?: { current_page: number; last_page: number; per_page: number; total: number };
  }>('/v1/resources', {
    term,
    page: options.page ?? 1,
    limit: Math.min(options.limit ?? 20, 50),
    order: options.order ?? 'relevance',
    ...filterParams,
  });

  return {
    data: response.data ?? [],
    meta: response.meta,
  };
}

/** Download obligatoire pour conformité licence */
export async function downloadFreepikResource(
  resourceId: number,
  imageSize: 'large' | 'medium' | 'original' = 'large',
) {
  const response = await freepikFetch<{ data: FreepikDownloadResult }>(
    `/v1/resources/${resourceId}/download`,
    { image_size: imageSize },
  );
  return response.data;
}

export async function fetchFreepikImageBuffer(downloadUrl: string): Promise<Buffer> {
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new FreepikError(
      502,
      `Échec téléchargement fichier Freepik (${res.status})`,
      'FREEPIK_DOWNLOAD_FETCH_FAILED',
      res.status,
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Sélectionne le 1er résultat pertinence, ou le plus liké si stats disponibles */
export function pickBestResource(items: FreepikResource[]): FreepikResource | null {
  if (!items.length) return null;
  const withLikes = [...items].sort(
    (a, b) => (b.stats?.likes ?? 0) - (a.stats?.likes ?? 0),
  );
  if ((withLikes[0].stats?.likes ?? 0) > 0) return withLikes[0];
  return items[0];
}
