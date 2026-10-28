'use server'

import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { endAdminSession, passwordMatches, requireAdmin, startAdminSession } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { licenseDevices, licenses } from '@/lib/db/schema'

export type FormState = { error?: string; created?: string } | null

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (!process.env.ADMIN_PASSWORD) return { error: '服务器未配置 ADMIN_PASSWORD' }
  const pw = String(form.get('password') ?? '')
  if (!pw || !passwordMatches(pw)) return { error: '管理密码错误' }
  await startAdminSession()
  revalidatePath('/admin')
  return null
}

export async function logout() {
  await endAdminSession()
  revalidatePath('/admin')
}

function newKey() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(16)
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return chars.match(/.{4}/g)!.join('-')
}

export async function createLicense(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin()
  const holder = String(form.get('holder') ?? '').trim().slice(0, 60)
  const note = String(form.get('note') ?? '').trim().slice(0, 200)
  const maxDevices = Math.trunc(Number(form.get('maxDevices') ?? 1))
  const days = Math.trunc(Number(form.get('days') ?? 0))
  const custom = String(form.get('key') ?? '').trim()

  if (!holder) return { error: '请填写使用人' }
  if (!Number.isFinite(maxDevices) || maxDevices < 1 || maxDevices > 20) return { error: '设备数需在 1–20 之间' }
  if (!Number.isFinite(days) || days < 0 || days > 3650) return { error: '有效天数需在 0–3650 之间' }
  if (custom && !/^[A-Za-z0-9-]{6,64}$/.test(custom)) return { error: '自定义密钥只能包含字母、数字和横线，6–64 位' }

  const key = custom || newKey()
  const expiresAt = days > 0 ? new Date(Date.now() + days * 86400_000) : null
  try {
    await db.insert(licenses).values({ key, holder, note, maxDevices, expiresAt })
  } catch {
    return { error: '该密钥已存在' }
  }
  revalidatePath('/admin')
  return { created: key }
}

async function idFrom(form: FormData) {
  await requireAdmin()
  const id = Number(form.get('id'))
  if (!Number.isInteger(id) || id <= 0) throw new Error('参数错误')
  return id
}

export async function toggleLicense(form: FormData) {
  const id = await idFrom(form)
  const next = form.get('next') === 'active' ? 'active' : 'revoked'
  await db.update(licenses).set({ status: next }).where(eq(licenses.id, id))
  revalidatePath('/admin')
}

export async function resetDevices(form: FormData) {
  const id = await idFrom(form)
  await db.delete(licenseDevices).where(eq(licenseDevices.licenseId, id))
  revalidatePath('/admin')
}

export async function deleteLicense(form: FormData) {
  const id = await idFrom(form)
  await db.delete(licenseDevices).where(eq(licenseDevices.licenseId, id))
  await db.delete(licenses).where(eq(licenses.id, id))
  revalidatePath('/admin')
}
