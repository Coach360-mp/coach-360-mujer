'use client'

import { useState } from 'react'
import { useCoachSelection } from '@/lib/hooks/useCoachSelection'
import { useRouter } from 'next/navigation'

const COACH_INFO = {
  leo:   { nombre: 'Leo',   img: '/leo.jpg',   tag: 'Estratégico · práctico',   desc: 'Te ayuda a EJECUTAR. Directo, práctico, motivador.' },
  clara: { nombre: 'Clara', img: '/clara.jpg', tag: 'Empática · exploratoria',  desc: 'Te ayuda a TRANSFORMAR. Empática, exploratoria, validante.' },
  marco: { nombre: 'Marco', img: '/marco.jpg', tag: 'Ejecutivo · desafiante',   desc: 'Te ayuda a LIDERAR. Estratégico, desafiante, exigente.' },
}

export default function CambiarCoach() {
  const router = useRouter()
  const { coachActual, access, plan, loading, cambiarCoach } = useCoachSelection()
  const [pendiente, setPendiente] = useState(null)
  const [error, setError] = useState(null)

  const handleCambiar = async (coachId) => {
    if (coachId === coachActual) return
    setError(null)
    setPendiente(coachId)
    try {
      await cambiarCoach(coachId)
      // Vuelve al dashboard del coach nuevo
      router.replace('/dashboard?tab=coach360')
    } catch (e) {
      setError(e.message || 'Error cambiando coach')
      setPendiente(null)
    }
  }

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 12 }}>✦ Tu coach</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: '-0.025em', fontWeight: 400, lineHeight: 1.1, marginBottom: 10 }}>
        Cambiá tu coach.
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
        Mantenemos tu historial — al volver al coach anterior vas a tener todas tus conversaciones.
      </p>

      {loading && <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Cargando…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['leo', 'clara', 'marco'].map((c) => {
          const info = COACH_INFO[c]
          const accesible = access[c]
          const esActual = c === coachActual
          const cargando = pendiente === c
          return (
            <div
              key={c}
              style={{
                padding: '14px 16px',
                background: esActual ? 'var(--v-tint)' : 'var(--ink-2)',
                border: '1px solid ' + (esActual ? 'var(--v-primary)' : 'var(--line)'),
                borderRadius: 14,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                opacity: !accesible ? .55 : 1,
              }}
            >
              <img src={info.img} alt={info.nombre} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{info.nombre}</span>
                  {esActual && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: 'var(--v-primary)', color: '#0a0c0e', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', fontWeight: 700 }}>ACTIVO</span>}
                  {!accesible && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: 'var(--ink-3)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>PLAN ESENCIAL+</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 4 }}>{info.desc}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>{info.tag}</div>
              </div>
              {!esActual && (
                accesible ? (
                  <button
                    type="button"
                    onClick={() => handleCambiar(c)}
                    disabled={cargando}
                    style={{
                      padding: '8px 14px', borderRadius: 10, border: 'none',
                      background: 'var(--v-primary)', color: '#0a0c0e',
                      fontSize: 12, fontWeight: 600, cursor: cargando ? 'default' : 'pointer',
                      fontFamily: 'var(--font-sans)', flexShrink: 0,
                    }}
                  >
                    {cargando ? '…' : 'Cambiar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push('/planes')}
                    style={{
                      padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line-strong)',
                      background: 'transparent', color: 'var(--text-muted)',
                      fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0,
                    }}
                  >
                    Subir plan
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--danger, #f87171)', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  )
}
