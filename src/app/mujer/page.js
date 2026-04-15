'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [mode, setMode] = useState('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    })
    if (error) setError(error.message)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('perfiles').update({ nombre }).eq('id', data.user.id)
    }
    setLoading(false)
    router.push('/onboarding')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false); return }
    setLoading(false)
    router.push('/dashboard')
  }

  if (mode === 'landing') {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff' }}>

        {/* Hero */}
        <div style={{
          minHeight: '100vh',
          backgroundImage: 'linear-gradient(to bottom, rgba(26,26,26,0.3), rgba(26,26,26,0.85)), url(/bg-landing.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Coach 360<br />Mujer
          </h1>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            color: 'var(--gold-light)',
            fontStyle: 'italic',
            marginBottom: 32,
          }}>
            Más claridad. Más poder. Más tú.
          </p>
          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.75)',
            maxWidth: 320,
            lineHeight: 1.7,
            marginBottom: 40,
          }}>
            Coaching profesional con inteligencia artificial.
            Tests, herramientas y acompañamiento personalizado
            para tomar mejores decisiones.
          </p>
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="btn-primary"
              style={{ background: 'var(--gold)', color: '#fff', fontSize: 16, padding: '16px 32px' }}
              onClick={() => setMode('register')}
            >
              Comenzar gratis
            </button>
            <button
              className="btn-secondary"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
              onClick={() => setMode('login')}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>

        {/* Coaches section */}
        <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--warm)', color: 'var(--text)' }}>
          <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Tu equipo</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Tres coaches, una misión</h2>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 32, maxWidth: 320, margin: '0 auto 32px' }}>Cada una con su especialidad, disponibles 24/7 con voz</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360, margin: '0 auto' }}>
            {[
              { name: 'Clara', photo: '/clara.jpg', credential: 'Coach certificada', desc: 'Te escucha con empatía y te hace preguntas poderosas.', plan: 'Plan Gratis' },
              { name: 'Sofía', photo: '/sofia.jpg', credential: 'Especialista en autodesarrollo', desc: 'Te guía con estrategia y te recomienda herramientas.', plan: 'Plan Esencial' },
              { name: 'Victoria', photo: '/victoria.jpg', credential: 'Neurobiología + Mentora', desc: 'Te desafía con ciencia y te da seguimiento personalizado.', plan: 'Plan Premium' },
            ].map(c => (
              <div key={c.name} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', textAlign: 'left' }}>
                <img src={c.photo} alt={c.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{c.name}</h3>
                  <p style={{ fontSize: 11, color: 'var(--gold)', marginBottom: 4 }}>{c.credential}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.4 }}>{c.desc}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4, fontWeight: 600 }}>{c.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', color: 'var(--text)' }}>
          <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Qué incluye</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 32 }}>Todo lo que necesitas</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360, margin: '0 auto' }}>
            {[
              { title: 'Tests de autoconocimiento', desc: '6 tests basados en coaching profesional que revelan patrones que no ves.' },
              { title: 'Herramientas con neurociencia', desc: '9 ejercicios prácticos que integran lo último en neurobiología aplicada.' },
              { title: 'Módulos de crecimiento', desc: '6 módulos de 4 semanas cada uno. Ver, Entender, Decidir, Actuar.' },
              { title: 'Mi Equilibrio', desc: 'Tracking diario de Mente, Cuerpo, Corazón y Espíritu.' },
              { title: 'Coaching con voz', desc: 'Habla con tu coach como si fuera una conversación real.' },
            ].map(f => (
              <div key={f.title} style={{ textAlign: 'left', padding: '16px 0', borderBottom: '1px solid #f0ebe3' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Woman with phone */}
        <div style={{
          padding: '60px 24px',
          backgroundImage: 'linear-gradient(to bottom, rgba(26,26,26,0.6), rgba(26,26,26,0.9)), url(/bg-woman-phone.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          textAlign: 'center',
          color: '#fff',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>Tu coach a las 2am</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 320, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Cuando no puedes dormir de tanto pensar. Cuando necesitas claridad antes de una reunión.
            Cuando quieres cerrar la semana con perspectiva. Tu coach está ahí.
          </p>
          <button
            className="btn-primary"
            style={{ background: 'var(--gold)', color: '#fff', maxWidth: 320, fontSize: 16, padding: '16px 32px' }}
            onClick={() => setMode('register')}
          >
            Comenzar gratis ✦
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: '32px 24px', textAlign: 'center', background: '#1a1a1a', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          <p>Coach 360 Mujer ✦ 2026</p>
          <p style={{ marginTop: 4 }}>Más claridad. Más poder. Más tú.</p>
        </div>
      </div>
    )
  }

  // Login / Register form
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--warm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 24px',
    }}>
      <div style={{ marginBottom: 12, fontSize: 36 }}>✦</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>
        {mode === 'register' ? 'Crea tu cuenta' : 'Bienvenida de vuelta'}
      </h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 32, fontSize: 14 }}>
        {mode === 'register' ? 'Tu viaje comienza aquí' : 'Ingresa a tu espacio'}
      </p>

      <div style={{ width: '100%', maxWidth: 360, marginBottom: 24 }}>
        <button onClick={handleGoogleLogin} style={{
          width: '100%', padding: '14px 24px', borderRadius: 12, border: '2px solid #e0dbd4',
          background: '#fff', color: 'var(--text)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'var(--font-body)', transition: 'all 0.3s ease',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: '#e0dbd4' }} />
        <span style={{ fontSize: 13, color: 'var(--text-light)' }}>o con email</span>
        <div style={{ flex: 1, height: 1, background: '#e0dbd4' }} />
      </div>

      <form onSubmit={mode === 'register' ? handleRegister : handleLogin}
        style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'register' && (
          <input className="input-field" type="text" placeholder="Tu nombre" value={nombre}
            onChange={(e) => setNombre(e.target.value)} required />
        )}
        <input className="input-field" type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="input-field" type="password" placeholder="Contraseña" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        {error && <p style={{ color: '#c53030', fontSize: 13, textAlign: 'center' }}>{error}</p>}
        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Cargando...' : mode === 'register' ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>

      <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}
        style={{ marginTop: 24, background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, cursor: 'pointer' }}>
        {mode === 'register' ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Créala aquí'}
      </button>
    </div>
  )
}
