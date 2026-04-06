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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

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

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/dashboard')
  }

  if (mode === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2218 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 16, fontSize: 48 }}>✦</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 42,
          fontWeight: 600,
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          Coach 360<br />Mujer
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          color: 'var(--gold-light)',
          fontStyle: 'italic',
          marginBottom: 48,
        }}>
          Más claridad. Más poder. Más tú.
        </p>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: 48,
        }}>
          Tu espacio personal de crecimiento con coaching inteligente,
          tests de autoconocimiento y herramientas para tomar mejores decisiones.
        </p>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="btn-primary"
            style={{ background: 'var(--gold)', color: '#fff' }}
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
    )
  }

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
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        marginBottom: 8,
      }}>
        {mode === 'register' ? 'Crea tu cuenta' : 'Bienvenida de vuelta'}
      </h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 32, fontSize: 14 }}>
        {mode === 'register' ? 'Tu viaje comienza aquí' : 'Ingresa a tu espacio'}
      </p>

      {/* Botón Google */}
      <div style={{ width: '100%', maxWidth: 360, marginBottom: 24 }}>
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 12,
            border: '2px solid #e0dbd4',
            background: '#fff',
            color: 'var(--text)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'var(--font-body)',
            transition: 'all 0.3s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>
      </div>

      {/* Separador */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
      }}>
        <div style={{ flex: 1, height: 1, background: '#e0dbd4' }} />
        <span style={{ fontSize: 13, color: 'var(--text-light)' }}>o con email</span>
        <div style={{ flex: 1, height: 1, background: '#e0dbd4' }} />
      </div>

      <form
        onSubmit={mode === 'register' ? handleRegister : handleLogin}
        style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {mode === 'register' && (
          <input
            className="input-field"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        )}
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && (
          <p style={{ color: '#c53030', fontSize: 13, textAlign: 'center' }}>{error}</p>
        )}

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? 'Cargando...' : mode === 'register' ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'register' ? 'login' : 'register')
          setError('')
        }}
        style={{
          marginTop: 24,
          background: 'none',
          border: 'none',
          color: 'var(--gold)',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {mode === 'register' ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Créala aquí'}
      </button>
    </div>
  )
}
