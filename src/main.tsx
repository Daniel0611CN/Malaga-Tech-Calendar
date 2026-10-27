import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { loadAnalytics, setAnalyticsConsent, trackEvent } from './analytics'
import {
  ArrowUpRight,
  Bot,
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
  WandSparkles,
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
  eventUrl: string
  mapUrl: string
  featured?: boolean
}

const events: TechEvent[] = [
  { id: 1, title: 'Málaga AI Week', category: 'IA', date: '2026-11-20', day: '20', month: 'NOV', time: '09:30 — 18:30', location: 'Málaga TechPark', venue: 'Edificio The Green Ray', description: 'Una jornada para descubrir cómo la inteligencia artificial está transformando nuestro día a día.', color: 'violet', eventUrl: 'https://www.google.com/search?q=M%C3%A1laga+AI+Week', mapUrl: 'https://www.google.com/maps/search/?api=1&query=M%C3%A1laga+TechPark', featured: true },
  { id: 2, title: 'Frontend Málaga #42', category: 'Desarrollo', date: '2026-11-12', day: '12', month: 'NOV', time: '18:30 — 20:30', location: 'La Farola', venue: 'Calle Comandante Benítez, 8', description: 'Comunidad, código y buenas conversaciones sobre el futuro de la web.', color: 'cyan', eventUrl: 'https://www.google.com/search?q=Frontend+M%C3%A1laga+meetup', mapUrl: 'https://www.google.com/maps/search/?api=1&query=La+Farola+M%C3%A1laga' },
  { id: 3, title: 'Startup Grind Málaga', category: 'Startups', date: '2026-11-25', day: '25', month: 'NOV', time: '19:00 — 21:00', location: 'The Pool', venue: 'Paseo de la Farola, 8', description: 'Conoce a las personas que están construyendo las próximas grandes ideas desde Málaga.', color: 'orange', eventUrl: 'https://www.google.com/search?q=Startup+Grind+M%C3%A1laga', mapUrl: 'https://www.google.com/maps/search/?api=1&query=The+Pool+M%C3%A1laga' },
  { id: 4, title: 'GameLab Costa del Sol', category: 'Gaming', date: '2026-12-04', day: '04', month: 'DIC', time: '16:00 — 22:00', location: 'FYCMA', venue: 'Av. de José Ortega y Gasset, 201', description: 'Creadores, estudios y jugadores se encuentran para celebrar el talento local.', color: 'pink', eventUrl: 'https://www.google.com/search?q=GameLab+Costa+del+Sol', mapUrl: 'https://www.google.com/maps/search/?api=1&query=FYCMA+M%C3%A1laga' },
  { id: 5, title: 'CyberSec Sunset', category: 'Ciberseguridad', date: '2026-12-10', day: '10', month: 'DIC', time: '17:30 — 20:00', location: 'Málaga TechPark', venue: 'Auditorio Principal', description: 'Una charla práctica sobre seguridad, privacidad y amenazas emergentes.', color: 'green', eventUrl: 'https://www.google.com/search?q=Cybersecurity+M%C3%A1laga+eventos', mapUrl: 'https://www.google.com/maps/search/?api=1&query=M%C3%A1laga+TechPark' },
]

const categories: Array<EventCategory | 'Todos'> = ['Todos', 'IA', 'Desarrollo', 'Startups', 'Gaming', 'Ciberseguridad']
const siteUrl = 'https://daniel0611cn.github.io/malaga-tech-calendar/'
const repositoryUrl = 'https://github.com/Daniel0611CN/malaga-tech-calendar'
const proposalUrl = `${repositoryUrl}/issues/new?title=Propuesta%20de%20evento&body=Nombre%20del%20evento%3A%0A%0AFecha%3A%0A%0ALugar%3A%0A%0AEnlace%20oficial%3A%0A%0ADescripci%C3%B3n%3A`

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'Todos'>('Todos')
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<TechEvent | null>(null)
  const [mascotMessage, setMascotMessage] = useState('¡Hola! Soy Nubi, tu guía tech de Málaga.')
  const [mascotMood, setMascotMood] = useState<'idle' | 'excited'>('idle')
  const [analyticsChoice, setAnalyticsChoice] = useState<boolean | null>(() => {
    const stored = localStorage.getItem('analytics-consent')
    return stored === 'granted' ? true : stored === 'denied' ? false : null
  })

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    trackEvent('theme_changed', { theme: darkMode ? 'dark' : 'light' })
  }, [darkMode])

  useEffect(() => {
    loadAnalytics()
    trackEvent('page_view', { page_title: document.title })
  }, [])

  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesCategory = activeCategory === 'Todos' || event.category === activeCategory
    const query = search.toLowerCase()
    return matchesCategory && (!query || `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(query))
  }), [activeCategory, search])

  const mascotMessages = [
    '¡Hola! Soy Nubi, tu guía tech de Málaga.',
    '¿Buscas ideas? Prueba a filtrar por IA.',
    'Psst... los mejores eventos empiezan con una conversación.',
    '¡Haz clic en un evento y te cuento más!',
    'Nubi recomienda: trae curiosidad y muchas preguntas.',
  ]

  const cheerMascot = () => {
    const nextMessage = mascotMessages[Math.floor(Math.random() * mascotMessages.length)]
    setMascotMessage(nextMessage)
    setMascotMood('excited')
    trackEvent('mascot_interaction', { message: nextMessage })
    window.setTimeout(() => setMascotMood('idle'), 900)
  }

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
    url: event.eventUrl,
    image: `${siteUrl}og-image.svg`,
  }))

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <script type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@graph': eventSchema })}
      </script>
      <header className="topbar">
        <a className="brand" href={siteUrl} aria-label="Málaga Tech Calendar">
          <span className="brand-mark"><Command size={19} /></span>
          <span>Málaga<span className="brand-accent">.</span>Tech</span>
        </a>
        <nav className="nav-links">
          <a className="active" href="#agenda">Agenda</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#sobre">Sobre el proyecto</a>
        </nav>
        <div className="top-actions">
          <button className="icon-btn" onClick={() => { setDarkMode(!darkMode); trackEvent('theme_toggle') }} aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'} type="button">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a className="submit-btn" href={proposalUrl} target="_blank" rel="noreferrer">+ Proponer evento</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse" /> LA AGENDA TECH DE LA COSTA DEL SOL</div>
            <h1>Donde las ideas<br /><span>se conectan.</span></h1>
            <p>Descubre los eventos que están dando forma al futuro tecnológico de Málaga. Conecta, aprende y crea algo increíble.</p>
            <div className="event-note"><WandSparkles size={15} /> Proyecto creado durante el evento <b>GitHub Devs de la UMA</b></div>
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
            <div className="search-box"><Search size={17} /><input aria-label="Buscar eventos" value={search} onChange={(e) => { setSearch(e.target.value); trackEvent('search', { query_length: e.target.value.length }) }} placeholder="Busca por evento, lugar o tema..." /></div>
            <div className="filters">{categories.map((category) => <button key={category} className={activeCategory === category ? 'filter active' : 'filter'} onClick={() => { setActiveCategory(category); trackEvent('filter_selected', { category }) }}>{category}</button>)}</div>
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
          <a className="outline-btn" href={proposalUrl} target="_blank" rel="noreferrer">Proponer un evento <ArrowUpRight size={16} /></a>
        </section>
        <section className="about-section" id="sobre">
          <div className="section-kicker">PROYECTO ABIERTO</div>
          <h2>Una agenda creada para conectar Málaga.</h2>
          <p>Esta web se está construyendo en el evento <b>GitHub Devs de la UMA</b> para dar visibilidad a la comunidad tecnológica local y experimentar con nuevas formas de conectar personas e ideas.</p>
          <a className="text-btn" href={repositoryUrl} target="_blank" rel="noreferrer">Ver el código en GitHub <ExternalLink size={15} /></a>
        </section>
      </main>
      <footer>
        <div className="footer-brand"><a className="brand" href={siteUrl}><span className="brand-mark"><Command size={17} /></span><span>Málaga<span className="brand-accent">.</span>Tech</span></a><p>El mapa vivo de la comunidad tecnológica de Málaga.</p></div>
        <div className="footer-column"><strong>Explora</strong><a href="#agenda">Eventos</a><a href="#comunidad">Comunidad</a><a href="#sobre">El proyecto</a></div>
        <div className="footer-column"><strong>Enlaces</strong><a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub <ExternalLink size={12} /></a><a href="https://www.uma.es/" target="_blank" rel="noreferrer">UMA <ExternalLink size={12} /></a><a href={proposalUrl} target="_blank" rel="noreferrer">Proponer evento <ExternalLink size={12} /></a></div>
        <div className="footer-bottom"><span>© 2026 Málaga Tech Calendar</span><span>Hecho con <span className="heart">♥</span> desde la Costa del Sol</span></div>
      </footer>

      <div className={`mascot-wrap ${mascotMood}`}>
        <div className="mascot-bubble">{mascotMessage}</div>
        <button className="mascot" type="button" aria-label="Hablar con Nubi" onClick={cheerMascot}>
          <span className="mascot-glow" />
          <span className="mascot-antenna" />
          <span className="mascot-face"><Bot size={29} /><i /><i /></span>
          <span className="mascot-feet"><b /><b /></span>
        </button>
        <span className="mascot-hint">toca a Nubi</span>
      </div>

      {analyticsChoice === null && <div className="consent-banner"><div><strong>¿Activamos las analíticas?</strong><p>Nos ayudan a saber qué secciones interesan más. Son opcionales y puedes cambiar tu decisión borrando las preferencias del navegador.</p></div><div className="consent-actions"><button className="consent-secondary" onClick={() => { setAnalyticsChoice(false); setAnalyticsConsent(false) }} type="button">Ahora no</button><button className="primary-btn" onClick={() => { setAnalyticsChoice(true); setAnalyticsConsent(true) }} type="button">Aceptar analíticas</button></div></div>}

      {selectedEvent && <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedEvent(null)} aria-label="Cerrar detalles" type="button"><X size={18} /></button><div className={`modal-banner ${selectedEvent.color}`}><span>{selectedEvent.category}</span><CalendarDays size={48} /></div><div className="modal-content"><div className="section-kicker">{selectedEvent.month} {selectedEvent.day} · {selectedEvent.time}</div><h2 id="event-dialog-title">{selectedEvent.title}</h2><p>{selectedEvent.description}</p><div className="modal-detail"><MapPin size={17} /><span><b>{selectedEvent.location}</b><small>{selectedEvent.venue}</small></span></div><div className="modal-detail"><Clock3 size={17} /><span><b>{selectedEvent.time}</b><small>Jueves, {selectedEvent.day} de {selectedEvent.month.toLowerCase()}</small></span></div><div className="modal-actions"><a className="primary-btn full" href={selectedEvent.eventUrl} target="_blank" rel="noreferrer">Buscar información del evento <ExternalLink size={16} /></a><a className="map-link" href={selectedEvent.mapUrl} target="_blank" rel="noreferrer"><MapPin size={15} /> Abrir ubicación en Google Maps</a></div></div></div></div>}
    </div>
  )
}

function EventCard({ event, onClick }: { event: TechEvent; onClick: () => void }) {
  return <article className="event-card" id={`evento-${event.id}`} role="button" tabIndex={0} onClick={() => { onClick(); trackEvent('event_view', { event_name: event.title, category: event.category }) }} onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') { onClick(); trackEvent('event_view', { event_name: event.title, category: event.category }) } }}><div className={`event-visual ${event.color}`}><div className="date-badge"><strong>{event.day}</strong><span>{event.month}</span></div><div className="visual-icon">{event.category === 'IA' ? <Sparkles /> : event.category === 'Gaming' ? <Command /> : <Code2 />}</div>{event.featured && <span className="featured-tag">★ DESTACADO</span>}</div><div className="event-info"><div className="event-meta"><span className={`category-dot ${event.color}`} /> {event.category}<span className="meta-separator">·</span><span>{event.time}</span></div><h3>{event.title}</h3><div className="event-location"><MapPin size={14} /> {event.location}</div><div className="card-footer"><span>Ver detalles <ArrowUpRight size={14} /></span><span className="attendees"><Users size={14} /> 42+</span></div></div></article>
}

export default App

createRoot(document.getElementById('root')!).render(<App />)
