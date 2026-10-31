import { useEffect, useRef, useState } from 'react'

const S = 76
const emit = (n: string, d: unknown) => window.dispatchEvent(new CustomEvent(n, { detail: d }))
// eslint-disable-next-line react-refresh/only-export-components
export const nubi = {
  say: (text: string) => emit('nubi:say', text),
  goto: (el: Element, text?: string) => emit('nubi:goto', { rect: el.getBoundingClientRect(), text }),
}
const isStill = () => localStorage.getItem('nubi-still') === '1'

export function NubiToggle() {
  const [still, setStill] = useState(isStill)
  return (
    <button className="link" onClick={() => { localStorage.setItem('nubi-still', still ? '0' : '1'); setStill(!still); emit('nubi:toggle', !still) }}>
      Orbi: {still ? 'quieta' : 'paseando'}
    </button>
  )
}

type Mode = 'wander' | 'follow' | 'goto' | 'drag' | 'sleep'
const SPRING: Record<Mode, [number, number]> = { wander: [9, 6], follow: [40, 11], goto: [22, 9], drag: [400, 40], sleep: [10, 6] }

export default function Mascot() {
  const root = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const pupils = useRef<SVGGElement>(null)
  const [msg, setMsg] = useState('')
  const [bpos, setBpos] = useState('')
  const [mood, setMood] = useState<'idle' | 'happy' | 'sleep'>('idle')
  const [party, setParty] = useState(false)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const corner = () => ({ x: innerWidth - S - 16, y: innerHeight - S - 16 })
    const s = { mode: 'wander' as Mode, still: isStill() || reduced, last: Date.now(), px: innerWidth / 2, py: innerHeight / 2, pt: 0, hover: false, face: 1 }
    const p = { x: innerWidth + 80, y: corner().y, vx: 0, vy: 0 }
    const t = { ...corner() }
    const timers: number[] = []
    let raf = 0, prev = performance.now(), drag: { sx: number; sy: number; moved: boolean } | null = null

    const later = (fn: () => void, ms: number) => { const id = window.setTimeout(fn, ms); timers.push(id); return id }
    const setMode = (m: Mode) => { s.mode = m }
    const go = (x: number, y: number) => { if (s.hover && s.mode !== 'drag') return; t.x = Math.min(Math.max(8, x), innerWidth - S - 8); t.y = Math.min(Math.max(72, y), innerHeight - S - 8) }
    let speakId = 0
    const speak = (text: string, ms = 3500) => {
      setMsg(text); setBpos(`${p.y < 110 ? 'below' : ''} ${p.x < 180 ? 'left' : ''}`)
      clearTimeout(speakId); speakId = window.setTimeout(() => setMsg(''), ms)
    }
    const happy = (ms = 900) => { setMood('happy'); later(() => setMood((m) => (m === 'happy' ? 'idle' : m)), ms) }
    const wake = () => { s.last = Date.now(); if (s.mode === 'sleep') { setMode('wander'); setMood('idle'); speak('¡Buenos días! ☀️') } }
    const wander = () => {
      if (s.mode === 'wander') { if (s.still) go(corner().x, corner().y); else go(Math.random() * innerWidth, 72 + Math.random() * (innerHeight - 150)) }
      later(wander, 4000 + Math.random() * 4000)
    }
    let holdId = 0
    const onGoto = (e: Event) => {
      const { rect, text } = (e as CustomEvent<{ rect: DOMRect; text?: string }>).detail
      wake()
      if (text) speak(text)
      if (s.mode === 'drag' || s.mode === 'follow' || s.still) return
      setMode('goto'); go(rect.right - S * 0.8, rect.top - S * 0.55); happy()
      clearTimeout(holdId); holdId = window.setTimeout(() => { if (s.mode === 'goto') setMode('wander') }, 4000)
    }
    const onSay = (e: Event) => { wake(); speak((e as CustomEvent<string>).detail); happy() }
    const onToggle = (e: Event) => { s.still = (e as CustomEvent<boolean>).detail || reduced; setMode('wander'); if (s.still) go(corner().x, corner().y) }
    const onMove = (e: PointerEvent) => {
      s.px = e.clientX; s.py = e.clientY; s.pt = performance.now(); wake()
    }
    const click = () => {
      wake(); happy(); s.pt = performance.now()
      if (s.mode === 'follow') { setMode('wander'); speak('Vale, me quedo por aquí.') }
      else { setMode('follow'); speak('¡Te sigo! Acércate y haz clic para soltarme.') }
    }
    const down = (e: PointerEvent) => { btn.current?.setPointerCapture(e.pointerId); drag = { sx: e.clientX, sy: e.clientY, moved: false } }
    const dmove = (e: PointerEvent) => {
      if (!drag) return
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) { drag.moved = true; setMode('drag'); speak('¡Eeeh!', 1500) }
      if (drag.moved) go(e.clientX - S / 2, e.clientY - S / 2)
    }
    const up = () => {
      if (!drag) return
      if (drag.moved) { setMode('wander'); happy(1200); speak('¡Wiii! 🎈', 1800) } else click()
      drag = null
    }
    const dbl = () => { setParty(true); later(() => setParty(false), 1300); speak('¡Modo fiesta! 🎉', 2500); happy(1300) }
    const poke = (e?: Event) => {
      wake()
      if (e instanceof KeyboardEvent && e.key === 'Escape' && s.mode === 'follow') { setMode('wander'); speak('Vale, me quedo por aquí.') }
    }

    const io = new IntersectionObserver((es) => es.forEach((x) => {
      const el = x.target as HTMLElement
      if (!x.isIntersecting || s.mode !== 'wander' || Date.now() - Number(el.dataset.seen ?? 0) < 30000) return
      el.dataset.seen = String(Date.now())
      onGoto(new CustomEvent('x', { detail: { rect: el.getBoundingClientRect(), text: el.dataset.nubi } }))
    }), { threshold: 0.5 })
    document.querySelectorAll('[data-nubi]').forEach((el) => io.observe(el))

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000); prev = now
      if (s.mode === 'follow') {
        const dx = s.px - (p.x + S / 2), dy = s.py - (p.y + S / 2), d = Math.hypot(dx, dy) || 1
        if (now - s.pt > 8000) { setMode('wander'); speak('Me canso de seguirte 😅') }
        else if (d < 90) { t.x = p.x; t.y = p.y } // cerca del cursor: se queda quieta para poder soltarla
        else go(s.px - (dx / d) * 70 - S / 2, s.py - (dy / d) * 70 - S / 2)
      }
      if (s.hover && s.mode !== 'drag') { t.x = p.x; t.y = p.y }
      const [k, c] = SPRING[s.mode]
      p.vx += ((t.x - p.x) * k - p.vx * c) * dt; p.x += p.vx * dt
      p.vy += ((t.y - p.y) * k - p.vy * c) * dt; p.y += p.vy * dt
      const sp = Math.hypot(p.vx, p.vy), q = Math.min(sp / 2500, 0.12)
      if (root.current) root.current.style.transform = `translate3d(${p.x}px,${p.y}px,0)`
      if (btn.current) {
        btn.current.style.transform = `rotate(${Math.max(-16, Math.min(16, p.vx / 30))}deg) scale(${1 + q},${1 - q})`
        btn.current.classList.toggle('walk', sp > 40)
      }
      let lx: number, ly: number
      if (now - s.pt < 3000 || s.mode === 'follow') {
        const dx = s.px - (p.x + S / 2), dy = s.py - (p.y + S / 2), d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 160)
        lx = (dx / d) * m * 3; ly = (dy / d) * m * 3
      } else { lx = Math.max(-3, Math.min(3, p.vx / 60)); ly = Math.max(-3, Math.min(3, p.vy / 60)) }
      pupils.current?.setAttribute('transform', `translate(${lx.toFixed(1)} ${ly.toFixed(1)})`)
      if (Date.now() - s.last > 35000 && s.mode !== 'sleep' && s.mode !== 'drag') { setMode('sleep'); go(corner().x, corner().y); setMood('sleep'); setMsg('') }
      raf = requestAnimationFrame(tick)
    }

    let hid = 0
    const enter = () => { clearTimeout(hid); s.hover = true }
    const leave = () => { hid = window.setTimeout(() => { s.hover = false }, 1200) }
    const b = btn.current!
    b.addEventListener('pointerenter', enter); b.addEventListener('pointerleave', leave); b.addEventListener('pointerdown', down); b.addEventListener('pointermove', dmove); b.addEventListener('pointerup', up); b.addEventListener('dblclick', dbl)
    addEventListener('pointermove', onMove, { passive: true }); addEventListener('keydown', poke); addEventListener('scroll', poke, { passive: true })
    addEventListener('nubi:goto', onGoto); addEventListener('nubi:say', onSay); addEventListener('nubi:toggle', onToggle)
    raf = requestAnimationFrame(tick)
    later(() => speak('¡Hola! Soy Orbi, tu robot guía 🤖 Arrástrame o haz clic.', 5000), 900)
    later(wander, 3000)

    return () => {
      cancelAnimationFrame(raf); timers.forEach(clearTimeout); clearTimeout(speakId); clearTimeout(holdId); io.disconnect()
      clearTimeout(hid); b.removeEventListener('pointerenter', enter); b.removeEventListener('pointerleave', leave); b.removeEventListener('pointerdown', down); b.removeEventListener('pointermove', dmove); b.removeEventListener('pointerup', up); b.removeEventListener('dblclick', dbl)
      removeEventListener('pointermove', onMove); removeEventListener('keydown', poke); removeEventListener('scroll', poke)
      removeEventListener('nubi:goto', onGoto); removeEventListener('nubi:say', onSay); removeEventListener('nubi:toggle', onToggle)
    }
  }, [])

  return (
    <div ref={root} className="mascot" aria-live="polite">
      {msg && <p className={`bubble ${bpos}`}>{msg}</p>}
      <button ref={btn} className={`nubi ${mood} ${party ? 'party' : ''}`} aria-label="Orbi, el robot mascota. Clic: te sigue; acércate y haz clic para soltarlo. Arrástralo para moverlo.">
        <svg viewBox="0 0 100 100" width={S} height={S} aria-hidden="true">
          <defs>
            <linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f8c0a7" /><stop offset=".55" stopColor="#e8845f" /><stop offset="1" stopColor="#c6613f" /></linearGradient>
            <pattern id="sl" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".07" /></pattern>
          </defs>
          <ellipse className="shadow" cx="50" cy="97" rx="22" ry="3" />
          <g className="bob">
            <g transform="rotate(-18 50 50)"><path d="M4 50A46 13 0 0 1 96 50" stroke="#f4a58a" strokeOpacity=".55" strokeWidth="1.6" strokeDasharray="3 3" fill="none" /></g>
            <path className="jet" d="M42 80Q50 99 58 80Z" fill="#ffb48f" /><path className="jet j2" d="M46 80Q50 92 54 80Z" fill="#fff0e6" />
            <rect x="34" y="60" width="32" height="22" rx="11" fill="url(#rb)" />
            <rect x="39" y="66" width="22" height="11" rx="4" fill="#17120f" />
            <text x="50" y="75" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="8" fontWeight="700" fill="#ffb48f">{'</>'}</text>
            <circle className="hand" cx="24" cy="70" r="6" fill="#c6613f" /><circle className="hand h2" cx="76" cy="70" r="6" fill="#c6613f" />
            <path d="M50 15V7" stroke="#b4532f" strokeWidth="3" strokeLinecap="round" /><circle className="tip" cx="50" cy="6" r="3.6" />
            <rect x="17" y="33" width="7" height="16" rx="3.5" fill="#b4532f" /><rect x="76" y="33" width="7" height="16" rx="3.5" fill="#b4532f" />
            <rect x="22" y="15" width="56" height="50" rx="17" fill="url(#rb)" />
            <path d="M31 22Q50 14 69 22" stroke="#fff" strokeOpacity=".4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="29" y="25" width="42" height="31" rx="11" fill="#17120f" /><rect x="29" y="25" width="42" height="31" rx="11" fill="url(#sl)" stroke="#d9775588" />
            <g className="open"><g ref={pupils}><rect className="eye" x="36" y="33" width="8" height="12" rx="3" fill="#ffb48f" /><rect className="eye" x="56" y="33" width="8" height="12" rx="3" fill="#ffb48f" /></g></g>
            <path className="hy" d="M35 43q5-9 10 0M55 43q5-9 10 0" stroke="#ffb48f" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path className="closed" d="M36 40h8M56 40h8" stroke="#ffb48f" strokeWidth="3" strokeLinecap="round" />
            <path className="mn" d="M46 50h8" stroke="#ffb48f" strokeWidth="3" strokeLinecap="round" />
            <path className="mh" d="M43 47q7 9 14 0z" fill="#ffb48f" />
            <g transform="rotate(-18 50 50)"><path d="M4 50A46 13 0 0 0 96 50" stroke="#f4a58a" strokeOpacity=".8" strokeWidth="1.6" fill="none" /><circle r="3" fill="#ffd2bf"><animateMotion dur="3.6s" repeatCount="indefinite" path="M4 50A46 13 0 0 0 96 50A46 13 0 0 0 4 50" /></circle></g>
          </g>
          {mood === 'sleep' && <g className="zz"><text x="76" y="22">z</text><text x="84" y="13">z</text><text x="91" y="6">z</text></g>}
        </svg>
      </button>
    </div>
  )
}
