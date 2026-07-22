import type { EvenementStatut } from '@prisma/client';

/** Recalcule le statut sauf si déjà annulé manuellement */
export function computeEvenementStatut(
  dateDebut: Date,
  dateFin: Date | null | undefined,
  current?: EvenementStatut,
): EvenementStatut {
  if (current === 'annule') return 'annule';
  const end = dateFin ?? dateDebut;
  return end.getTime() < Date.now() ? 'passe' : 'a_venir';
}
