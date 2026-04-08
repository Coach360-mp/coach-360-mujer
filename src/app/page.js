'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    }
    setLoading(false)
  }

  function goToVertical(vertical) {
    if (vertical === 'mujer') {
      // Si ya está logueado, va al dashboard. Si no, al login.
      router.push(user ? '/dashboard' : '/auth')
    } else {
      router.push(`/${vertical}`)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#d4af37', fontSize: 14 }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1410 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '60px 24px 80px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 60px' }}>
        <div style={{
          fontSize: 12,
          letterSpacing: 4,
          color: '#d4af37',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontWeight: 500,
        }}>
          ✦ Coach 360 ✦
        </div>
        <h1 style={{
          fontSize: 38,
          fontWeight: 300,
          lineHeight: 1.2,
          marginBottom: 20,
          fontFamily: 'Georgia, serif',
        }}>
          Más claridad.<br />Más poder.<br /><span style={{ fontStyle: 'italic', color: '#d4af37' }}>Más tú.</span>
        </h1>
        <p style={{ fontSize: 16, color: '#a8a8a8', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          Coaching con inteligencia artificial. Tres caminos especializados según quién eres y qué necesitas hoy.
        </p>
      </div>

      {/* Verticales */}
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Mujer */}
        <div
          onClick={() => goToVertical('mujer')}
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.04))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37, #b8941f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 600, color: '#0a0a0a', flexShrink: 0,
            }}>C</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 4 }}>
                Coach 360 ✦ Mujer
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Clara</div>
              <div style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.4 }}>
                Crecimiento personal para mujeres. Cálida, intuitiva, profunda.
              </div>
            </div>
            <div style={{ color: '#d4af37', fontSize: 20 }}>→</div>
          </div>
        </div>

        {/* General */}
        <div
          onClick={() => goToVertical('general')}
          style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.10), rgba(20, 184, 166, 0.03))',
            border: '1px solid rgba(20, 184, 166, 0.25)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.25)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 600, color: '#0a0a0a', flexShrink: 0,
            }}>L</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 4 }}>
                Coach 360
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Leo</div>
              <div style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.4 }}>
                Hábitos, propósito, productividad. Directo y estratégico.
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#14b8a6', background: 'rgba(20, 184, 166, 0.15)', padding: '4px 10px', borderRadius: 12 }}>
              Pronto
            </div>
          </div>
        </div>

        {/* Líderes */}
        <div
          onClick={() => goToVertical('lideres')}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.10), rgba(99, 102, 241, 0.03))',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 16,
            padding: 24,
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 600, color: '#fff', flexShrink: 0,
            }}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#818cf8', textTransform: 'uppercase', marginBottom: 4 }}>
                Coach 360 ✦ Líderes
              </div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Marco</div>
              <div style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.4 }}>
                Liderazgo ejecutivo. Socrático, estratégico, basado en evidencia.
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#818cf8', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 10px', borderRadius: 12 }}>
              Pronto
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 60, color: '#666', fontSize: 12 }}>
        Coach 360 · Coaching para personas reales
      </div>
    </div>
  )
}
