'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const LIMITES = { free: 30, esencial: 400, profundo: 1000 }

const PRIMER_MENSAJE = {
  cumplidora_cansada: '¿Cuándo fue la última vez que paraste de verdad? No para descansar antes de volver. Para parar.',
  cuida_a_todos: '¿Qué quisiste tú esta semana? No lo que diste. Lo que quisiste.',
  no_se_reconoce: '¿Cuándo fue la última vez que hiciste algo solo porque querías?',
  escucha_el_cuerpo: '¿Qué lleva tiempo diciéndote tu cuerpo que aún no has escuchado?',
  la_que_busca: '¿Qué es lo que más quieres construir ahora mismo?',
  default: '¿Qué te trajo aquí hoy?'
}

export default function Chat() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [limitAlcanzado, setLimitAlcanzado] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    inicializar()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function inicializar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/holaclara/auth'); return }

    setUsuario(session.user)

    const { data: p } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (p) {
      setPerfil(p)
      const limite = LIMITES[p.plan_actual] || 30
      if (p.mensajes_usados_mes >= limite) setLimitAlcanzado(true)
    }

    const primerMsg = PRIMER_MENSAJE[p?.perfil_test_entrada] || PRIMER_MENSAJE.default
    setMensajes([{ rol: 'clara', texto: primerMsg }])
  }

  async function enviar() {
    if (!input.trim() || cargando || limitAlcanzado) return
    const texto = input.trim()
    setInput('')
    setMensajes(prev => [...prev, { rol: 'usuaria', texto }])
    setCargando(true)

    try {
      const historial = mensajes.map(m => ({
        role: m.rol === 'clara' ? 'assistant' : 'user',
        content: m.texto
      }))

      const res = await fetch('/api/holaclara/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: texto,
          historial,
          perfil: perfil?.perfil_test_entrada || 'la_que_busca',
          userId: usuario?.id
        })
      })

      const data = await res.json()
      setMensajes(prev => [...prev, { rol: 'clara', texto: data.respuesta }])

      if (data.limiteAlcanzado) setLimitAlcanzado(true)

    } catch (e) {
      setMensajes(prev => [...prev, { rol: 'clara', texto: 'Algo salió mal. ¿Lo intentamos de nuevo?' }])
    }
    setCargando(false)
  }

  return (
    <div style={{ height: '100vh', background: '#FAFAF7', fontFamily: 'Jost, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ padding: '12px 20px', borderBottom: '0.5px solid #F0EBE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '8px', color: '#9A8F84', letterSpacing: '0.05em' }}>Hola</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#2A2520', lineHeight: 1 }}>Clara</div>
          <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {perfil && (
            <span style={{ fontSize: '10px', color: '#9A8F84', background: '#F5EFE6', padding: '3px 10px', borderRadius: '20px' }}>
              {perfil.mensajes_usados_mes || 0} / {LIMITES[perfil.plan_actual] || 30} mensajes
            </span>
          )}
        </div>
      </nav>

      {/* MENSAJES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {mensajes.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.rol === 'usuaria' ? 'flex-end' : 'flex-start',
            marginBottom: '12px',
            alignItems: 'flex-end',
            gap: '8px'
          }}>
            {m.rol === 'clara' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#fff', marginBottom: '2px' }}>c</div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: m.rol === 'clara' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
              background: m.rol === 'clara' ? '#fff' : '#2A2520',
              color: m.rol === 'clara' ? '#2A2520' : '#FAFAF7',
              fontSize: '14px',
              fontWeight: 300,
              lineHeight: 1.6,
              border: m.rol === 'clara' ? '0.5px solid #E8E4DC' : 'none',
              fontFamily: m.rol === 'clara' ? 'Georgia, serif' : 'Jost, sans-serif',
              fontStyle: m.rol === 'clara' ? 'italic' : 'normal'
            }}>
              {m.texto}
            </div>
          </div>
        ))}

        {cargando && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#fff' }}>c</div>
            <div style={{ padding: '12px 16px', background: '#fff', border: '0.5px solid #E8E4DC', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', animation: `bounce 1s ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {limitAlcanzado && (
          <div style={{ background: '#FBF7F0', border: '0.5px solid #E8D8BC', borderRadius: '10px', padding: '14px', margin: '12px 0', fontSize: '13px', color: '#6B6057', lineHeight: 1.6 }}>
            Llegamos al límite de este mes. Si quieres seguir, puedes subir tu plan desde{' '}
            <span onClick={() => router.push('/holaclara/cuenta')} style={{ color: '#C9A96E', cursor: 'pointer', textDecoration: 'underline' }}>tu cuenta</span>.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: '12px 20px', borderTop: '0.5px solid #F0EBE3', background: '#FAFAF7', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
            placeholder={limitAlcanzado ? 'Límite alcanzado este mes' : 'Escríbele a Clara...'}
            disabled={limitAlcanzado}
            rows={1}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px',
              border: '0.5px solid #E8E4DC', background: '#fff',
              fontSize: '14px', fontFamily: 'Jost, sans-serif', fontWeight: 300,
              color: '#2A2520', resize: 'none', outline: 'none',
              lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto'
            }}
          />
          <button onClick={enviar} disabled={!input.trim() || cargando || limitAlcanzado} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: input.trim() && !cargando ? '#2A2520' : '#EDE8DF',
            border: 'none', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#FAFAF7' : '#B4AFA9'} strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0) }
          30% { transform: translateY(-6px) }
        }
      `}</style>
    </div>
  )
}
