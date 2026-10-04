import { buildLanServer } from '@/lib/lan-server'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildLanServer(), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="lan-dedupe-server.js"',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
