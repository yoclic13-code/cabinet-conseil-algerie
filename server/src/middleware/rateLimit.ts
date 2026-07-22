import rateLimit from 'express-rate-limit';

/** Rate limit strict pour le formulaire de contact (anti-spam) */
export const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Trop de demandes. Réessayez dans quelques minutes.',
    code: 'RATE_LIMITED',
  },
});

/** Rate limit login admin */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Trop de tentatives de connexion.',
    code: 'RATE_LIMITED',
  },
});
