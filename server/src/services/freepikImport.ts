import { prisma } from '../lib/prisma';
import {
  downloadFreepikResource,
  fetchFreepikImageBuffer,
  pickBestResource,
  searchFreepikResources,
  type FreepikResource,
} from './freepik';
import { processAndSaveImageBuffer } from './upload';

export interface ImportFreepikOptions {
  resourceId: number;
  altFR?: string;
  altEN?: string;
  imageSize?: 'large' | 'medium' | 'original';
}

export async function importFreepikResourceToMedia(
  resource: FreepikResource,
  options: ImportFreepikOptions,
) {
  const download = await downloadFreepikResource(
    options.resourceId,
    options.imageSize ?? 'large',
  );

  const buffer = await fetchFreepikImageBuffer(download.url);
  const saved = await processAndSaveImageBuffer(buffer, {
    sourceFilename: download.filename,
  });

  const license = resource.licenses?.[0];

  const asset = await prisma.mediaAsset.create({
    data: {
      url: saved.url,
      altFR: options.altFR ?? resource.title,
      altEN: options.altEN ?? resource.title,
      source: 'freepik',
      freepikId: resource.id,
      licenseType: license?.type ?? null,
      licenseUrl: license?.url ?? null,
      authorName: resource.author?.name ?? null,
      authorId: resource.author?.id ?? null,
      resourceTitle: resource.title,
      resourcePageUrl: resource.url,
    },
  });

  return { asset, saved, download, resource };
}

export async function searchAndImportBest(
  term: string,
  options: Omit<ImportFreepikOptions, 'resourceId'> & {
    orientation?: 'landscape' | 'portrait' | 'square';
    color?: 'black' | 'gray';
  },
) {
  const { data } = await searchFreepikResources(term, {
    contentType: 'photo',
    orientation: options.orientation,
    color: options.color,
    limit: 12,
    order: 'relevance',
  });

  const best = pickBestResource(data);
  if (!best) {
    return null;
  }

  return importFreepikResourceToMedia(best, {
    ...options,
    resourceId: best.id,
  });
}
