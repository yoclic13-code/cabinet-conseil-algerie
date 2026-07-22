import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requireAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ensureUploadDir } from './services/upload';

import publicPages from './routes/public/pages';
import publicSections from './routes/public/sections';
import publicArticles from './routes/public/articles';
import publicEvenements from './routes/public/evenements';
import publicSecteurs from './routes/public/secteurs';
import publicZones from './routes/public/zones';
import publicReferences from './routes/public/references';
import contactFlow from './routes/public/contactFlow';
import seoFiles from './routes/public/seoFiles';

import adminAuth from './routes/admin/auth';
import adminPages from './routes/admin/pages';
import adminSections from './routes/admin/sections';
import adminUpload from './routes/admin/upload';
import adminArticles from './routes/admin/articles';
import adminEvenements from './routes/admin/evenements';
import adminSecteurs from './routes/admin/secteurs';
import adminZones from './routes/admin/zones';
import adminReferences from './routes/admin/references';
import adminLeads from './routes/admin/leads';
import adminSettings from './routes/admin/settings';
import adminSeo from './routes/admin/seo';

export async function createApp() {
  await ensureUploadDir();

  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(env.uploadDirAbsolute));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'cabinet-conseil-api',
      timestamp: new Date().toISOString(),
    });
  });

  // SEO files à la racine API (aussi accessibles via reverse-proxy racine site)
  app.use(seoFiles);

  // Routes publiques
  app.use('/api/pages', publicPages);
  app.use('/api/sections', publicSections);
  app.use('/api/articles', publicArticles);
  app.use('/api/evenements', publicEvenements);
  app.use('/api/secteurs', publicSecteurs);
  app.use('/api/zones', publicZones);
  app.use('/api/references', publicReferences);
  app.use('/api/contact-flow', contactFlow);

  // Auth admin (login public, me/logout protégés dans le router)
  app.use('/api/admin/auth', adminAuth);

  // Routes admin protégées
  const admin = express.Router();
  admin.use(requireAuth);
  admin.use('/pages', adminPages);
  admin.use('/sections', adminSections);
  admin.use('/upload', adminUpload);
  admin.use('/articles', adminArticles);
  admin.use('/evenements', adminEvenements);
  admin.use('/secteurs', adminSecteurs);
  admin.use('/zones', adminZones);
  admin.use('/references', adminReferences);
  admin.use('/leads', adminLeads);
  admin.use('/settings', adminSettings);
  admin.use('/seo', adminSeo);
  app.use('/api/admin', admin);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
