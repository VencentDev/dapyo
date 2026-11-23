export const protectedHomePath = '/home';

const internalOrigin = 'http://dapyo.local';

export function getSafeInternalRedirect(
  value?: string | null,
  fallback: string = protectedHomePath,
) {
  const candidate = value?.trim();
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  try {
    const url = new URL(candidate, internalOrigin);
    if (url.origin !== internalOrigin) return fallback;
    const localPath = `${url.pathname}${url.search}${url.hash}`;
    if (localPath.startsWith('//')) return fallback;
    return localPath === '/' ? fallback : localPath;
  } catch {
    return fallback;
  }
}

export function getOnboardingPath(callbackUrl?: string | null) {
  const safeCallback = getSafeInternalRedirect(callbackUrl, protectedHomePath);
  return `/onboarding?callbackUrl=${encodeURIComponent(safeCallback)}`;
}

export function getPostAuthRedirect(callbackUrl?: string | null) {
  return getSafeInternalRedirect(callbackUrl, protectedHomePath);
}
