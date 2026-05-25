interface AppError {
  status?: number;
  message?: string;
}

function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null;
}

export function getErrorStatus(error: unknown): number {
  return isAppError(error) && typeof error.status === 'number' ? error.status : 500;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error) && typeof error.message === 'string') return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur serveur.';
}
