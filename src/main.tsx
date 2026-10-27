import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Code2,
  Command,
  ExternalLink,
  Filter,
  MapPin,
  Moon,
  Search,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react'
import './styles.css'

type EventCategory = 'IA' | 'Startups' | 'Desarrollo' | 'Gaming' | 'Ciberseguridad'
type TechEvent = {
  id: number
  title: string
  category: EventCategory
  date: string
  day: string
  month: string
  time: string
  location: string
  venue: string
  description: string
  color: string
  featured?: boolean
}

const events: TechEvent[] = [
  { id: 1, title: 'Málaga AI Week', category: 'IA', date: '2026-11-20', day: '20', month: 'NOV', time: '09:30 — 18:30', location: 'Málaga TechPark', venue: 'Edificio The Green Ray', description: 'Una jornada para descubrir cómo la inteligencia artificial está transformando nuestro día a día.', color: 'violet', featured: true },
  { id: 2, title: 'Frontend Málaga #42', category: 'Desarrollo', date: '2026-11-12', day: '12', month: 'NOV', time: '18:30 — 20:30', location: 'La Farola', venue: 'Calle Comandante Benítez, 8', description: 'Comunidad, código y buenas conversaciones sobre el futuro de la web.', color: 'cyan' },
  { id: 3, title: 'Startup Grind Málaga', category: 'Startups', date: '2026-11-25', day: '25', month: 'NOV', time: '19:00 — 21:00', location: 'The Pool', venue: 'Paseo de la Farola, 8', description: 'Conoce a las personas que están construyendo las próximas grandes ideas desde Málaga.', color: 'orange' },
  { id: 4, title: 'GameLab Costa del Sol', category: 'Gaming', date: '2026-12-04', day: '04', month: 'DIC', time: '16:00 — 22:00', location: 'FYCMA', venue: 'Av. de José Ortega y Gasset, 201', description: 'Creadores, estudios y jugadores se encuentran para celebrar el talento local.', color: 'pink' },
  { id: 5, title: 'CyberSec Sunset', category: 'Ciberseguridad', date: '2026-12-10', day: '10', month: 'DIC', time: '17:30 — 20:00', location: 'Málaga TechPark', venue: 'Auditorio Principal', description: 'Una charla práctica sobre seguridad, privacidad y amenazas emergentes.', color: 'green' },
]

const categories: Array<EventCategory | 'Todos'> = ['Todos', 'IA', 'Desarrollo', 'Startups', 'Gaming', 'Ciberseguridad']
const siteUrl = 'https://daniel0611cn.github.io/malaga-tech-calendar/'

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'Todos'>('Todos')
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<TechEvent | null>(null)

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesCategory = activeCategory === 'Todos' || event.category === activeCategory
    const query = search.toLowerCase()
    return matchesCategory && (!query || `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(query))
  }), [activeCategory, search])

  const eventSchema = events.map((event) => ({
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: `${event.date}T${event.time.slice(0, 5)}:00+01:00`,
    endDate: `${event.date}T${event.time.slice(-5)}:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Málaga',
        addressCountry: 'ES',
        streetAddress: event.venue,
      },
    },
    organizer: { '@type': 'Organization', name: 'Málaga Tech Calendar', url: siteUrl },
    url: `${siteUrl}#evento-${event.id}`,
    image: `${siteUrl}og-image.svg`,
  }))

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <script type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@graph': eventSchema })}
      </script>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Málaga Tech Calendar">
          <span className="brand-mark"><Command size={19} /></span>
          <span>Málaga<span className="brand-accent">.</span>Tech</span>
        </a>
        <nav className="nav-links">
          <a className="active" href="#agenda">Agenda</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#sobre">Sobre el proyecto</a>
        </nav>
        <div className="top-actions">
          <button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'} type="button">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="submit-btn" type="button">+ Proponer evento</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse" /> LA AGENDA TECH DE LA COSTA DEL SOL</div>
            <h1>Donde las ideas<br /><span>se conectan.</span></h1>
            <p>Descubre los eventos que están dando forma al futuro tecnológico de Málaga. Conecta, aprende y crea algo increíble.</p>
            <div className="hero-actions">
              <a className="primary-btn" href="#agenda">Explorar eventos <ArrowUpRight size={17} /></a>
              <a className="text-btn" href="#comunidad">Conoce la comunidad <ChevronDown size={16} /></a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="terminal-card"><div className="terminal-head"><span /><span /><span /><small>~/malaga/tech</small></div><div className="terminal-body"><p><b className="purple">const</b> <b className="blue">future</b> = <b className="green">await</b> connect();</p><p className="muted">// ideas in progress</p><p><span className="prompt">&gt;</span> Málaga is building <span className="cursor">_</span></p></div></div>
            <div className="float-node node-a"><Sparkles size={16} /> IA</div>
            <div className="float-node node-b"><Code2 size={16} /> CODE</div>
          </div>
        </section>

        <section className="agenda-section" id="agenda">
          <div className="section-heading">
            <div><div className="section-kicker">PRÓXIMAMENTE</div><h2>Eventos destacados <span>↗</span></h2></div>
            <a className="view-all" href="#agenda">Ver todos los eventos <ArrowUpRight size={15} /></a>
          </div>
          <div className="toolbar">
            <div className="search-box"><Search size={17} /><input aria-label="Buscar eventos" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Busca por evento, lugar o tema..." /></div>
            <div className="filters">{categories.map((category) => <button key={category} className={activeCategory === category ? 'filter active' : 'filter'} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
            <button className="filter-more"><Filter size={15} /> Más filtros</button>
          </div>
          <div className="event-grid">
            {filteredEvents.map((event) => <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />)}
          </div>
          {filteredEvents.length === 0 && <div className="empty-state">No encontramos eventos con esos filtros. Prueba otra búsqueda.</div>}
        </section>

        <section className="community" id="comunidad">
          <div className="community-icon"><Users size={24} /></div>
          <div><div className="section-kicker">PARA LA COMUNIDAD</div><h2>¿Organizas algo en Málaga?</h2><p>Ayuda a que nadie se pierda lo que está pasando. Publica tu próximo evento tech.</p></div>
          <button className="outline-btn">Proponer un evento <ArrowUpRight size={16} /></button>
        </section>
      </main>
      <footer><span>© 2025 Málaga.Tech</span><span>Hecho con <span className="heart">♥</span> desde la Costa del Sol</span><span className="footer-links"><a href="#sobre">Instagram</a><a href="#sobre">GitHub</a></span></footer>

      {selectedEvent && <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedEvent(null)} aria-label="Cerrar detalles" type="button"><X size={18} /></button><div className={`modal-banner ${selectedEvent.color}`}><span>{selectedEvent.category}</span><CalendarDays size={48} /></div><div className="modal-content"><div className="section-kicker">{selectedEvent.month} {selectedEvent.day} · {selectedEvent.time}</div><h2 id="event-dialog-title">{selectedEvent.title}</h2><p>{selectedEvent.description}</p><div className="modal-detail"><MapPin size={17} /><span><b>{selectedEvent.location}</b><small>{selectedEvent.venue}</small></span></div><div className="modal-detail"><Clock3 size={17} /><span><b>{selectedEvent.time}</b><small>Jueves, {selectedEvent.day} de {selectedEvent.month.toLowerCase()}</small></span></div><button className="primary-btn full" type="button">Ver página del evento <ExternalLink size={16} /></button></div></div></div>}
    </div>
  )
}

function EventCard({ event, onClick }: { event: TechEvent; onClick: () => void }) {
  return <article className="event-card" id={`evento-${event.id}`} role="button" tabIndex={0} onClick={onClick} onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') onClick() }}><div className={`event-visual ${event.color}`}><div className="date-badge"><strong>{event.day}</strong><span>{event.month}</span></div><div className="visual-icon">{event.category === 'IA' ? <Sparkles /> : event.category === 'Gaming' ? <Command /> : <Code2 />}</div>{event.featured && <span className="featured-tag">★ DESTACADO</span>}</div><div className="event-info"><div className="event-meta"><span className={`category-dot ${event.color}`} /> {event.category}<span className="meta-separator">·</span><span>{event.time}</span></div><h3>{event.title}</h3><div className="event-location"><MapPin size={14} /> {event.location}</div><div className="card-footer"><span>Ver detalles <ArrowUpRight size={14} /></span><span className="attendees"><Users size={14} /> 42+</span></div></div></article>
}

export default App

createRoot(document.getElementById('root')!).render(<App />)
