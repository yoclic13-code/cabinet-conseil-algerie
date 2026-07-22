/**
 * Remplace les sections de test de la page Accueil par un contenu éditorial original.
 * Usage: node server/scripts/seed-home-content.mjs
 */
const BASE = process.env.API_URL || 'http://localhost:3001';

async function req(path, { method = 'GET', token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text}`);
  return data;
}

async function main() {
  const login = await req('/api/admin/auth/login', {
    method: 'POST',
    body: { email: 'admin@cabinet-conseil.dz', password: 'Admin123!' },
  });
  const token = login.token;

  const pages = await req('/api/admin/pages', { token });
  const accueil = pages.data.find((p) => p.slug === 'accueil');
  if (!accueil) throw new Error('Page accueil introuvable');

  // Supprimer sections existantes
  const existing = await req(`/api/admin/sections?pageId=${accueil.id}&includeHidden=true`, {
    token,
  });
  for (const s of existing.data) {
    await req(`/api/admin/sections/${s.id}`, { method: 'DELETE', token });
  }

  const sections = [
    {
      type: 'hero',
      contenuFR: {
        title: 'Maîtriser le risque, sécuriser la performance',
        subtitle:
          'Conseil QSE / HSE / Environnement — depuis l’Algérie, au service de projets Afrique & International.',
        ctaLabel: 'Nous contacter',
        ctaHref: '/contact',
        imageUrl: '/images/placeholder-hero.jpg',
      },
      contenuEN: {
        title: 'Master risk, secure performance',
        subtitle:
          'QSE / HSE / Environment consulting — from Algeria, serving Africa & international projects.',
        ctaLabel: 'Contact us',
        ctaHref: '/contact',
        imageUrl: '/images/placeholder-hero.jpg',
      },
    },
    {
      type: 'texte',
      contenuFR: {
        eyebrow: 'Le cabinet',
        title: 'Une lecture terrain du risque industriel',
        body: 'Nous accompagnons directions générales, HSE et opérations sur des sujets où l’exigence réglementaire croise la réalité des sites : conformité, culture sécurité, performance environnementale.\n\nNotre ancrage algérien nous place au plus près des contextes réglementaires et opérationnels locaux, tout en mobilisant des méthodes éprouvées sur des projets continentaux et internationaux.',
      },
      contenuEN: {
        eyebrow: 'The firm',
        title: 'A field-driven reading of industrial risk',
        body: 'We support executives, HSE and operations where regulatory demand meets site reality.',
      },
    },
    {
      type: 'grille-cartes',
      contenuFR: {
        eyebrow: 'Expertises',
        title: 'Domaines d’intervention',
        intro:
          'Des missions structurées, de l’audit initial au déploiement opérationnel, avec une exigence documentaire digne des référentiels internationaux.',
        moreHref: '/expertises',
        moreLabel: 'Toutes les expertises',
        items: [
          {
            title: 'Audit & diagnostic QSE',
            body: 'Écarts réglementaires, maturité des systèmes, priorisation des actions et plan de mise en conformité.',
            href: '/expertises',
          },
          {
            title: 'Études HSE & risques',
            body: 'Analyses de risques, études d’impact et dossiers techniques pour décisions d’investissement.',
            href: '/expertises',
          },
          {
            title: 'Formation & culture sécurité',
            body: 'Parcours terrain pour managers et opérateurs, ancrés dans vos procédures réelles.',
            href: '/expertises',
          },
          {
            title: 'Inspection & conformité',
            body: 'Contrôles documentaires et sur site, traçabilité et préparation aux audits tiers.',
            href: '/expertises',
          },
          {
            title: 'Conseil environnement',
            body: 'Gestion des aspects significatifs, reporting et accompagnement ISO 14001.',
            href: '/expertises',
          },
        ],
      },
      contenuEN: {
        eyebrow: 'Expertise',
        title: 'Areas of practice',
        moreHref: '/expertises',
        items: [
          { title: 'QSE audit & diagnosis', body: 'Gap analysis and compliance roadmap.', href: '/expertises' },
          { title: 'HSE & risk studies', body: 'Risk analysis and technical dossiers.', href: '/expertises' },
          { title: 'Training', body: 'Field-based safety culture programs.', href: '/expertises' },
        ],
      },
    },
    {
      type: 'image-texte',
      contenuFR: {
        eyebrow: 'Méthode',
        title: 'Du diagnostic à la preuve',
        body: 'Chaque mission produit des livrables actionnables : constats classés, responsabilités clarifiées, indicateurs de suivi. Nous privilégions la clarté opérationnelle à la documentation décorative.',
        imageUrl: '/images/placeholder-expertise.jpg',
        imagePosition: 'right',
      },
      contenuEN: {
        eyebrow: 'Method',
        title: 'From diagnosis to evidence',
        body: 'Actionable deliverables over decorative documentation.',
        imageUrl: '/images/placeholder-expertise.jpg',
        imagePosition: 'right',
      },
    },
    {
      type: 'grille-cartes',
      contenuFR: {
        eyebrow: 'Industries',
        title: 'Secteurs d’activité',
        intro: 'Une connaissance des contraintes métier : disponibilité des installations, exigences clients, pressions réglementaires.',
        moreHref: '/secteurs',
        moreLabel: 'Tous les secteurs',
        source: 'secteurs',
      },
      contenuEN: {
        eyebrow: 'Industries',
        title: 'Sectors',
        moreHref: '/secteurs',
        source: 'secteurs',
      },
    },
    {
      type: 'stats',
      contenuFR: {
        eyebrow: 'En chiffres',
        title: 'Une présence structurée',
        items: [
          { value: '15+', label: 'Années d’expérience cumulée sur missions QSE/HSE' },
          { value: '3', label: 'Échelles d’intervention : Algérie, Afrique, International' },
          { value: '40+', label: 'Missions d’audit et d’accompagnement documentées' },
          { value: '48h', label: 'Délai indicatif de première réponse aux demandes' },
        ],
      },
      contenuEN: {
        eyebrow: 'Figures',
        title: 'Structured presence',
        items: [
          { value: '15+', label: 'Years of cumulative QSE/HSE experience' },
          { value: '3', label: 'Scales: Algeria, Africa, International' },
          { value: '40+', label: 'Documented audit and advisory missions' },
          { value: '48h', label: 'Indicative first-response window' },
        ],
      },
    },
    {
      type: 'zones-intervention',
      contenuFR: {
        eyebrow: 'Géographies',
        title: 'Zones d’intervention',
        intro:
          'Des projets locaux aux déploiements multi-pays : une même exigence de rigueur, adaptée aux cadres réglementaires de chaque territoire.',
      },
      contenuEN: {
        eyebrow: 'Geographies',
        title: 'Areas of operation',
        intro: 'From local projects to multi-country deployments.',
      },
    },
    {
      type: 'actualites',
      contenuFR: {
        eyebrow: 'Publications',
        title: 'Actualités récentes',
        limit: 3,
      },
      contenuEN: {
        eyebrow: 'Insights',
        title: 'Latest news',
        limit: 3,
      },
    },
    {
      type: 'logos-clients',
      contenuFR: {
        eyebrow: 'Confiance',
        title: 'Ils nous ont fait confiance',
      },
      contenuEN: {
        eyebrow: 'Trust',
        title: 'Selected references',
      },
    },
    {
      type: 'cta',
      contenuFR: {
        title: 'Un projet réglementaire ou opérationnel à cadrer ?',
        body: 'Décrivez votre contexte : secteur, zone géographique, échéance. Nous revenons vers vous avec une lecture claire des prochaines étapes.',
        buttonLabel: 'Démarrer un échange',
        buttonHref: '/contact',
      },
      contenuEN: {
        title: 'A regulatory or operational project to frame?',
        body: 'Share your context — we respond with clear next steps.',
        buttonLabel: 'Start a conversation',
        buttonHref: '/contact',
      },
    },
    {
      type: 'contact',
      contenuFR: {
        title: 'Parlons de votre projet',
        intro:
          'Audit, étude, formation, inspection ou conseil : une demande structurée, une réponse sous 48 h ouvrées.',
      },
      contenuEN: {
        title: 'Let’s discuss your project',
        intro: 'Audit, study, training, inspection or advisory — response within 2 business days.',
      },
    },
  ];

  const created = [];
  for (const s of sections) {
    const res = await req('/api/admin/sections', {
      method: 'POST',
      token,
      body: {
        pageId: accueil.id,
        type: s.type,
        visible: true,
        contenuFR: s.contenuFR,
        contenuEN: s.contenuEN,
      },
    });
    created.push(res.data);
  }

  await req('/api/admin/sections/order', {
    method: 'PATCH',
    token,
    body: { items: created.map((s, ordre) => ({ id: s.id, ordre })) },
  });

  await req('/api/admin/seo', {
    method: 'PUT',
    token,
    body: {
      pageId: accueil.id,
      titleFR: 'Cabinet Conseil Algérie | QSE HSE Environnement',
      titleEN: 'Algeria Consulting | QSE HSE Environment',
      descriptionFR:
        'Conseil QSE, HSE et Environnement en Algérie. Audits, études, formation — rayonnement Afrique et International.',
      descriptionEN:
        'QSE, HSE and Environment consulting in Algeria. Audits, studies, training across Africa and internationally.',
    },
  });

  // Enrichir catalogues
  const secteurs = [
    {
      nomFR: 'Hydrocarbures & énergie',
      nomEN: 'Oil, gas & energy',
      descriptionFR: 'Exploration, production, downstream et utilities énergétiques.',
      descriptionEN: 'Upstream, downstream and energy utilities.',
      icone: 'energy',
    },
    {
      nomFR: 'Mines & carrières',
      nomEN: 'Mining & quarries',
      descriptionFR: 'Extraction, traitement et sites à risques majeurs.',
      descriptionEN: 'Extraction, processing and major-hazard sites.',
      icone: 'mining',
    },
    {
      nomFR: 'Industrie manufacturière',
      nomEN: 'Manufacturing',
      descriptionFR: 'Usines de process, agroalimentaire et biens d’équipement.',
      descriptionEN: 'Process plants, food and capital goods.',
      icone: 'industry',
    },
    {
      nomFR: 'Infrastructure & BTP',
      nomEN: 'Infrastructure & construction',
      descriptionFR: 'Grands chantiers, concessions et maîtres d’ouvrage.',
      descriptionEN: 'Major works, concessions and project owners.',
      icone: 'infra',
    },
  ];

  const existingSecteurs = await req('/api/admin/secteurs', { token });
  for (const s of existingSecteurs.data) {
    await req(`/api/admin/secteurs/${s.id}`, { method: 'DELETE', token });
  }
  for (const s of secteurs) {
    await req('/api/admin/secteurs', { method: 'POST', token, body: s });
  }

  const zones = [
    {
      paysRegionFR: 'Algérie',
      paysRegionEN: 'Algeria',
      descriptionFR: 'Couverture nationale — Nord, Hauts Plateaux et Sud industriel.',
      descriptionEN: 'Nationwide coverage across North, Highlands and industrial South.',
      niveau: 'algerie',
    },
    {
      paysRegionFR: 'Afrique de l’Ouest & du Nord',
      paysRegionEN: 'West & North Africa',
      descriptionFR: 'Missions multi-pays, coordination réglementaire et locale.',
      descriptionEN: 'Multi-country missions with local regulatory coordination.',
      niveau: 'afrique',
    },
    {
      paysRegionFR: 'International',
      paysRegionEN: 'International',
      descriptionFR: 'Standards internationaux, due diligence et reporting groupe.',
      descriptionEN: 'International standards, due diligence and group reporting.',
      niveau: 'international',
    },
  ];
  const existingZones = await req('/api/admin/zones', { token });
  for (const z of existingZones.data) {
    await req(`/api/admin/zones/${z.id}`, { method: 'DELETE', token });
  }
  for (const z of zones) {
    await req('/api/admin/zones', { method: 'POST', token, body: z });
  }

  const refs = [
    { nom: 'Énergie Maghreb', logo: '/images/placeholder-about.jpg' },
    { nom: 'Industrie Atlas', logo: '/images/placeholder-expertise.jpg' },
    { nom: 'Ports & Logistics SA', logo: '/images/placeholder-hero.jpg' },
    { nom: 'Groupe Saharien', logo: '/images/placeholder-about.jpg' },
  ];
  const existingRefs = await req('/api/admin/references', { token });
  for (const r of existingRefs.data) {
    await req(`/api/admin/references/${r.id}`, { method: 'DELETE', token });
  }
  for (const r of refs) {
    await req('/api/admin/references', { method: 'POST', token, body: r });
  }

  // Améliorer titres articles de démo
  const articles = await req('/api/admin/articles', { token });
  const updates = [
    {
      match: 'article-flux-phase-4',
      titreFR: 'Ce que change la nouvelle lecture du risque HSE sur site',
      extraitFR:
        'Entre exigence documentaire et réalité opérationnelle : comment prioriser les actions sans diluer la responsabilité.',
      categorie: 'HSE',
      statut: 'publie',
    },
    {
      match: 'formation-qse-oran',
      titreFR: 'Former les managers de proximité sans slide décorative',
      extraitFR:
        'Un parcours terrain à Oran : procédures vivantes, retours d’expérience et mesure d’ancrage à 90 jours.',
      categorie: 'Formation',
      statut: 'publie',
    },
    {
      match: 'audit-hse-en-afrique',
      titreFR: 'Auditer un périmètre multi-pays : méthode et pièges',
      extraitFR:
        'Harmoniser les référentiels tout en respectant les cadres nationaux — retour sur une campagne Afrique de l’Ouest.',
      categorie: 'Audit',
      statut: 'publie',
    },
  ];
  for (const u of updates) {
    const art = articles.data.find((a) => a.slug === u.match);
    if (!art) continue;
    await req(`/api/admin/articles/${art.id}`, {
      method: 'PATCH',
      token,
      body: {
        titreFR: u.titreFR,
        extraitFR: u.extraitFR,
        categorie: u.categorie,
        statut: u.statut,
        datePublication: new Date().toISOString(),
      },
    });
  }

  console.log(`OK — ${created.length} sections Accueil + catalogues enrichis`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
