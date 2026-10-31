import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { setAnalyticsConsent } from './analytics'

type Doc = 'aviso' | 'privacidad' | 'cookies' | 'config'
// eslint-disable-next-line react-refresh/only-export-components
export const openLegal = (d: Doc) => window.dispatchEvent(new CustomEvent('legal:open', { detail: d }))
const KEY = 'analytics-consent'
const contact = 'mediante una incidencia en https://github.com/Daniel0611CN/Malaga-Tech-Calendar/issues'
const owner = 'Málaga Tech Calendar es un proyecto educativo y sin ánimo de lucro de Daniel0611CN, realizado durante el evento GitHub Dev Days en la Universidad de Málaga (UMA).'

const docs: Record<Exclude<Doc, 'config'>, { title: string; body: [string, string | string[]][] }> = {
  aviso: { title: 'Aviso legal', body: [
    ['Titular', `${owner} Contacto: ${contact}.`],
    ['Objeto', 'Informar sobre eventos tecnológicos de Málaga. La web no vende productos ni presta servicios comerciales.'],
    ['Información de los eventos', 'Procede de fuentes públicas indicadas en cada ficha y puede cambiar. Las ediciones marcadas como «fecha estimada» son proyecciones a partir de la edición anterior y no están confirmadas por el organizador. Confirma siempre fechas, horarios y precios en la web oficial.'],
    ['Propiedad intelectual', 'Los nombres, marcas y logotipos de eventos y organizadores pertenecen a sus titulares y se citan solo con fines informativos.'],
    ['Enlaces externos', 'No nos responsabilizamos de los contenidos de sitios de terceros enlazados.'],
    ['Legislación', 'Esta web se rige por la legislación española, en particular la Ley 34/2002 (LSSI-CE).'],
  ] },
  privacidad: { title: 'Política de privacidad', body: [
    ['Responsable', `${owner} Contacto: ${contact}.`],
    ['Datos personales', 'La web no tiene cuentas ni formularios y no recoge datos personales por sí misma. Las propuestas de eventos se envían en GitHub y están sujetas a su política de privacidad.'],
    ['Analíticas', 'Solo si las aceptas y el sitio las tiene activadas, se usa Google Analytics 4 con IP anonimizada para medir visitas de forma agregada. Google puede tratar datos fuera del Espacio Económico Europeo. La base jurídica es tu consentimiento, que puedes retirar cuando quieras.'],
    ['Tus derechos', 'Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad con el contacto indicado, y reclamar ante la Agencia Española de Protección de Datos (aepd.es).'],
  ] },
  cookies: { title: 'Política de cookies', body: [
    ['Qué son', 'Pequeños archivos o datos que el navegador guarda para recordar preferencias o medir el uso de la web.'],
    ['Cuáles usamos', [
      '«analytics-consent» (almacenamiento local, técnica): guarda tu elección sobre analíticas.',
      '«nubi-still» (almacenamiento local, técnica): recuerda si prefieres a la mascota quieta.',
      '«_ga» y «_ga_*» (Google Analytics, analítica, hasta 2 años): solo si las aceptas y las analíticas están activadas.',
    ]],
    ['Cómo gestionarlas', 'Cambia tu elección cuando quieras desde «Configurar cookies» en el pie de página o borrando los datos del sitio en tu navegador.'],
  ] },
}

export default function LegalHost() {
  const [doc, setDoc] = useState<Doc | null>(null)
  const [choice, setChoice] = useState(() => localStorage.getItem(KEY))
  const [ga, setGa] = useState(choice === 'granted')

  useEffect(() => {
    const open = (e: Event) => { setGa(localStorage.getItem(KEY) === 'granted'); setDoc((e as CustomEvent<Doc>).detail) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setDoc(null)
    addEventListener('legal:open', open); addEventListener('keydown', esc)
    return () => { removeEventListener('legal:open', open); removeEventListener('keydown', esc) }
  }, [])
  useEffect(() => { document.body.style.overflow = doc ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [doc])

  const save = (v: boolean) => { setAnalyticsConsent(v); setChoice(v ? 'granted' : 'denied'); setDoc(null) }
  const d = doc && doc !== 'config' ? docs[doc] : null

  return (
    <>
      {choice === null && !doc && (
        <div className="cookiebar" role="dialog" aria-label="Aviso de cookies">
          <p><strong>Tu privacidad importa.</strong> Usamos almacenamiento técnico necesario y, solo si lo aceptas, cookies analíticas para mejorar la web. Más información en la <button className="link" onClick={() => openLegal('cookies')}>política de cookies</button>.</p>
          <div className="cbtns">
            <button className="btn" onClick={() => save(false)}>Rechazar</button>
            <button className="btn" onClick={() => openLegal('config')}>Configurar</button>
            <button className="btn primary" onClick={() => save(true)}>Aceptar</button>
          </div>
        </div>
      )}
      {doc && (
        <div className="backdrop" onClick={() => setDoc(null)}>
          <div className="modal legal" role="dialog" aria-modal="true" aria-label={d?.title ?? 'Configurar cookies'} onClick={(e) => e.stopPropagation()}>
            <button className="btn close" onClick={() => setDoc(null)} aria-label="Cerrar"><X size={16} /></button>
            {d ? (
              <>
                <h2>{d.title}</h2>
                {d.body.map(([h, t]) => <div key={h}><h3>{h}</h3>{Array.isArray(t) ? <ul>{t.map((x) => <li key={x}>{x}</li>)}</ul> : <p>{t}</p>}</div>)}
              </>
            ) : (
              <>
                <h2>Configurar cookies</h2>
                <div className="switch"><span><b>Técnicas</b><br /><small>Necesarias para recordar tus preferencias. Siempre activas.</small></span><input type="checkbox" checked disabled aria-label="Técnicas" /></div>
                <label className="switch"><span><b>Analíticas</b><br /><small>Google Analytics 4 con IP anonimizada. Desactivadas por defecto.</small></span><input type="checkbox" checked={ga} onChange={(e) => setGa(e.target.checked)} /></label>
                <div className="cbtns"><button className="btn" onClick={() => save(false)}>Rechazar todas</button><button className="btn primary" onClick={() => save(ga)}>Guardar selección</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
