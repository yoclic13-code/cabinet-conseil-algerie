import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './admin/AuthContext';
import { AdminLayout } from './admin/components/AdminLayout';
import { LoginPage } from './admin/pages/LoginPage';
import { DashboardPage } from './admin/pages/DashboardPage';
import { PagesEditorPage } from './admin/pages/PagesEditorPage';
import { ArticlesListPage } from './admin/pages/ArticlesListPage';
import { ArticleEditPage } from './admin/pages/ArticleEditPage';
import { EvenementsListPage, EvenementEditPage } from './admin/pages/EvenementsPages';
import { SecteursPage, ZonesPage, ReferencesPage } from './admin/pages/CatalogPages';
import { LeadsPage } from './admin/pages/LeadsPage';
import { SeoPage } from './admin/pages/SeoPage';
import { SettingsPage } from './admin/pages/SettingsPage';

function PublicHome() {
  return (
    <main className="mx-auto flex min-h-screen max-w-editorial flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-ocre-500">
        Site public — Phase 5 à venir
      </p>
      <h1 className="font-display text-display-lg text-night-900 md:text-display-xl">
        Cabinet Conseil Algérie
      </h1>
      <p className="mt-5 max-w-measure text-lg leading-relaxed text-slate-soft">
        QSE · HSE · Environnement — rayonnement Algérie, Afrique & International.
      </p>
      <a
        href="/admin"
        className="mt-8 inline-flex w-fit text-sm font-medium text-night-800 underline-offset-4 hover:underline"
      >
        Accéder à l’administration →
      </a>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicHome />} />

        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pages" element={<PagesEditorPage />} />
          <Route path="articles" element={<ArticlesListPage />} />
          <Route path="articles/:id" element={<ArticleEditPage />} />
          <Route path="evenements" element={<EvenementsListPage />} />
          <Route path="evenements/:id" element={<EvenementEditPage />} />
          <Route path="secteurs" element={<SecteursPage />} />
          <Route path="zones" element={<ZonesPage />} />
          <Route path="references" element={<ReferencesPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="seo" element={<SeoPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
