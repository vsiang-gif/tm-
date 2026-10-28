import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE = 'tm_admin'
const MAX_AGE = 60 * 60 * 12

function secret() {
  const s = process.env.ADMIN_PASSWORD
  if (!s) throw new Error('ADMIN_PASSWORD 未设置')
  return s
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export function passwordMatches(input: string) {
  return safeEqual(sign('pw:' + input), sign('pw:' + secret()))
}

export async function startAdminSession() {
  const exp = String(Date.now() + MAX_AGE * 1000)
  const store = await cookies()
  store.set(COOKIE, exp + '.' + sign('session:' + exp), {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'strict',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function endAdminSession() {
  ;(await cookies()).delete(COOKIE)
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return false
  const [exp, sig] = raw.split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  return safeEqual(sig, sign('session:' + exp))
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('未登录')
}
