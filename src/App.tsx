import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, Code2, ExternalLink, Gamepad2, Globe, MapPin, Mic, Rocket, Search, ShieldCheck, Sparkles, Ticket, Users, X } from 'lucide-react'
import raw from './data/events.json'
import type { Category, TechEvent } from './types'
import Mascot, { NubiToggle, nubi } from './Mascot'
import { trackEvent } from './analytics'
import LegalHost, { openLegal } from './Legal'

const TZ = 'Europe/Madrid'
const repo = 'https://github.com/Daniel0611CN/Malaga-Tech-Calendar'
const proposalUrl = `${repo}/issues/new?title=Propuesta%20de%20evento&body=Nombre%3A%0AFecha%3A%0ALugar%3A%0AEnlace%20oficial%3A%0APonentes%3A`
const cats: (Category | 'Todos')[] = ['Todos', 'IA', 'Desarrollo', 'Startups', 'Gaming', 'Ciberseguridad', 'Otros']
const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-ES', { timeZone: TZ, ...o }).format(new Date(iso))
const dayKey = (d: Date | string) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date(d))
const hm = (iso: string) => fmt(iso, { hour: '2-digit', minute: '2-digit' })
const hour = (e: TechEvent) => (e.allDay ? 'Todo el día' : hm(e.start))
const span = (e: TechEvent) =>
  e.allDay && e.end && dayKey(e.end) !== dayKey(e.start)
    ? `${fmt(e.start, { day: 'numeric', month: 'long' })} – ${fmt(e.end, { day: 'numeric', month: 'long' })}`
    : `${fmt(e.start, { weekday: 'long', day: 'numeric', month: 'long' })}${e.allDay ? '' : ` · ${hm(e.start)}${e.end ? `–${hm(e.end)}` : ''}`}`
const mapsUrl = (e: TechEvent) =>
  `https://www.google.com/maps/search/?api=1&query=${e.lat != null && e.lon != null ? `${e.lat},${e.lon}` : encodeURIComponent(`${e.venue} ${e.address ?? ''} Málaga`)}`

const logo = `${import.meta.env.BASE_URL}logo.svg`
const icons = { IA: Sparkles, Desarrollo: Code2, Startups: Rocket, Gaming: Gamepad2, Ciberseguridad: ShieldCheck, Otros: CalendarDays }

function Cover({ e, big }: { e: TechEvent; big?: boolean }) {
  const Icon = icons[e.category]
  const h = [...e.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const style = { '--x': `${20 + (h % 60)}%`, '--y': `${20 + ((h >> 3) % 60)}%` } as CSSProperties
  return (
    <span className={`cover cv-${e.category}${big ? ' big' : ''}`} style={style}>
      {e.image ? <img src={e.image} alt="" loading="lazy" /> : <><i className="blob b1" /><i className="blob b2" /><Icon size={big ? 60 : 46} strokeWidth={1.4} /></>}
      {e.projected && <span className="est">Fecha estimada</span>}
    </span>
  )
}

export default function App() {
  const events = useMemo(() => [...(raw as unknown as TechEvent[])].sort((a, b) => a.start.localeCompare(b.start)), [])
  const today = dayKey(new Date())
  const [cat, setCat] = useState<Category | 'Todos'>('Todos')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<TechEvent | null>(null)
  const [ym, setYm] = useState({ y: +today.slice(0, 4), m: +today.slice(5, 7) - 1 })
  const [sel, setSel] = useState(today)
  const [est, setEst] = useState(true)

  const filtered = useMemo(() => events.filter((e) => (cat === 'Todos' || e.category === cat) && (est || !e.projected) && `${e.title} ${e.venue} ${e.organizer ?? ''}`.toLowerCase().includes(q.toLowerCase())), [events, cat, q, est])
  const byDay = useMemo(() => {
    const m = new Map<string, TechEvent[]>()
    filtered.forEach((e) => {
      const last = dayKey(e.end ?? e.start)
      for (let d = new Date(`${dayKey(e.start)}T12:00:00Z`), k = dayKey(d); k <= last; d = new Date(d.getTime() + 864e5), k = dayKey(d)) m.set(k, [...(m.get(k) ?? []), e])
    })
    return m
  }, [filtered])
  const upcoming = filtered.filter((e) => dayKey(e.end ?? e.start) >= today)
  const cells = useMemo(() => {
    const offset = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7
    const n = new Date(ym.y, ym.m + 1, 0).getDate()
    return Array.from({ length: Math.ceil((offset + n) / 7) * 7 }, (_, i) => {
      const d = i - offset + 1
      return d < 1 || d > n ? null : `${ym.y}-${String(ym.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }, [ym])
  const move = (k: number) => setYm(({ y, m }) => { const d = new Date(y, m + k, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const openEvent = (e: TechEvent) => { setOpen(e); trackEvent('event_view', { event_name: e.title, category: e.category }) }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((x) => x.isIntersecting && x.target.classList.add('in')), { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => { const m = document.querySelector('.modal'); if (m) nubi.goto(m, '¡Aquí tienes todos los detalles!') }, 80)
    return () => clearTimeout(id)
  }, [open])

  const dayEvents = byDay.get(sel) ?? []
  const Card = ({ e, i }: { e: TechEvent; i: number }) => (
    <button className="card" style={{ animationDelay: `${i * 70}ms` }} onClick={() => openEvent(e)} onMouseEnter={(ev) => nubi.goto(ev.currentTarget, `${e.title}: pulsa y te cuento más.`)}>
      <Cover e={e} />
      <span className="date"><b>{fmt(e.start, { day: '2-digit' })}</b>{fmt(e.start, { month: 'short' }).replace('.', '')}</span>
      <span className="cbody"><span className="tag">{e.category}</span>
      <h3>{e.title}</h3>
      <span className="meta"><Clock3 size={14} /> {hour(e)}</span>
      <span className="meta"><MapPin size={14} /> {e.venue}</span>
      {(e.attendees != null || e.speakers?.length) && (
        <span className="meta">{e.attendees != null && <><Users size={14} /> {e.attendees}</>} {e.speakers?.length ? <><Mic size={14} /> {e.speakers.length}</> : null}</span>
      )}</span>
    </button>
  )

  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="#top" aria-label="Málaga Tech Calendar, inicio"><img src={logo} alt="" width="40" height="40" /></a>
          <nav aria-label="Principal"><a href="#agenda">Agenda</a><a href="#eventos">Eventos</a><a href="#colabora">Colabora</a></nav>
          <a className="btn primary" href={proposalUrl} target="_blank" rel="noreferrer">Proponer</a>
        </div>
      </header>
      <main id="top" className="wrap">
        <div className="hero">
          <div className="hero-copy">
            <span className="kicker"><i className="pulse" /> Agenda tech de la Costa del Sol</span>
            <h1>Donde las ideas <em>se conectan</em></h1>
            <p>Congresos, ferias y encuentros de la comunidad tecnológica de Málaga, tomados de fuentes oficiales y públicas.</p>
            <a className="btn primary" href="#agenda">Ver agenda <ArrowUpRight size={16} /></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <i className="orbit o1" /><i className="orbit o2" />
            <div className="term"><span className="tdots"><i /><i /><i /></span><code><b>const</b> málaga = <b>await</b> conectar()<u /></code></div>
            <span className="chip-float f1">IA</span><span className="chip-float f2">DEV</span><span className="chip-float f3">STARTUPS</span>
          </div>
        </div>

        <section id="agenda" className="reveal" data-nubi="Este es el calendario. ¡Pulsa un día!">
          <div className="tools">
            <label className="search"><Search size={16} /><input value={q} onChange={(e) => { setQ(e.target.value); trackEvent('search', { query_length: e.target.value.length }) }} placeholder="Evento, lugar u organizador" aria-label="Buscar eventos" /></label>
            <div className="chips">{cats.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}<button className="chip" aria-pressed={est} onClick={() => setEst(!est)}>Fechas estimadas</button></div>
          </div>
          <div className="layout">
            <div className="panel">
              <div className="cal-head">
                <h3>{fmt(new Date(ym.y, ym.m, 15).toISOString(), { month: 'long', year: 'numeric' })}</h3>
                <div><button className="btn" aria-label="Mes anterior" onClick={() => move(-1)}><ChevronLeft size={16} /></button> <button className="btn" aria-label="Mes siguiente" onClick={() => move(1)}><ChevronRight size={16} /></button></div>
              </div>
              <div className="grid7">
                {weekDays.map((d) => <span className="wd" key={d}>{d}</span>)}
                {cells.map((k, i) => k ? (
                  <button key={k} className={`day ${k === sel ? 'sel' : ''} ${k === today ? 'today' : ''}`} onClick={() => setSel(k)} aria-label={`${Number(k.slice(8))}, ${byDay.get(k)?.length ?? 0} eventos`}>
                    {Number(k.slice(8))}<span className="dots">{(byDay.get(k) ?? []).slice(0, 3).map((e) => <i key={e.id} />)}</span>
                  </button>
                ) : <span key={i} />)}
              </div>
            </div>
            <aside className="panel">
              <h3>{fmt(`${sel}T12:00:00Z`, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <div className="list">
                {dayEvents.length ? dayEvents.map((e) => (
                  <button className="row" key={e.id} onClick={() => openEvent(e)}><b>{e.title}</b><small>{hour(e)} · {e.venue}</small></button>
                )) : <p className="meta">No hay eventos este día.</p>}
              </div>
            </aside>
          </div>
        </section>

        <section id="eventos" className="reveal" data-nubi="Estos son los próximos eventos.">
          <h2>Próximos eventos</h2>
          <div className="cards">{upcoming.map((e, i) => <Card key={e.id} e={e} i={i} />)}</div>
          {!upcoming.length && <p className="panel meta">{events.length ? 'Ningún evento coincide con la búsqueda.' : 'Aún no hay eventos sincronizados. Se actualizan a diario desde las fuentes configuradas.'}</p>}
        </section>

        <section id="colabora" className="panel cta reveal" data-nubi="¿Conoces un evento que falte? Propónlo.">
          <div><h2>¿Organizas algo en Málaga?</h2><p className="meta">Añádelo por pull request o abre una propuesta; solo publicamos eventos con página oficial.</p></div>
          <a className="btn primary" href={proposalUrl} target="_blank" rel="noreferrer">Proponer evento <ArrowUpRight size={16} /></a>
        </section>
      </main>
      <footer>
        <div className="wrap foot">
          <div className="fbrand"><img src={logo} alt="" width="44" height="44" /><p>Esta web se ha realizado durante el evento <b>GitHub Dev Days</b> en la <b>Universidad de Málaga (UMA)</b>.</p></div>
          <div className="fcol"><strong>Explora</strong><a href="#agenda">Agenda</a><a href="#eventos">Eventos</a><a href="#colabora">Colabora</a><a href={proposalUrl} target="_blank" rel="noreferrer">Proponer evento</a></div>
          <div className="fcol"><strong>Enlaces</strong><a href={repo} target="_blank" rel="noreferrer">Repositorio</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.uma.es/" target="_blank" rel="noreferrer">Universidad de Málaga</a><a href={`${repo}/issues/new`} target="_blank" rel="noreferrer">Reportar un error</a></div>
          <div className="fcol"><strong>Legal</strong><button className="link" onClick={() => openLegal('aviso')}>Aviso legal</button><button className="link" onClick={() => openLegal('privacidad')}>Política de privacidad</button><button className="link" onClick={() => openLegal('cookies')}>Política de cookies</button><button className="link" onClick={() => openLegal('config')}>Configurar cookies</button><NubiToggle /></div>
        </div>
        <div className="wrap fbottom"><span>© 2026 Málaga Tech Calendar · Proyecto educativo sin ánimo de lucro</span><span>Fuentes: <a href="https://www.fycma.com" target="_blank" rel="noreferrer">FYCMA</a> y Meetup. Confirma siempre fechas y horarios en la web oficial.</span></div>
      </footer>

      <Mascot />
      <LegalHost />

      {open && (
        <div className="backdrop" onClick={() => setOpen(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ev-title" onClick={(e) => e.stopPropagation()}>
            <button className="btn close" onClick={() => setOpen(null)} aria-label="Cerrar"><X size={16} /></button>
            <Cover e={open} big /><span className="tag">{open.category}</span>
            <h2 id="ev-title">{open.title}</h2>
            <p className="meta">{span(open)}</p>
            {open.description && <p>{open.description}</p>}
            {open.note && <p className="note">{open.note}</p>}
            <dl>
              <dt><MapPin size={14} /> Lugar</dt><dd>{open.venue}{open.address ? `, ${open.address}` : ''}</dd>
              {open.organizer && <><dt><Users size={14} /> Organiza</dt><dd>{open.organizer}</dd></>}
              {!!open.speakers?.length && <><dt><Mic size={14} /> Ponentes</dt><dd>{open.speakers.map((s) => s.role ? `${s.name} (${s.role})` : s.name).join(', ')}</dd></>}
              {open.attendees != null && <><dt><Users size={14} /> Asistentes</dt><dd>{open.attendees}{open.capacity ? ` de ${open.capacity} plazas` : ' confirmados'}</dd></>}
              {open.price && <><dt><Ticket size={14} /> Precio</dt><dd>{open.price}</dd></>}
              {open.language && <><dt><Globe size={14} /> Idioma</dt><dd>{open.language}</dd></>}
              <dt>Fuente</dt><dd>{open.source}</dd>
            </dl>
            <div className="actions">
              {open.url && <a className="btn primary" href={open.url} target="_blank" rel="noreferrer">Página oficial <ExternalLink size={14} /></a>}
              <a className="btn" href={mapsUrl(open)} target="_blank" rel="noreferrer"><MapPin size={14} /> Google Maps</a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
