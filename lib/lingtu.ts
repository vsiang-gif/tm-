import { createHash, randomUUID } from 'node:crypto'

const ERROR_MESSAGES: Record<string, string> = {
  '401': '灵图签名校验失败，请检查 appId / secret',
  '800000': '灵图剩余生成次数不足',
  '800002': '图片为空或灵图无法访问该图片',
}

export class LingtuError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
  }
}

function getConfig() {
  const base = process.env.LINGTU_API_BASE
  const appId = process.env.LINGTU_APP_ID
  const secret = process.env.LINGTU_SECRET
  if (!base || !appId || !secret) {
    throw new LingtuError('尚未配置灵图 API（LINGTU_API_BASE / LINGTU_APP_ID / LINGTU_SECRET）')
  }
  return { base: base.replace(/\/+$/, ''), appId, secret }
}

export function isLingtuConfigured() {
  return Boolean(
    process.env.LINGTU_API_BASE && process.env.LINGTU_APP_ID && process.env.LINGTU_SECRET,
  )
}

/** sign = sha256(appId + uri + salt + timestamp + secret)，与灵图文档示例一致 */
export function signRequest(appId: string, uri: string, salt: string, timestamp: string, secret: string) {
  return createHash('sha256')
    .update(appId + uri + salt + timestamp + secret)
    .digest('hex')
}

async function call(uri: string, body: Record<string, unknown>): Promise<unknown> {
  const { base, appId, secret } = getConfig()
  const salt = randomUUID()
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const res = await fetch(base + uri, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      appId,
      salt,
      timestamp,
      sign: signRequest(appId, uri, salt, timestamp, secret),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const text = await res.text()
  let json: unknown = text
  try {
    json = JSON.parse(text)
  } catch {
    // Some endpoints return a bare job id string.
  }

  const errorCode =
    json && typeof json === 'object' && 'code' in json ? String((json as { code: unknown }).code) : undefined

  if (!res.ok || (errorCode && errorCode !== '0' && errorCode !== '200')) {
    const code = errorCode ?? String(res.status)
    const message =
      ERROR_MESSAGES[code] ??
      (json && typeof json === 'object' && 'message' in json
        ? String((json as { message: unknown }).message)
        : `灵图接口请求失败（HTTP ${res.status}）`)
    throw new LingtuError(message, code)
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: unknown }).data
  }
  return json
}

export async function submitDetect(params: { requestId: string; image: string }) {
  const result = await call('/aigc/detect', params)
  const jobId =
    typeof result === 'string'
      ? result
      : result && typeof result === 'object' && 'jobId' in result
        ? String((result as { jobId: unknown }).jobId)
        : null
  if (!jobId) throw new LingtuError('灵图未返回任务 ID')
  return jobId
}

export type LingtuJobResult = {
  status: 'waiting' | 'executing' | 'succeed' | 'failed' | 'canceled'
  message?: string
  urls?: string[]
  formats?: string[]
}

export async function getJobResult(jobId: string) {
  return (await call('/aigc/job/result', { jobId })) as LingtuJobResult
}
