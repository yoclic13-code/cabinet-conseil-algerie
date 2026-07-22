export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function assertFound<T>(value: T | null | undefined, message = 'Ressource introuvable'): T {
  if (value == null) {
    throw new AppError(404, message, 'NOT_FOUND');
  }
  return value;
}
