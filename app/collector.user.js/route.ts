import { buildUserscript } from '@/lib/userscript'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildUserscript(), {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
