/**
 * Wraps a dynamic import with retry logic for production deploys.
 * 
 * When a new version is deployed, old JS chunk files are replaced.
 * Users with an active session still have the old HTML cached,
 * which references chunk filenames that no longer exist on the server.
 * This causes "Failed to fetch dynamically imported module" errors.
 * 
 * This utility catches that error and forces a single page reload
 * to fetch the new HTML with updated chunk references.
 */
export function lazyRetry(
  importFn: () => Promise<any>
): Promise<any> {
  const sessionKey = 'lazy_reload_done';

  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error: Error) => {
        // Only attempt reload once to avoid infinite loops
        const hasReloaded = sessionStorage.getItem(sessionKey);

        if (!hasReloaded) {
          sessionStorage.setItem(sessionKey, 'true');
          const url = new URL(window.location.href);
          url.searchParams.set('v', Date.now().toString());
          window.location.href = url.toString();
        } else {
          // Already reloaded once — clear flag and reject so ErrorBoundary can handle it
          sessionStorage.removeItem(sessionKey);
          reject(error);
        }
      });
  });
}
