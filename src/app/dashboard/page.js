'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const tests = [
  { id: 1, titulo: '¿Qué tan clara tienes tu vida hoy?', categoria: 'Claridad', preguntas: 8, free: true },
  { id: 2, titulo: '¿Cómo manejas tus emociones?', categoria: 'Emociones', preguntas: 7, free: true },
  { id: 3, titulo: '¿Qué relación tienes contigo misma?', categoria: 'Autoestima', preguntas: 7, free: false },
  { id: 4, titulo: '¿Cómo te comunicas?', categoria: 'Comunicación', preguntas: 7, free: false },
  { id: 5, titulo: '¿Cómo tomas decisiones?', categoria: 'Decisiones', preguntas: 7, free: false },
  { id: 6, titulo: '¿Qué tan alineada estás?', categoria: 'Propósito', preguntas: 7, free: false },
]

const modulos = [
  { id: 1, titulo: 'Claridad Interior', semanas: 4, desc: 'Aprende a ver lo que no ves', free: true },
  { id: 2, titulo: 'Gestión Emocional', semanas: 4, desc: 'Transforma tus emociones en aliadas', free: true },
  { id: 3, titulo: 'Relaciones Conscientes', semanas: 4, desc: 'Conecta desde la autenticidad', free: false },
  { id: 4, titulo: 'Comunicación Poderosa', semanas: 4, desc: 'Di lo que necesitas decir', free: false },
  { id: 5, titulo: 'Decisiones Alineadas', semanas: 4, desc: 'Decide desde tu centro', free: false },
  { id: 6, titulo: 'Tu Propósito', semanas: 4, desc: 'Encuentra tu dirección', free: false },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [view, setView] = useState('inicio')
  const [loading, setLoading] = useState(true)
  const [chatMsgs, setChatMsgs] = useState([
    { r: 'a', t: 'Hola, bienvenida ✦\n\nSoy Clara, tu coach personal. Estoy aquí para ayudarte a ver con más claridad.\n\n¿Qué te trae hoy?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }
    setUser(user)

    const { data: profile } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setPerfil(profile)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMsgs(prev => [...prev, { r: 'u', t: msg }])
    setChatInput('')
    setTyping(true)

    try {
      const history = chatMsgs.map(m => ({
        role: m.r === 'a' ? 'assistant' : 'user',
        content: m.t,
      }))
      history.push({ role: 'user', content: msg })

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()
      setTyping(false)
      setChatMsgs(prev => [...prev, { r: 'a', t: data.reply || 'Cuéntame más ✦' }])
    } catch {
      setTyping(false)
      setChatMsgs(prev => [...prev, { r: 'a', t: 'Perdona, hubo un error. ¿Puedes intentar de nuevo? ✦' }])
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warm)' }}>
        <p style={{ color: 'var(--text-light)' }}>Cargando ✦</p>
      </div>
    )
  }

  const plan = perfil?.plan_actual || 'free'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm)', paddingBottom: 80 }}>

      {/* === INICIO === */}
      {view === 'inicio' && (
        <div style={{ padding: '48px 20px 20px' }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Hola,</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 24 }}>
            {perfil?.nombre || 'Bienvenida'} ✦
          </h1>

          {/* Quick action */}
          <div className="card" style={{ marginBottom: 20, background: 'var(--dark)', color: '#fff', cursor: 'pointer' }} onClick={() => setView('clara')}>
            <p style={{ fontSize: 13, color: 'var(--gold-light)', marginBottom: 4 }}>Tu coach IA</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', marginBottom: 8 }}>Habla con Clara</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Empieza una conversación de coaching ✦</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ textAlign: 'center', padding: 16 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.racha_dias || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>Racha</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 16 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.nivel || 1}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>Nivel</p>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: 16 }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.puntos_totales || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>Puntos</p>
            </div>
          </div>

          {/* Tests */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Tests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {tests.slice(0, 3).map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.preguntas} preguntas · {t.categoria}</p>
                </div>
                {!t.free && plan === 'free' && (
                  <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                )}
              </div>
            ))}
          </div>

          {/* Módulos */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Tu Camino</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modulos.slice(0, 3).map(m => (
              <div key={m.id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{m.titulo}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{m.desc}</p>
                    <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>{m.semanas} semanas</p>
                  </div>
                  {!m.free && plan === 'free' && (
                    <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === CLARA (Chat) === */}
      {view === 'clara' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '48px 20px 12px', borderBottom: '1px solid #eee', background: '#fff' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Clara ✦</h2>
            <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Tu coach personal con IA</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.r === 'u' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: m.r === 'u' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.r === 'u' ? 'var(--dark)' : '#fff',
                color: m.r === 'u' ? '#fff' : 'var(--text)',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                boxShadow: m.r === 'a' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}>
                {m.t}
              </div>
            ))}
            {typing && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: '#fff',
                color: 'var(--text-light)',
                fontSize: 14,
              }}>
                Clara está pensando ✦
              </div>
            )}
          </div>

          <div style={{
            padding: '12px 20px 32px',
            background: '#fff',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: 8,
          }}>
            <input
              className="input-field"
              placeholder="Escribe aquí..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1 }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: 'var(--dark)',
                color: '#fff',
                fontSize: 16,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* === TESTS === */}
      {view === 'tests' && (
        <div style={{ padding: '48px 20px 20px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8 }}>Tests ✦</h1>
          <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24 }}>Descubre más sobre ti misma</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tests.map(t => (
              <div key={t.id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.preguntas} preguntas · {t.categoria}</p>
                  </div>
                  {!t.free && plan === 'free' ? (
                    <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                  ) : (
                    <span style={{ fontSize: 18, color: 'var(--gold)' }}>→</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === PERFIL === */}
      {view === 'perfil' && (
        <div style={{ padding: '48px 20px 20px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 24 }}>Tu Perfil ✦</h1>

          <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--gold)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontFamily: 'var(--font-display)',
              margin: '0 auto 12px',
            }}>
              {(perfil?.nombre || 'U')[0].toUpperCase()}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{perfil?.nombre || 'Usuaria'}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{user?.email}</p>
            <p style={{
              display: 'inline-block', marginTop: 8,
              fontSize: 12, background: 'var(--warm-dark)',
              padding: '4px 12px', borderRadius: 8,
              color: 'var(--gold)', fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              Plan {plan}
            </p>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.racha_dias || 0}</p>
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Racha actual</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.mejor_racha || 0}</p>
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Mejor racha</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.nivel || 1}</p>
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Nivel</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{perfil?.puntos_totales || 0}</p>
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Puntos</p>
              </div>
            </div>
          </div>

          <button className="btn-secondary" onClick={handleLogout} style={{ marginTop: 8 }}>
            Cerrar sesión
          </button>
        </div>
      )}

      {/* === BOTTOM NAV === */}
      {view !== 'clara' && (
        <div className="bottom-nav">
          <button className={`nav-item ${view === 'inicio' ? 'active' : ''}`} onClick={() => setView('inicio')}>
            <span className="nav-icon">⬡</span>
            Inicio
          </button>
          <button className={`nav-item ${view === 'tests' ? 'active' : ''}`} onClick={() => setView('tests')}>
            <span className="nav-icon">◇</span>
            Tests
          </button>
          <button className={`nav-item ${view === 'clara' ? 'active' : ''}`} onClick={() => setView('clara')}>
            <span className="nav-icon">✦</span>
            Clara
          </button>
          <button className={`nav-item ${view === 'camino' ? 'active' : ''}`} onClick={() => setView('camino')}>
            <span className="nav-icon">◎</span>
            Camino
          </button>
          <button className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>
            <span className="nav-icon">○</span>
            Yo
          </button>
        </div>
      )}
    </div>
  )
}
