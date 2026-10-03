import { buildUserscript } from '@/lib/userscript'

export const dynamic = 'force-static'

export function GET() {
  return new Response(buildUserscript(), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="collector.user.js"',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
