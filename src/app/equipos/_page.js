'use client'

import { useRouter } from 'next/navigation'

export default function EquiposPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a15 100%)',
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

        <div style={{ fontSize: 11, letterSpacing: 3, color: '#f472b6', textTransform: 'uppercase', marginBottom: 12 }}>
          Coach 360 ✦ Equipos
        </div>

        <h1 style={{
          fontSize: 38,
          fontWeight: 300,
          marginBottom: 16,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        }}>
          Alineación, confianza, resultados.
        </h1>

        <p style={{ fontSize: 16, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 32 }}>
          Coaching grupal diseñado para equipos completos. No es coaching individual — es intervención de equipo con diagnóstico, facilitación y seguimiento.
        </p>

        <div style={{
          background: 'rgba(244, 114, 182, 0.08)',
          border: '1px solid rgba(244, 114, 182, 0.3)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, color: '#f472b6', marginBottom: 8, fontWeight: 500 }}>
            En desarrollo
          </div>
          <div style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.5 }}>
            Estamos construyendo el módulo de coaching para equipos completos: diagnósticos grupales, dinámicas facilitadas por IA, retrospectivas guiadas y métricas de confianza y alineamiento.
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          style={{
            background: 'linear-gradient(135deg, #f472b6, #ec4899)',
            color: '#0a0a0a',
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
