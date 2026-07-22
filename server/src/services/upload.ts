import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

const memoryStorage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new AppError(400, 'Seules les images sont acceptées', 'INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
});

export async function ensureUploadDir() {
  await fs.mkdir(env.uploadDirAbsolute, { recursive: true });
}

/** Compresse et convertit en WebP, enregistre sur disque, retourne le chemin public */
export async function processAndSaveImage(file: Express.Multer.File): Promise<{
  filename: string;
  url: string;
  width: number;
  height: number;
}> {
  await ensureUploadDir();

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const absolutePath = path.join(env.uploadDirAbsolute, filename);

  const image = sharp(file.buffer).rotate();
  const meta = await image.metadata();

  await image
    .resize({
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(absolutePath);

  return {
    filename,
    url: `/uploads/${filename}`,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}
