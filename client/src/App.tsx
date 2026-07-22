import { Routes, Route } from 'react-router-dom';

/**
 * Scaffold Phase 1 — routes publiques / admin seront branchées aux phases suivantes.
 */
function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <main className="mx-auto flex min-h-screen max-w-editorial flex-col justify-center px-6 py-16">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-ocre-500">
                Phase 1 — Setup
              </p>
              <h1 className="font-display text-display-lg text-night-900 md:text-display-xl">
                Cabinet Conseil Algérie
              </h1>
              <p className="mt-5 max-w-measure text-lg leading-relaxed text-slate-soft">
                QSE · HSE · Environnement — rayonnement Algérie, Afrique & International. Le
                monorepo est initialisé ; le contenu dynamique arrivera aux phases suivantes.
              </p>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
