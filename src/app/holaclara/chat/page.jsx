'use client'
import { useState, useEffect, useRef } from 'react'
import TabBar from '../components/TabBar'
import { useRouter } from 'next/navigation'
import TourGuiado from '../components/TourGuiado'
import { useTour } from '../components/useTour'
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
  const { mostrarTour, completarTour } = useTour()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [limitAlcanzado, setLimitAlcanzado] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const recognitionRef = useRef(null)
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

    // Leer mensaje pre-cargado desde rituales/journaling
    const msgParam = new URLSearchParams(window.location.search).get('msg')
    if (msgParam) {
      setInput(decodeURIComponent(msgParam))
    }
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

  function toggleMic() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Usa Chrome o Safari para dictar por voz.')
      return
    }
    if (grabando) {
      recognitionRef.current?.stop()
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SR()
    recognitionRef.current.lang = 'es-CL'
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      setInput(t)
    }
    recognitionRef.current.onend = () => setGrabando(false)
    recognitionRef.current.start()
    setGrabando(true)
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
          <div style={{ background: '#2A2520', borderRadius: '16px', padding: '20px', margin: '12px 0' }}>
            <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '8px' }}>Llegaste al límite del plan Gratis</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#FAFAF7', marginBottom: '8px', lineHeight: 1.3 }}>La conversación más importante es la que sigue.</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '16px' }}>Con el plan Esencial tienes 400 mensajes al mes, acceso a pausas guiadas y programas multi-día.</div>
            <button onClick={() => router.push('/holaclara/planes')} style={{ width: '100%', padding: '13px', borderRadius: '10px', background: '#C9A96E', color: '#2A2520', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '8px' }}>
              Ver planes →
            </button>
            <button onClick={() => router.push('/holaclara/conocerme')} style={{ width: '100%', padding: '11px', borderRadius: '10px', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', border: '0.5px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              Mientras tanto, explorar rituales y journaling
            </button>
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
          <button onClick={toggleMic} disabled={limitAlcanzado} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: grabando ? '#C9A96E' : '#EDE8DF',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.2s'
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="1" width="6" height="8" rx="3" fill={grabando ? '#fff' : '#888'} />
              <path d="M2 7c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke={grabando ? '#fff' : '#888'} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <line x1="7" y1="12" x2="7" y2="14" stroke={grabando ? '#fff' : '#888'} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
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
      <TabBar />
    </div>
  )
}
