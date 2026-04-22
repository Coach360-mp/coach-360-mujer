// Helpers visuales del design system Fase 5 (tokens.css + /clara/leo/marco.jpg).
// Se importan desde páginas y vistas que usen className="dir-ritual" / data-v.

// ─── Iconos SVG — copia literal del const Icon de Fase 5 (líneas 906-958) ───
export const Icon = {
  sparkle: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3 3l2 2M11 11l2 2M3 13l2-2M11 5l2-2"/>
    </svg>
  ),
  check: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>
  ),
  arrow: ({ s = 14, dir = 'right' }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'up' ? 'rotate(-90deg)' : dir === 'down' ? 'rotate(90deg)' : 'none' }}>
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  lock: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
  ),
  mic: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="1.5" width="4" height="8" rx="2"/><path d="M3 7a5 5 0 0 0 10 0M8 12v2.5"/>
    </svg>
  ),
  plus: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
  ),
  dots: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>
  ),
  moon: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z"/></svg>
  ),
  chart: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h12M4 10v3M7 7v6M10 4v9M13 8v5"/></svg>
  ),
  star: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 1.5l1.8 4 4.2.4-3.2 2.9.9 4.2L8 10.8l-3.7 2.2.9-4.2L2 5.9l4.2-.4z"/></svg>
  ),
  close: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
  ),
  flame: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"><path d="M8 1s4 3 4 7a4 4 0 1 1-8 0c0-1.5 1-2.5 1.5-3C5.5 4 6 2.5 8 1z"/><path d="M8 10a1.5 1.5 0 0 0 1.5-1.5c0-.8-1-1.5-1.5-2-.5.5-1.5 1.2-1.5 2A1.5 1.5 0 0 0 8 10z"/></svg>
  ),
  book: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h4a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2H3zM13 3H9a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h4z"/></svg>
  ),
  compass: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M10.5 5.5L9 9l-3.5 1.5L7 7z" fill="currentColor"/></svg>
  ),
}

export function Sigil({ s = 18 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5.5" opacity=".55" />
      <path d="M12 2v20M2 12h20" opacity=".22" />
    </svg>
  )
}

export function RealPortrait({ src, size = 40, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? '0 0 0 3px var(--bg), 0 0 0 4px color-mix(in oklab, var(--v-primary) 50%, transparent)' : 'none',
      background: 'var(--ink-3)',
    }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}
