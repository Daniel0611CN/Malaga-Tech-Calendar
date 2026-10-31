/* global console, fetch */
// Genera src/data/events.json desde feeds iCal (Meetup) + events/curated.json. Sin claves ni backend.
import { readFileSync, writeFileSync } from 'node:fs'

const sources = JSON.parse(readFileSync('scripts/sources.json', 'utf8'))
const curated = ['curated', 'projected'].flatMap((f) => JSON.parse(readFileSync(`events/${f}.json`, 'utf8')))
const unesc = (s = '') => s.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1').trim()

function madridToIso(y, mo, d, h, mi) {
  const asUtc = Date.UTC(y, mo - 1, d, h, mi)
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date(asUtc))
  const g = (t) => +p.find((x) => x.type === t).value
  const shown = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'))
  return new Date(asUtc - (shown - asUtc)).toISOString()
}
function parseDate(value) {
  const m = value?.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?(Z)?/)
  if (!m) return undefined
  const [, y, mo, d, h = '0', mi = '0', z] = m
  return z ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi)).toISOString() : madridToIso(+y, +mo, +d, +h, +mi)
}
const categorize = (t) =>
  /\b(ia|ai|machine learning|llm|data|pydata|gpt)\b/i.test(t) ? 'IA'
  : /ciber|security|seguridad|hacking|ctf/i.test(t) ? 'Ciberseguridad'
  : /startup|emprend|founder|inversi/i.test(t) ? 'Startups'
  : /game|gaming|videojuego|unity|unreal/i.test(t) ? 'Gaming'
  : /dev|code|python|java|react|angular|web|cloud|software/i.test(t) ? 'Desarrollo'
  : 'Otros'

export function parseIcs(text, source) {
  return text.replace(/\r?\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1).map((block) => {
    const f = {}
    for (const line of block.split(/\r?\n/)) {
      const i = line.indexOf(':')
      if (i > 0) f[line.slice(0, i).split(';')[0]] = line.slice(i + 1)
    }
    const start = parseDate(f.DTSTART)
    if (!start || !f.SUMMARY) return null
    const [lat, lon] = f.GEO ? f.GEO.split(';').map(Number) : []
    const title = unesc(f.SUMMARY)
    const description = unesc(f.DESCRIPTION).slice(0, 600)
    return {
      id: `${source.type}-${unesc(f.UID) || start}`.replace(/[^\w-]+/g, '-').slice(0, 80),
      title, category: categorize(`${title} ${description}`), start, end: parseDate(f.DTEND),
      venue: unesc(f.LOCATION) || 'Por confirmar', lat: Number.isFinite(lat) ? lat : undefined, lon: Number.isFinite(lon) ? lon : undefined,
      description, url: unesc(f.URL), organizer: source.name, source: source.name,
    }
  }).filter(Boolean)
}

const all = [...curated]
for (const s of sources) {
  try {
    const res = await fetch(`https://www.meetup.com/${s.slug}/events/ical/`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    all.push(...parseIcs(await res.text(), s))
  } catch (e) {
    console.warn(`⚠ ${s.name}: ${e.message}`)
  }
}
const since = Date.now() - 60 * 864e5
const out = all.filter((e) => Date.parse(e.start) >= since).sort((a, b) => a.start.localeCompare(b.start))
writeFileSync('src/data/events.json', JSON.stringify(out, null, 2))
console.log(`✔ ${out.length} eventos`)
