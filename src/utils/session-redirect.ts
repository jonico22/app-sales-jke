const REDIRECT_URL_KEY = 'redirectUrl';

const isSafeRedirectPath = (value: string | null) => {
  if (!value) return false;
  if (!value.startsWith('/')) return false;
  return !value.startsWith('//');
};

export const sessionRedirect = {
  saveCurrentPath() {
    const nextPath = `${window.location.pathname}${window.location.search}`;
    window.sessionStorage.setItem(REDIRECT_URL_KEY, nextPath);
  },
  consume() {
    const storedValue = window.sessionStorage.getItem(REDIRECT_URL_KEY);

    if (!isSafeRedirectPath(storedValue)) {
      window.sessionStorage.removeItem(REDIRECT_URL_KEY);
      return null;
    }

    window.sessionStorage.removeItem(REDIRECT_URL_KEY);
    return storedValue;
  },
};
