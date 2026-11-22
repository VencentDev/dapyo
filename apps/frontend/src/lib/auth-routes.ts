export const protectedHomePath = '/home';

export function getPostAuthRedirect(callbackUrl?: string | null) {
  if (!callbackUrl) return protectedHomePath;

  try {
    const url = new URL(callbackUrl, 'http://dapyo.local');
    if (url.pathname === '/' && !url.search && !url.hash) return protectedHomePath;
  } catch {
    return protectedHomePath;
  }

  return callbackUrl;
}
