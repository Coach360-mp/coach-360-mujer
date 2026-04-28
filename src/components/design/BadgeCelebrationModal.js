'use client'
// Modal celebratorio al ganar un badge (port literal Fase 5 L3625-3697).
// Soporta cola: si llegan varios badges juntos, recibe el primero y onClose pasa al siguiente.

import { useState } from 'react'

const SITE_URL = 'https://www.micoach360.com'

const VERTICAL_DEFAULTS = {
  mujer:   { v: 'clara', coachImg: '/clara.jpg', coachName: 'Clara' },
  general: { v: 'leo',   coachImg: '/leo.jpg',   coachName: 'Leo'   },
  lideres: { v: 'marco', coachImg: '/marco.jpg', coachName: 'Marco' },
}

// Frases coach por condición — mujer (Clara). Otras verticals pueden añadir su propio mapa.
const FRASES_CLARA = {
  primera_conversacion_clara: 'Empezamos. Lo difícil ya pasó: aparecer.',
  primera_herramienta: 'Una herramienta usada vale más que diez leídas.',
  primer_test: 'El primer test no se trata de los resultados — se trata de mirarte.',
  primer_modulo: 'Empezar es donde la mayoría no llega.',
  modulo_completado: 'Terminar lo que empiezas es la fortaleza más rara.',
  todos_tests: 'Te miraste desde todos los ángulos. Eso requiere coraje.',
  racha_3: 'Tres días seguidos. Eso ya es un patrón, no un impulso.',
  racha_7: 'Una semana completa volviendo a ti. Eso no es pequeño.',
  racha_30: 'Un mes. Esto ya es quien eres, no lo que haces.',
  primera_voz: 'Tu voz dice cosas que el texto esconde.',
  checkin_semanal: 'Siete check-ins. Cada uno es un sí silencioso a ti.',
  equilibrio_7: 'Equilibrio no es perfección, es atención sostenida.',
}

export function BadgeCelebrationModal({ open, badge, onClose, vertical = 'mujer' }) {
  const [feedback, setFeedback] = useState('')
  if (!open || !badge) return null
  const { v, coachImg, coachName } = VERTICAL_DEFAULTS[vertical] || VERTICAL_DEFAULTS.mujer
  const frase = FRASES_CLARA[badge.condicion] || `Otra señal de que estás avanzando. ${badge.titulo}.`

  const shareText = `Acabo de ganar la insignia "${badge.titulo}" en Coach 360. ${frase}\n\n${SITE_URL}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Insignia Coach 360', text: shareText, url: SITE_URL })
        setFeedback('')
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        setFeedback('Copiado al portapapeles')
        setTimeout(() => setFeedback(''), 2400)
      } catch {
        setFeedback('No se pudo copiar')
      }
    }
  }

  return (
    <div
      className="dir-ritual"
      data-v={v}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 3200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,12,14,.78)', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, padding: '36px 28px',
          background: 'var(--ink-1)',
          border: '1px solid color-mix(in oklab, var(--v-primary) 35%, var(--line))',
          borderRadius: 24, color: 'var(--text)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,.4)',
        }}
      >
        {/* glow superior */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 280, height: 280, borderRadius: '50%',
          background: 'var(--v-primary)', opacity: .18, filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div className="eyebrow" style={{ marginBottom: 14, color: 'var(--v-primary)', position: 'relative' }}>
          ✦ Una luz más en tu camino
        </div>

        {/* símbolo grande */}
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 22px' }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'var(--v-primary)', color: '#0a0c0e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 60,
            boxShadow: '0 8px 32px rgba(0,0,0,.3), 0 0 0 6px color-mix(in oklab, var(--v-primary) 20%, transparent)',
          }}>
            {badge.icono || '✦'}
          </div>
          <svg style={{ position: 'absolute', inset: -20, pointerEvents: 'none' }} width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="74" fill="none" stroke="var(--v-primary)" strokeWidth="1" strokeDasharray="3 8" opacity=".4">
              <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="18s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 7vw, 40px)', letterSpacing: '-0.03em', fontWeight: 400, lineHeight: 1, marginBottom: 10 }}>
          {badge.titulo}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', marginBottom: 22 }}>
          +{badge.puntos} PUNTOS
        </div>

        {/* coach voice */}
        <div style={{
          padding: '18px 16px', background: 'var(--ink-2)',
          border: '1px solid var(--line)', borderRadius: 14,
          textAlign: 'left', display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <img src={coachImg} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--v-primary)', letterSpacing: '.1em', marginBottom: 4 }}>
              {coachName.toUpperCase()} · TE DICE
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, lineHeight: 1.4, fontStyle: 'italic' }}>
              "{frase}"
            </div>
          </div>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={handleShare} style={{
            flex: 2, padding: 13, borderRadius: 12, border: 'none',
            background: 'var(--v-primary)', color: '#0a0c0e',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'var(--font-sans)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>
            </svg>
            Compartir
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: 13, borderRadius: 12,
            border: '1px solid var(--line-strong)', background: 'transparent',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>
            Después
          </button>
        </div>

        {feedback && (
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--v-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>
            {feedback}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-dim)' }}>
          Se guarda en tu perfil automáticamente.
        </div>
      </div>
    </div>
  )
}
