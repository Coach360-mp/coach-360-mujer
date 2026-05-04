'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function Auth() {
  const router = useRouter()
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const [modo, setModo] = useState('registro') // registro | login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  async function guardarPerfil(userId) {
    const data = localStorage.getItem('hc_resultado_test')
    if (!data) return
    const { perfil, puntajes } = JSON.parse(data)
    await supabase.from('perfiles').upsert({
      id: userId,
      perfil_test_entrada: perfil,
      puntaje_t: puntajes.T || 0,
      puntaje_v: puntajes.V || 0,
      puntaje_i: puntajes.I || 0,
      puntaje_c: puntajes.C || 0,
      vertical: 'mujer',
      plan_actual: 'free',
      mensajes_usados_mes: 0,
      fecha_reset_mensajes: new Date().toISOString().split('T')[0]
    })
    localStorage.removeItem('hc_resultado_test')
  }

  async function registrar() {
    setCargando(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })
    if (error) { setError(error.message); setCargando(false); return }
    if (data.user) await guardarPerfil(data.user.id)
    setExito(true)
    setCargando(false)
  }

  async function iniciarSesion() {
    setCargando(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setCargando(false); return }
    router.push('/holaclara/chat')
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/holaclara/chat` }
    })
  }

  const s = {
    page: { minHeight: '100vh', background: '#FAFAF7', fontFamily: 'Jost, sans-serif' },
    nav: { padding: '14px 28px', borderBottom: '0.5px solid #F0EBE3' },
    hola: { fontSize: '9px', color: '#9A8F84', letterSpacing: '0.05em' },
    clara: { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#2A2520', lineHeight: 1 },
    line: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    slogan: { fontSize: '6px', letterSpacing: '0.1em', color: '#9A8F84', textTransform: 'uppercase' },
    main: { padding: '32px 28px', maxWidth: '400px', margin: '0 auto' },
    title: { fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '24px', fontWeight: 300, color: '#2A2520', marginBottom: '6px' },
    sub: { fontSize: '13px', color: '#9A8F84', fontWeight: 300, marginBottom: '28px' },
    label: { fontSize: '11px', color: '#6B6057', fontWeight: 500, display: 'block', marginBottom: '6px' },
    input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '0.5px solid #E8E4DC', background: '#fff', fontSize: '13px', fontFamily: 'Jost, sans-serif', color: '#2A2520', outline: 'none', marginBottom: '14px' },
    btnPrimary: { width: '100%', padding: '13px', borderRadius: '10px', background: '#2A2520', color: '#FAFAF7', fontSize: '13px', fontFamily: 'Jost, sans-serif', fontWeight: 500, border: 'none', cursor: 'pointer', marginBottom: '10px' },
    btnGoogle: { width: '100%', padding: '12px', borderRadius: '10px', background: '#fff', color: '#2A2520', fontSize: '13px', fontFamily: 'Jost, sans-serif', fontWeight: 400, border: '0.5px solid #E8E4DC', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' },
    divLine: { flex: 1, height: '0.5px', background: '#E8E4DC' },
    divText: { fontSize: '11px', color: '#B4AFA9' },
    toggle: { textAlign: 'center', fontSize: '12px', color: '#9A8F84' },
    toggleBtn: { color: '#C9A96E', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', textDecoration: 'underline' },
    error: { background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#A32D2D', marginBottom: '14px' },
    exito: { background: '#EAF3DE', border: '0.5px solid #C0DD97', borderRadius: '10px', padding: '16px', fontSize: '13px', color: '#27500A', lineHeight: 1.6 }
  }

  if (exito) return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.hola}>Hola</div>
        <div style={s.clara}>Clara</div>
        <div style={s.line} />
        <div style={s.slogan}>Para la que quiere más y necesita parar.</div>
      </nav>
      <div style={s.main}>
        <div style={s.exito}>
          <strong>Revisa tu email.</strong><br />
          Te enviamos un link de confirmación a <strong>{email}</strong>.<br /><br />
          Cuando lo confirmes, Clara te estará esperando.
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.hola}>Hola</div>
        <div style={s.clara}>Clara</div>
        <div style={s.line} />
        <div style={s.slogan}>Para la que quiere más y necesita parar.</div>
      </nav>
      <div style={s.main}>
        <h1 style={s.title}>{modo === 'registro' ? 'Crea tu cuenta' : 'Bienvenida de vuelta'}</h1>
        <p style={s.sub}>{modo === 'registro' ? 'Clara ya conoce tu perfil. Solo falta saber tu nombre.' : 'Clara recuerda todo lo que hablaron.'}</p>

        <button onClick={loginGoogle} style={s.btnGoogle}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar con Google
        </button>

        <div style={s.divider}>
          <div style={s.divLine} />
          <span style={s.divText}>o con email</span>
          <div style={s.divLine} />
        </div>

        {error && <div style={s.error}>{error}</div>}

        {modo === 'registro' && (
          <>
            <label style={s.label}>¿Cómo te llamamos?</label>
            <input style={s.input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
          </>
        )}

        <label style={s.label}>Email</label>
        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />

        <label style={s.label}>Contraseña</label>
        <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

        <button onClick={modo === 'registro' ? registrar : iniciarSesion} style={s.btnPrimary} disabled={cargando}>
          {cargando ? 'Un momento...' : modo === 'registro' ? 'Crear cuenta →' : 'Entrar →'}
        </button>

        <div style={s.toggle}>
          {modo === 'registro' ? '¿Ya tienes cuenta? ' : '¿Primera vez? '}
          <button style={s.toggleBtn} onClick={() => setModo(modo === 'registro' ? 'login' : 'registro')}>
            {modo === 'registro' ? 'Inicia sesión' : 'Créala gratis'}
          </button>
        </div>
      </div>
    </div>
  )
}
