import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { AdminCard, PageHeader, StatusBadge } from '../components/ui';

export function DashboardPage() {
  const [stats, setStats] = useState({
    pages: 0,
    articles: 0,
    brouillons: 0,
    evenements: 0,
    leadsNouveaux: 0,
  });
  const [recentLeads, setRecentLeads] = useState<
    { id: string; nom: string; service: string; statut: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    void (async () => {
      const [pages, articles, evenements, leads] = await Promise.all([
        adminApi.listPages(),
        adminApi.listArticles(),
        adminApi.listEvenements(),
        adminApi.listLeads(),
      ]);
      setStats({
        pages: pages.data.length,
        articles: articles.data.filter((a) => a.statut === 'publie').length,
        brouillons: articles.data.filter((a) => a.statut === 'brouillon').length,
        evenements: evenements.data.length,
        leadsNouveaux: leads.data.filter((l) => l.statut === 'nouveau').length,
      });
      setRecentLeads(leads.data.slice(0, 5));
    })();
  }, []);

  const cards = [
    { label: 'Pages', value: stats.pages, to: '/admin/pages' },
    { label: 'Articles publiés', value: stats.articles, to: '/admin/articles' },
    { label: 'Brouillons', value: stats.brouillons, to: '/admin/articles?statut=brouillon' },
    { label: 'Événements', value: stats.evenements, to: '/admin/evenements' },
    { label: 'Leads nouveaux', value: stats.leadsNouveaux, to: '/admin/leads' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue d’ensemble du contenu et des demandes."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-lg border border-admin-border bg-white p-4 transition hover:border-admin-accent/40"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-admin-mute">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-admin-ink">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <AdminCard title="Dernières demandes" actions={<Link to="/admin/leads" className="text-sm text-admin-accent">Voir tout</Link>}>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-admin-mute">Aucune demande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-admin-border">
              {recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-admin-ink">{l.nom}</p>
                    <p className="text-admin-mute">{l.service}</p>
                  </div>
                  <StatusBadge status={l.statut} />
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
