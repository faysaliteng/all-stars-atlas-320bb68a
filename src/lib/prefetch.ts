/**
 * Route prefetching on link hover/focus for instant navigation.
 * Uses requestIdleCallback to avoid blocking the main thread.
 */

const prefetched = new Set<string>();

const routeModules: Record<string, () => Promise<unknown>> = {
  '/flights': () => import('@/pages/flights/FlightResults'),
  '/hotels': () => import('@/pages/hotels/HotelResults'),
  '/visa': () => import('@/pages/visa/VisaServices'),
  '/holidays': () => import('@/pages/holidays/HolidayPackages'),
  '/cars': () => import('@/pages/cars/CarRental'),
  '/medical': () => import('@/pages/medical/MedicalServices'),
  '/esim': () => import('@/pages/esim/ESIMPlans'),
  '/about': () => import('@/pages/static/About'),
  '/contact': () => import('@/pages/static/Contact'),
  '/blog': () => import('@/pages/static/Blog'),
  '/auth/login': () => import('@/pages/auth/Login'),
  '/auth/register': () => import('@/pages/auth/Register'),
};

export function prefetchRoute(path: string) {
  if (prefetched.has(path)) return;
  const loader = routeModules[path];
  if (!loader) return;
  prefetched.add(path);

  const idle = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));
  idle(() => { loader().catch(() => prefetched.delete(path)); });
}

/**
 * Attach to a link element to prefetch on hover/focus.
 */
export function getPrefetchHandlers(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}
