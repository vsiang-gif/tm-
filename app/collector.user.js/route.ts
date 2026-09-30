import { NextResponse, type NextRequest } from 'next/server'
import { findUserIdByToken } from '@/lib/collector-token'
import { getRequestOrigin } from '@/lib/origin'
import { buildUserscript } from '@/lib/userscript'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const userId = await findUserIdByToken(token)
  if (!userId || !token) {
    return new NextResponse('// 采集密钥无效，请回到采集台重新生成', {
      status: 401,
      headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
    })
  }

  const origin = getRequestOrigin(request.headers, request.nextUrl.origin)
  return new NextResponse(buildUserscript({ origin, token }), {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
