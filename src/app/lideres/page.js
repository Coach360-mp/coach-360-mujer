'use client'

import { useRouter } from 'next/navigation'

export default function LideresPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0a1a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '60px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#a8a8a8',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 12,
            cursor: 'pointer',
            marginBottom: 40,
          }}
        >
          ← Volver
        </button>

        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 42, fontWeight: 600, color: '#fff',
          margin: '0 auto 24px',
        }}>M</div>

        <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12 }}>
          Coach 360 ✦ Líderes
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 300,
          marginBottom: 16,
          fontFamily: 'Georgia, serif',
        }}>
          Soy <span style={{ fontStyle: 'italic', color: '#818cf8' }}>Marco</span>
        </h1>

        <p style={{ fontSize: 16, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 32 }}>
          Tu sparring partner estratégico. No te diré qué hacer. Te haré las preguntas que nadie te hace.
        </p>

        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, color: '#818cf8', marginBottom: 8, fontWeight: 500 }}>
            Disponible muy pronto
          </div>
          <div style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.5 }}>
            Liderazgo basado en evidencia: feedback, acuerdos, seguridad psicológica, delegación y conversaciones difíciles. Diseñado para líderes que quieren resultados reales con sus equipos.
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            border: 'none',
            padding: '14px 28px',
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Notificarme cuando esté listo
        </button>
      </div>
    </div>
  )
}
