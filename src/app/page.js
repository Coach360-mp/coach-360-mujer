'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [mode, setMode] = useState('landing') // landing, login, register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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

    // Update profile with name
    if (data.user) {
      await supabase.from('perfiles').update({ nombre }).eq('id', data.user.id)
    }

    setLoading(false)
    router.push('/dashboard')
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
