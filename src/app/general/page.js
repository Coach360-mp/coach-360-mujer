'use client'

import { useRouter } from 'next/navigation'

export default function GeneralPage() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #0a1a1a 100%)',
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
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 42, fontWeight: 600, color: '#0a0a0a',
          margin: '0 auto 24px',
        }}>L</div>

        <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12 }}>
          Coach 360
        </div>

        <h1 style={{
          fontSize: 36,
          fontWeight: 300,
          marginBottom: 16,
          fontFamily: 'Georgia, serif',
        }}>
          Hola, soy <span style={{ fontStyle: 'italic', color: '#14b8a6' }}>Leo</span>
        </h1>

        <p style={{ fontSize: 16, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 32 }}>
          Tu coach para hábitos, propósito y productividad. Directo, estratégico y sin rodeos.
        </p>

        <div style={{
          background: 'rgba(20, 184, 166, 0.08)',
          border: '1px solid rgba(20, 184, 166, 0.3)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, color: '#14b8a6', marginBottom: 8, fontWeight: 500 }}>
            Disponible muy pronto
          </div>
          <div style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.5 }}>
            Estoy preparando 8 módulos, 8 tests de diagnóstico y 10 herramientas basadas en los mejores autores de desarrollo personal: Clear, Newport, Dweck, Goleman, Frankl y más.
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
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
