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
      label: 'Mujer',
      frase: 'Más claridad. Más poder. Más tú.',
      color: '#d4af37',
      colorSecondary: '#f5c842',
      colorBg: 'rgba(212, 175, 55, 0.12)',
      colorBorder: 'rgba(212, 175, 55, 0.4)',
      disponible: true,
    },
    {
      id: 'general',
      label: 'General',
      frase: 'Hábitos, propósito, resultados.',
      color: '#14b8a6',
      colorSecondary: '#0d9488',
      colorBg: 'rgba(20, 184, 166, 0.10)',
      colorBorder: 'rgba(20, 184, 166, 0.35)',
      disponible: true,
    },
    {
      id: 'lideres',
      label: 'Líderes',
      frase: 'Lidera con claridad. Decide con evidencia.',
      color: '#818cf8',
      colorSecondary: '#6366f1',
      colorBg: 'rgba(99, 102, 241, 0.10)',
      colorBorder: 'rgba(99, 102, 241, 0.35)',
      disponible: true,
    },
    {
      id: 'equipos',
      label: 'Equipos',
      frase: 'Alineación, confianza, resultados.',
      color: '#f472b6',
      colorSecondary: '#ec4899',
      colorBg: 'rgba(244, 114, 182, 0.10)',
      colorBorder: 'rgba(244, 114, 182, 0.35)',
      disponible: false,
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a1410 0%, #0a0a0a 60%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Logo Coach 360 grande en el centro */}
      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
        {/* Estrella decorativa arriba */}
        <div style={{
          fontSize: 14,
          letterSpacing: 6,
          color: '#d4af37',
          marginBottom: 24,
          opacity: 0.7,
        }}>
          ✦
        </div>

        {/* Logo principal */}
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 72,
          fontWeight: 300,
          lineHeight: 0.95,
          marginBottom: 8,
          background: 'linear-gradient(135deg, #f5e6a8 0%, #d4af37 50%, #b8941f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: -2,
        }}>
          Coach
        </div>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 96,
          fontWeight: 300,
          lineHeight: 0.95,
          background: 'linear-gradient(135deg, #f5e6a8 0%, #d4af37 50%, #b8941f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: -3,
          fontStyle: 'italic',
          marginBottom: 16,
        }}>
          360
        </div>

        {/* Estrella decorativa abajo */}
        <div style={{
          fontSize: 14,
          letterSpacing: 6,
          color: '#d4af37',
          marginBottom: 28,
          opacity: 0.7,
        }}>
          ✦
        </div>

        {/* Frase transversal */}
        <p style={{
          fontSize: 17,
          color: '#d4d4d4',
          lineHeight: 1.5,
          maxWidth: 460,
          margin: '0 auto 8px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 300,
        }}>
          Coaching para cada versión de ti.
        </p>
        <p style={{
          fontSize: 13,
          color: '#888',
          lineHeight: 1.5,
          maxWidth: 400,
          margin: '0 auto',
          letterSpacing: 0.3,
        }}>
          Elige tu camino
        </p>
      </div>

      {/* Grid de 4 verticales */}
      <div style={{
        width: '100%',
        maxWidth: 760,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 14,
      }}>
        {verticales.map((v) => (
          <div
            key={v.id}
            onClick={() => v.disponible && goToVertical(v.id)}
            style={{
              background: `linear-gradient(135deg, ${v.colorBg}, rgba(0,0,0,0.25))`,
              border: `1px solid ${v.colorBorder}`,
              borderRadius: 18,
              padding: '28px 24px',
              cursor: v.disponible ? 'pointer' : 'default',
              transition: 'all 0.25s ease',
              position: 'relative',
              textAlign: 'center',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              opacity: v.disponible ? 1 : 0.75,
            }}
            onMouseEnter={(e) => {
              if (v.disponible) {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = v.color
                e.currentTarget.style.boxShadow = `0 16px 48px ${v.colorBg}`
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = v.colorBorder
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Badge próximamente */}
            {!v.disponible && (
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
                fontSize: 9,
                letterSpacing: 1.5,
                color: v.color,
                background: 'rgba(0,0,0,0.5)',
                padding: '4px 10px',
                borderRadius: 10,
                textTransform: 'uppercase',
                fontWeight: 600,
                border: `1px solid ${v.colorBorder}`,
              }}>
                Pronto
              </div>
            )}

            {/* Label pequeño arriba */}
            <div style={{
              fontSize: 10,
              letterSpacing: 3,
              color: v.color,
              textTransform: 'uppercase',
              marginBottom: 8,
              fontWeight: 600,
              opacity: 0.9,
            }}>
              Coach 360
            </div>

            {/* Nombre grande de la vertical */}
            <h2 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 36,
              fontWeight: 300,
              lineHeight: 1,
              color: '#fff',
              marginBottom: 16,
              letterSpacing: -0.5,
            }}>
              {v.label}
            </h2>

            {/* Frase */}
            <p style={{
              fontSize: 13,
              color: '#c8c8c8',
              lineHeight: 1.5,
              marginBottom: 20,
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              minHeight: 40,
            }}>
              {v.frase}
            </p>

            {/* CTA */}
            {v.disponible ? (
              <div style={{
                display: 'inline-block',
                fontSize: 12,
                color: v.color,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                paddingTop: 12,
                borderTop: `1px solid ${v.colorBorder}`,
              }}>
                Entrar →
              </div>
            ) : (
              <div style={{
                fontSize: 11,
                color: '#666',
                letterSpacing: 1,
                textTransform: 'uppercase',
                paddingTop: 12,
                borderTop: `1px solid rgba(255,255,255,0.08)`,
              }}>
                Disponible pronto
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: 56,
        color: '#555',
        fontSize: 11,
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        Coaching con Inteligencia Artificial
      </div>
    </div>
  )
}
