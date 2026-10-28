// Bundles the same userscript the website serves into the desktop app, so both always ship identical logic.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildUserscript, SITES, PLATFORM_NAMES } from '../../lib/userscript.ts'

const here = dirname(fileURLToPath(import.meta.url))
const code = buildUserscript()

const header = code.slice(0, code.indexOf('// ==/UserScript=='))
const meta = (key) => [...header.matchAll(new RegExp('^// @' + key + '\\s+(.+)$', 'gm'))].map((m) => m[1].trim())

function globToRegex(glob) {
  const m = glob.match(/^(\*|https?):\/\/([^/]+)(\/.*)$/)
  if (!m) throw new Error('Unsupported @match: ' + glob)
  const scheme = m[1] === '*' ? 'https?' : m[1]
  const host = m[2].startsWith('*.')
    ? '([^/]+\\.)?' + m[2].slice(2).replace(/\./g, '\\.')
    : m[2].replace(/\./g, '\\.')
  const path = m[3].replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return '^' + scheme + ':\\/\\/' + host + path + '$'
}

const matches = [
  ...meta('match').map(globToRegex),
  ...meta('include').map((r) => r.replace(/^\/|\/$/g, '')),
]

const platforms = Object.entries(PLATFORM_NAMES).map(([id, name]) => ({
  id,
  name,
  sites: SITES.filter((s) => s.p === id).map((s) => ({
    name: s.name,
    url: s.origin + (s.prefix ? '/' + s.prefix : ''),
  })),
}))

const out = join(here, '..', 'src', 'generated', 'collector.json')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(
  out,
  JSON.stringify({
    name: meta('name')[0],
    version: meta('version')[0],
    licenseServer: process.env.LICENSE_SERVER || 'https://tm-puce-ten.vercel.app',
    matches,
    platforms,
    code,
  }),
)
console.log('collector.json written: v' + meta('version')[0] + ', ' + matches.length + ' match rules')
