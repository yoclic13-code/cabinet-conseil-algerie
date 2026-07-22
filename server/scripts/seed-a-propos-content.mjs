/**
 * Seed contenu éditorial page À propos.
 * Usage: node server/scripts/seed-a-propos-content.mjs
 *
 * TODO(pre-launch): Remplacer les noms/postes fictifs de la section « équipe »
 * (Amira Benali, Karim Hadj, Nadia Cherif, Youssef Meziane) par les vrais
 * collaborateurs avant mise en ligne définitive.
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

  let pages = await req('/api/admin/pages', { token });
  let page = pages.data.find((p) => p.slug === 'a-propos');

  if (!page) {
    const created = await req('/api/admin/pages', {
      method: 'POST',
      token,
      body: { slug: 'a-propos', titreHint: 'À propos', ordre: 1 },
    });
    page = created.data;
  }

  await req('/api/admin/seo', {
    method: 'PUT',
    token,
    body: {
      pageId: page.id,
      titleFR: 'À propos | Cabinet Conseil Algérie — QSE, HSE & Environnement',
      titleEN: 'About us | Algeria Consulting Firm — QSE, HSE & Environment',
      descriptionFR:
        'Histoire, valeurs, équipe et certifications d’un cabinet de conseil QSE, HSE et Environnement basé en Algérie, actif en Afrique et à l’international.',
      descriptionEN:
        'History, values, team and certifications of a QSE, HSE and Environment consulting firm based in Algeria, active across Africa and internationally.',
    },
  });

  const existing = await req(`/api/admin/sections?pageId=${page.id}&includeHidden=true`, { token });
  for (const s of existing.data) {
    await req(`/api/admin/sections/${s.id}`, { method: 'DELETE', token });
  }

  const sections = [
    {
      type: 'page-hero',
      contenuFR: {
        eyebrow: 'Le cabinet',
        title: 'Un partenaire de confiance pour la maîtrise des risques industriels',
        subtitle:
          'Plus de quinze ans d’expérience cumulée au service de directions générales, HSE et opérations sur des projets à forte intensité réglementaire — en Algérie, en Afrique et à l’international.',
        imageUrl: '/images/placeholder-about.jpg',
      },
      contenuEN: {
        eyebrow: 'The firm',
        title: 'A trusted partner for industrial risk management',
        subtitle: 'Fifteen years of cumulative experience supporting executives and operations.',
        imageUrl: '/images/placeholder-about.jpg',
      },
    },
    {
      type: 'texte',
      contenuFR: {
        eyebrow: 'Notre histoire',
        title: 'De l’audit de conformité à l’accompagnement stratégique',
        body: 'Le cabinet est né d’un constat partagé sur le terrain : les organisations industrielles ne manquent pas de procédures, mais de capacité à les traduire en pratiques robustes, mesurables et auditables.\n\nNous avons structuré notre offre autour de missions concrètes — diagnostic, études, formation, inspection et conseil environnemental — en conservant une exigence constante : des livrables exploitables, pas de la documentation décorative.',
      },
      contenuEN: {
        eyebrow: 'Our story',
        title: 'From compliance audit to strategic advisory',
        body: 'We built our practice around actionable missions — diagnosis, studies, training, inspection and environmental advisory.',
      },
    },
    {
      type: 'image-texte',
      contenuFR: {
        eyebrow: 'Notre approche',
        title: 'La rigueur documentaire au service du terrain',
        body: 'Nous intervenons au plus près des installations et des équipes, en articulant exigences réglementaires, contraintes opérationnelles et attentes des parties prenantes. Chaque mission est cadrée, priorisée et suivie avec des indicateurs clairs.',
        imageUrl: '/images/placeholder-expertise.jpg',
        imagePosition: 'right',
      },
      contenuEN: {
        eyebrow: 'Our approach',
        title: 'Documentary rigour at the service of the field',
        body: 'We work close to facilities and teams, aligning regulatory requirements with operational reality.',
        imageUrl: '/images/placeholder-expertise.jpg',
        imagePosition: 'right',
      },
    },
    {
      type: 'grille-cartes',
      contenuFR: {
        eyebrow: 'Nos valeurs',
        title: 'Ce qui guide nos interventions',
        intro: 'Des principes simples, appliqués sans compromis sur chaque mission.',
        items: [
          {
            title: 'Rigueur',
            body: 'Des analyses structurées, des preuves vérifiables et une traçabilité compatible avec les audits les plus exigeants.',
          },
          {
            title: 'Proximité terrain',
            body: 'Une compréhension fine des réalités de site, pas une lecture de bureau déconnectée des opérations.',
          },
          {
            title: 'Clarté',
            body: 'Des constats lisibles, des responsabilités identifiées et des plans d’action priorisés.',
          },
          {
            title: 'Intégrité',
            body: 'Une posture indépendante, transparente avec nos clients et exigeante sur nos propres pratiques.',
          },
          {
            title: 'Engagement durable',
            body: 'Un accompagnement dans la durée, au-delà de la mission ponctuelle.',
          },
        ],
      },
      contenuEN: {
        eyebrow: 'Our values',
        title: 'What guides our work',
        items: [
          { title: 'Rigor', body: 'Structured analysis and verifiable evidence.' },
          { title: 'Field proximity', body: 'Site reality, not desk-only reading.' },
          { title: 'Clarity', body: 'Readable findings and prioritized actions.' },
        ],
      },
    },
    {
      type: 'equipe',
      // TODO(pre-launch): noms/postes fictifs — à remplacer avant go-live (voir en-tête du script)
      contenuFR: {
        eyebrow: 'L’équipe',
        title: 'Des consultants expérimentés, proches des opérationnels',
        intro:
          'Une équipe pluridisciplinaire QSE / HSE / Environnement, habituée aux contextes industriels algériens et aux exigences des projets multi-sites.',
        members: [
          {
            name: 'Amira Benali',
            role: 'Directrice QSE — pilotage stratégique et relations institutionnelles',
          },
          {
            name: 'Karim Hadj',
            role: 'Consultant HSE senior — audits, études de risques et culture sécurité',
          },
          {
            name: 'Nadia Cherif',
            role: 'Experte environnement — ISO 14001, aspects significatifs et reporting',
          },
          {
            name: 'Youssef Meziane',
            role: 'Chef de mission — inspection, conformité et déploiement opérationnel',
          },
        ],
      },
      contenuEN: {
        eyebrow: 'The team',
        title: 'Experienced consultants close to operations',
        members: [
          { name: 'Amira Benali', role: 'QSE Director' },
          { name: 'Karim Hadj', role: 'Senior HSE Consultant' },
        ],
      },
    },
    {
      type: 'certifications',
      contenuFR: {
        eyebrow: 'Références',
        title: 'Certifications & affiliations',
        intro:
          'Nos consultants mobilisent des référentiels reconnus et une veille réglementaire continue. Les certifications ci-dessous reflètent les compétences de l’équipe, pas une accréditation unique du cabinet.',
        items: [
          {
            title: 'ISO 45001 — Systèmes de management SST',
            year: 'Compétence équipe',
            body: 'Audit, écart et accompagnement à la certification des systèmes de management de la santé et sécurité au travail.',
          },
          {
            title: 'ISO 14001 — Management environnemental',
            year: 'Compétence équipe',
            body: 'Structuration des aspects environnementaux, plans d’actions et préparation aux audits de certification.',
          },
          {
            title: 'ISO 9001 — Management de la qualité',
            year: 'Compétence équipe',
            body: 'Alignement des processus QSE et renforcement de la traçabilité documentaire.',
          },
          {
            title: 'Formations HSE avancées',
            year: 'Formation continue',
            body: 'Analyse de risques, permis de feu, travaux en hauteur, gestion des situations d’urgence et sensibilisation managériale.',
          },
          {
            title: 'Veille réglementaire Algérie & Afrique',
            year: 'Pratique courante',
            body: 'Suivi des évolutions textes, arrêtés sectoriels et exigences clients sur les marchés locaux et régionaux.',
          },
        ],
      },
      contenuEN: {
        eyebrow: 'Credentials',
        title: 'Certifications & affiliations',
        items: [
          { title: 'ISO 45001', body: 'Occupational health & safety management systems.' },
          { title: 'ISO 14001', body: 'Environmental management systems.' },
        ],
      },
    },
    {
      type: 'cta',
      contenuFR: {
        title: 'Échanger sur votre contexte',
        body: 'Direction HSE, projet industriel ou démarche de certification : décrivez-nous votre situation, nous vous proposerons une lecture claire des prochaines étapes.',
        buttonLabel: 'Nous contacter',
        buttonHref: '/contact',
      },
      contenuEN: {
        title: 'Discuss your context',
        body: 'Tell us about your HSE or environmental challenge.',
        buttonLabel: 'Contact us',
        buttonHref: '/contact',
      },
    },
  ];

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    await req('/api/admin/sections', {
      method: 'POST',
      token,
      body: {
        pageId: page.id,
        type: s.type,
        ordre: i,
        visible: true,
        contenuFR: s.contenuFR,
        contenuEN: s.contenuEN,
      },
    });
  }

  console.log(`[seed-a-propos] ${sections.length} sections créées pour /a-propos`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
