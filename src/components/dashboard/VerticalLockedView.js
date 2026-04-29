'use client'

import { useRouter } from 'next/navigation'

const COPY = {
  mujer: {
    coach: 'Clara',
    coachImg: '/clara.jpg',
    dataV: 'clara',
    titulo: 'La pestaña Mujer requiere plan Esencial',
    subtitulo: 'Acá vas a tener herramientas pensadas para tu contexto: ciclos, autonomía, autenticidad y autoridad. Y a Clara como coach.',
  },
  lideres: {
    coach: 'Marco',
    coachImg: '/marco.jpg',
    dataV: 'marco',
    titulo: 'La pestaña Líderes requiere plan Esencial',
    subtitulo: 'Acá vas a tener herramientas pensadas para liderar: stakeholders, decisiones difíciles, feedback. Y a Marco como coach.',
  },
}

export default function VerticalLockedView({ vertical }) {
  const router = useRouter()
  const copy = COPY[vertical]
  if (!copy) return null

  return (
    <div className="dir-ritual" data-v={copy.dataV} style={{
      minHeight: 'calc(100vh - 60px)',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        maxWidth: 540,
        width: '100%',
        textAlign: 'center',
        background: 'var(--ink-2)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: '40px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <img src={copy.coachImg} alt={copy.coach} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--v-primary)' }} />
        </div>
        <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--v-primary)' }}>✦ Plan Esencial</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 36px)', letterSpacing: '-0.025em', fontWeight: 400, lineHeight: 1.2, marginBottom: 14 }}>
          {copy.titulo}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28, maxWidth: 460, margin: '0 auto 28px' }}>
          {copy.subtitulo}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <button onClick={() => router.push('/planes')} style={{
            padding: '13px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--v-primary)',
            color: '#0a0c0e',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            minWidth: 220,
          }}>
            Subir a Plan Esencial
          </button>
          <button onClick={() => router.replace('/dashboard?tab=coach360')} style={{
            padding: '11px 20px',
            borderRadius: 12,
            border: '1px solid var(--line-strong)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>
            Volver a Coach 360
          </button>
        </div>

        <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>✦ Plan Esencial incluye</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, textAlign: 'left', maxWidth: 320, margin: '0 auto' }}>
            <li>— Coaches premium ({copy.coach} y los demás)</li>
            <li>— Las 3 pestañas con todas las herramientas</li>
            <li>— Conversaciones ilimitadas</li>
            <li>— Tests y módulos completos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
