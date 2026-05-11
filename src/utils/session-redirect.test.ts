import { describe, it, expect, beforeEach } from 'vitest';
import { sessionRedirect } from './session-redirect';

describe('sessionRedirect', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('stores the current path in session storage', () => {
    window.history.replaceState(null, '', '/ventas?tab=pendientes');

    sessionRedirect.saveCurrentPath();

    expect(window.sessionStorage.getItem('redirectUrl')).toBe('/ventas?tab=pendientes');
  });

  it('returns and clears a safe stored path', () => {
    window.sessionStorage.setItem('redirectUrl', '/inventario?page=2');

    expect(sessionRedirect.consume()).toBe('/inventario?page=2');
    expect(window.sessionStorage.getItem('redirectUrl')).toBeNull();
  });

  it('rejects unsafe redirects and clears them', () => {
    window.sessionStorage.setItem('redirectUrl', 'https://evil.test/phishing');

    expect(sessionRedirect.consume()).toBeNull();
    expect(window.sessionStorage.getItem('redirectUrl')).toBeNull();
  });
});
