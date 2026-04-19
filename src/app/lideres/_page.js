'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LideresPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('current_vertical, onboarding_completado')
        .eq('id', session.user.id)
        .single()
      if (perfil) {
        const vertical = perfil.current_vertical || 'lideres'
        if (vertical === 'mujer') {
          router.push(perfil.onboarding_completado ? '/dashboard' : '/onboarding')
        } else {
          router.push(perfil.onboarding_completado ? `/${vertical}/dashboard` : `/${vertical}/onboarding`)
        }
      } else {
        router.push('/lideres/onboarding')
      }
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/lideres`,
        },
      })
    } catch (err) {
      console.error('Error login:', err)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1e1b4b 0%, #0a0a0a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#a8a8a8',
          padding: '8px 16px',
          borderRadius: 20,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        ← Volver
      </button>

      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24, color: '#818cf8' }}>✦</div>

        <div style={{
          fontSize: 11,
          letterSpacing: 4,
          color: '#818cf8',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontWeight: 600,
        }}>
          Coach 360 Líderes
        </div>

        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 40,
          fontWeight: 300,
          lineHeight: 1.2,
          marginBottom: 20,
        }}>
          Lidera con claridad.<br />
          <span style={{ fontStyle: 'italic', color: '#818cf8' }}>Decide con evidencia.</span>
        </h1>

        <p style={{
          fontSize: 16,
          color: '#c8c8c8',
          lineHeight: 1.6,
          maxWidth: 420,
          margin: '0 auto 40px',
        }}>
          Coaching ejecutivo con IA para jefaturas y líderes. Feedback, delegación, conversaciones difíciles y decisiones estratégicas.
        </p>

        {/* Marco card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          textAlign: 'left',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'Georgia, serif',
            fontSize: 24,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            M
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#818cf8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Tu coach ejecutivo
            </div>
            <div style={{ fontSize: 18, fontFamily: 'Georgia, serif', fontWeight: 500, marginBottom: 4 }}>
              Marco, el Estratega Socrático
            </div>
            <div style={{ fontSize: 12, color: '#a8a8a8', lineHeight: 1.4 }}>
              Confronta con datos y preguntas. Te ayuda a liderar mejor sin improvisar.
            </div>
          </div>
        </div>

        {/* Ley Karin badge */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          borderRadius: 12,
          padding: 14,
          marginBottom: 32,
          fontSize: 12,
          color: '#a8a8a8',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#818cf8' }}>Alineado con Ley Karin.</strong> Marco te enseña a liderar tan bien que no tendrás que temer a la ley — la vas a cumplir naturalmente.
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #818cf8, #6366f1)',
            color: '#fff',
            border: 'none',
            padding: '18px 24px',
            borderRadius: 30,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 12,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity="0.9"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity="0.8"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity="0.7"/>
          </svg>
          {loading ? 'Conectando...' : 'Entrar con Google'}
        </button>

        <p style={{ fontSize: 11, color: '#666', marginTop: 16, lineHeight: 1.5 }}>
          Al entrar aceptas nuestros términos y política de privacidad.
        </p>
      </div>
    </div>
  )
}
