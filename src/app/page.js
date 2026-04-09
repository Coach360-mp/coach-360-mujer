'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) setUser(session.user)
    setLoading(false)
  }

  function goToVertical(vertical) {
    if (vertical === 'mujer') {
      router.push(user ? '/dashboard' : '/mujer')
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

  const verticales = [
    {
      id: 'mujer',
      nombre: 'Coach 360 Mujer',
      frase: 'Más claridad. Más poder. Más tú.',
      descripcion: 'Crecimiento personal para mujeres. Autoconocimiento, bienestar emocional y decisiones alineadas.',
      color: '#d4af37',
      colorSecondary: '#f5c842',
      colorBg: 'rgba(212, 175, 55, 0.12)',
      colorBorder: 'rgba(212, 175, 55, 0.35)',
      disponible: true,
      badge: null,
    },
    {
      id: 'general',
      nombre: 'Coach 360',
      frase: 'Hábitos, propósito, resultados.',
      descripcion: 'Desarrollo personal integral. Hábitos, enfoque, productividad y mentalidad de crecimiento.',
      color: '#14b8a6',
      colorSecondary: '#0d9488',
      colorBg: 'rgba(20, 184, 166, 0.10)',
      colorBorder: 'rgba(20, 184, 166, 0.30)',
      disponible: false,
      badge: 'Próximamente',
    },
    {
      id: 'lideres',
      nombre: 'Coach 360 Líderes',
      frase: 'Lidera con claridad. Decide con evidencia.',
      descripcion: 'Coaching ejecutivo para jefaturas. Feedback, acuerdos, delegación y conversaciones difíciles.',
      color: '#818cf8',
      colorSecondary: '#6366f1',
      colorBg: 'rgba(99, 102, 241, 0.10)',
      colorBorder: 'rgba(99, 102, 241, 0.30)',
      disponible: false,
      badge: 'Próximamente',
    },
    {
      id: 'equipos',
      nombre: 'Coach 360 Equipos',
      frase: 'Alineación, confianza, resultados.',
      descripcion: 'Coaching grupal para equipos completos. Confianza, comunicación y alto rendimiento.',
      color: '#f472b6',
      colorSecondary: '#ec4899',
      colorBg: 'rgba(244, 114, 182, 0.10)',
      colorBorder: 'rgba(244, 114, 182, 0.30)',
      disponible: false,
      badge: 'Próximamente',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1410 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '60px 20px 80px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 56px' }}>
        <div style={{ fontSize: 12, letterSpacing: 5, color: '#d4af37', textTransform: 'uppercase', marginBottom: 20, fontWeight: 500 }}>
          ✦ Coach 360 ✦
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 300, lineHeight: 1.15, marginBottom: 20, fontFamily: 'Georgia, serif', letterSpacing: -0.5 }}>
          Coaching para cada<br /><span style={{ fontStyle: 'italic', color: '#d4af37' }}>versión de ti.</span>
        </h1>
        <p style={{ fontSize: 16, color: '#a8a8a8', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
          Cuatro plataformas especializadas con inteligencia artificial. Elige el camino que mejor se adapta a ti hoy.
        </p>
      </div>

      <div style={{
        maxWidth: 720,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {verticales.map((v) => (
          <div
            key={v.id}
            onClick={() => v.disponible && goToVertical(v.id)}
            style={{
              background: `linear-gradient(135deg, ${v.colorBg}, rgba(0,0,0,0.2))`,
              border: `1px solid ${v.colorBorder}`,
              borderRadius: 20,
              padding: 28,
              cursor: v.disponible ? 'pointer' : 'default',
              transition: 'all 0.25s ease',
              position: 'relative',
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: v.disponible ? 1 : 0.85,
            }}
            onMouseEnter={(e) => {
              if (v.disponible) {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = v.color
                e.currentTarget.style.boxShadow = `0 12px 40px ${v.colorBg}`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = v.colorBorder
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {v.badge && (
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 10,
                letterSpacing: 1.5,
                color: v.color,
                background: v.colorBg,
                padding: '5px 12px',
                borderRadius: 12,
                textTransform: 'uppercase',
                fontWeight: 600,
                border: `1px solid ${v.colorBorder}`,
              }}>
                {v.badge}
              </div>
            )}

            <div>
              <div style={{
                fontSize: 11,
                letterSpacing: 2.5,
                color: v.color,
                textTransform: 'uppercase',
                marginBottom: 10,
                fontWeight: 600,
              }}>
                {v.nombre}
              </div>

              <h2 style={{
                fontFamily: 'Georgia, serif',
                fontSize: 24,
                fontWeight: 300,
                lineHeight: 1.3,
                color: '#fff',
                marginBottom: 14,
                fontStyle: 'italic',
              }}>
                {v.frase}
              </h2>

              <p style={{
                fontSize: 13,
                color: '#b8b8b8',
                lineHeight: 1.55,
                marginBottom: 20,
              }}>
                {v.descripcion}
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: `1px solid ${v.colorBorder}`,
            }}>
              <span style={{
                fontSize: 13,
                color: v.disponible ? v.color : '#666',
                fontWeight: 600,
                letterSpacing: 0.5,
              }}>
                {v.disponible ? 'Explorar →' : 'Disponible pronto'}
              </span>
              {v.disponible && (
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${v.color}, ${v.colorSecondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0a0a0a',
                  fontSize: 16,
                  fontWeight: 700,
                }}>
                  →
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 60, color: '#666', fontSize: 12, letterSpacing: 1 }}>
        Coach 360 · Coaching con inteligencia artificial
      </div>
    </div>
  )
}
