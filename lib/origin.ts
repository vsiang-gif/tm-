export function getAppOrigin() {
  const url =
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL) ??
    'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

export function getRequestOrigin(headers: Headers, fallback: string) {
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (!host) return fallback
  const proto = headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto.split(',')[0]}://${host.split(',')[0]}`
}

const TEMU_IMAGE_HOST = /(^|\.)(kwcdn\.com|temu\.com)$/i
const TEMU_PAGE_HOST = /(^|\.)temu\.com$/i

export function isTemuImageUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'https:' && TEMU_IMAGE_HOST.test(u.hostname)
  } catch {
    return false
  }
}

export function isTemuPageUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'https:' && TEMU_PAGE_HOST.test(u.hostname)
  } catch {
    return false
  }
}
