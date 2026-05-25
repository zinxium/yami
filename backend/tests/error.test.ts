import { getErrorStatus, getErrorMessage } from '../src/utils/error';

describe('getErrorStatus', () => {
  it('retourne le status quand c\'est un objet avec status', () => {
    expect(getErrorStatus({ status: 404, message: 'Not found' })).toBe(404);
  });

  it('retourne 500 quand pas de status', () => {
    expect(getErrorStatus({ message: 'Error' })).toBe(500);
  });

  it('retourne 500 pour une Error standard', () => {
    expect(getErrorStatus(new Error('test'))).toBe(500);
  });

  it('retourne 500 pour null', () => {
    expect(getErrorStatus(null)).toBe(500);
  });

  it('retourne 500 pour undefined', () => {
    expect(getErrorStatus(undefined)).toBe(500);
  });

  it('retourne 500 pour une string', () => {
    expect(getErrorStatus('error string')).toBe(500);
  });

  it('retourne le bon status pour les codes courants', () => {
    expect(getErrorStatus({ status: 400 })).toBe(400);
    expect(getErrorStatus({ status: 401 })).toBe(401);
    expect(getErrorStatus({ status: 403 })).toBe(403);
    expect(getErrorStatus({ status: 404 })).toBe(404);
    expect(getErrorStatus({ status: 409 })).toBe(409);
  });
});

describe('getErrorMessage', () => {
  it('retourne le message d\'un objet avec message', () => {
    expect(getErrorMessage({ status: 404, message: 'Prêt introuvable.' })).toBe('Prêt introuvable.');
  });

  it('retourne le message d\'une Error standard', () => {
    expect(getErrorMessage(new Error('Something failed'))).toBe('Something failed');
  });

  it('retourne le fallback pour un objet sans message', () => {
    expect(getErrorMessage({ status: 500 })).toBe('Erreur serveur.');
  });

  it('retourne le fallback pour null', () => {
    expect(getErrorMessage(null)).toBe('Erreur serveur.');
  });

  it('retourne le fallback pour undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Erreur serveur.');
  });

  it('retourne le fallback pour une string', () => {
    expect(getErrorMessage('some error')).toBe('Erreur serveur.');
  });

  it('retourne le message pour les erreurs typiques de l\'app', () => {
    expect(getErrorMessage({ status: 404, message: 'Emprunteur introuvable.' })).toBe('Emprunteur introuvable.');
    expect(getErrorMessage({ status: 403, message: 'Accès refusé.' })).toBe('Accès refusé.');
  });
});
