/**
 * Palette & typographie sur-mesure — Cabinet conseil QSE/HSE/Environnement.
 *
 * Choix couleur :
 * - Bleu nuit profond (#0B1F33) : rigueur industrielle / sécurité, crédibilité institutionnelle.
 * - Accent ocre / terre cuite (#C4783A) : ancrage Algérie / Afrique, chaleur humaine sans
 *   tomber dans le cliché « tech startup » violet/indigo.
 * - Vert émeraude sobre (#1F6B5C) : signal HSE/environnement, utilisé en second accent.
 * - Fonds ivoire cassé + gris ardoise : densité corporate, pas de blanc clinique SaaS.
 *
 * Typographie :
 * - Fraunces (serif éditoriale) pour les titres — contraste assumé, ton « cabinet ».
 * - IBM Plex Sans pour le corps — lisibilité neutre, professionnelle.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#06121E',
          900: '#0B1F33',
          800: '#122A42',
          700: '#1A3A58',
          600: '#2A4F70',
        },
        ocre: {
          600: '#A8622E',
          500: '#C4783A',
          400: '#D4925A',
          100: '#F5E6D8',
        },
        emerald: {
          800: '#164F44',
          700: '#1F6B5C',
          600: '#2A8572',
          100: '#D8EDE8',
        },
        ivory: {
          50: '#F7F4EF',
          100: '#EFEAE2',
          200: '#E2DBD0',
        },
        slate: {
          ink: '#1C2430',
          soft: '#5A6573',
          mute: '#8A93A0',
          line: '#D5D0C8',
        },
        /* Admin — palette productivité distincte du site public */
        admin: {
          bg: '#F4F5F7',
          panel: '#FFFFFF',
          border: '#E2E5EA',
          ink: '#1A1D23',
          mute: '#6B7280',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
          danger: '#DC2626',
          success: '#059669',
          warn: '#D97706',
          sidebar: '#111827',
          sidebarMuted: '#9CA3AF',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        editorial: '72rem',
        measure: '38rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
