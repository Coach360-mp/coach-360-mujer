'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const PLANTILLAS = [
  {
    id: 'volcado_mental',
    nombre: 'Volcado mental',
    desc: 'Todo lo que está en tu cabeza, sin orden ni filtro.',
    duracion: '5-10 min',
    iconBg: '#F5EFE6',
    iconColor: '#C9A96E',
  },
  {
    id: 'tres_cosas_hoy',
    nombre: '3 cosas hoy',
    desc: 'Qué pasó, qué sentiste, qué aprendiste.',
    duracion: '5 min',
    iconBg: '#E1F5EE',
    iconColor: '#1D9E75',
  },
  {
    id: 'semana_5_frases',
    nombre: 'Mi semana en 5 frases',
    desc: 'Cierre semanal. Cinco frases para soltar la semana.',
    duracion: '5 min',
    iconBg: '#EEEDFE',
    iconColor: '#534AB7',
  },
]

function MicButton({ onTranscript, size = 30 }) {
  const [grabando, setGrabando] = useState(false)
  const recRef = useRef(null)

  const toggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Usa Chrome o Safari para dictar por voz.')
      return
    }
    if (grabando) { recRef.current?.stop(); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recRef.current = new SR()
    recRef.current.lang = 'es-CL'
    recRef.current.continuous = true
    recRef.current.interimResults = true
    recRef.current.onresult = (e) => {
      let t = ''
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript
      onTranscript(t)
    }
    recRef.current.onend = () => setGrabando(false)
    recRef.current.start()
    setGrabando(true)
  }

  return (
    <button onClick={toggle} style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: grabando ? '#C9A96E' : '#2A2520', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <rect x="4" y="1" width="6" height="8" rx="3" fill="#FAFAF7" />
        <path d="M2 7c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <line x1="7" y1="12" x2="7" y2="14" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function PlantillaIcon({ plantilla }) {
  const icons = {
    volcado_mental: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="3" width="14" height="16" rx="2" stroke={plantilla.iconColor} strokeWidth="1.5" />
        <line x1="7" y1="8" x2="15" y2="8" stroke={plantilla.iconColor} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="11" x2="15" y2="11" stroke={plantilla.iconColor} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="14" x2="11" y2="14" stroke={plantilla.iconColor} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    tres_cosas_hoy: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke={plantilla.iconColor} strokeWidth="1.5" />
        <line x1="11" y1="7" x2="11" y2="11" stroke={plantilla.iconColor} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="14" r="1" fill={plantilla.iconColor} />
      </svg>
    ),
    semana_5_frases: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="12" rx="2" stroke={plantilla.iconColor} strokeWidth="1.5" />
        <line x1="7" y1="9" x2="15" y2="9" stroke={plantilla.iconColor} strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="12" x2="13" y2="12" stroke={plantilla.iconColor} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  }
  return (
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: plantilla.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icons[plantilla.id]}
    </div>
  )
}

function VolcadoMental({ onGuardar }) {
  const [texto, setTexto] = useState('')
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.3 }}>¿Qué está en tu cabeza ahora mismo?</div>
      <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '14px' }}>No hay estructura. Escribe lo que sea.</div>
      <div style={{ position: 'relative', marginBottom: '6px' }}>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Empieza aquí..." style={{ width: '100%', padding: '12px 48px 12px 14px', borderRadius: '12px', border: '1.5px solid rgba(42,37,32,0.2)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', resize: 'none', height: '180px', boxSizing: 'border-box', lineHeight: 1.6 }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
          <MicButton onTranscript={setTexto} />
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#9A8F84', marginBottom: '20px' }}>Cuando termines, Clara puede leer esto y hacerte una pregunta.</div>
      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => onGuardar({ texto })}>
        Compartir con Clara →
      </button>
    </div>
  )
}

function TresCosasHoy({ onGuardar }) {
  const [paso, setPaso] = useState('')
  const [sentiste, setSentiste] = useState('')
  const [aprendiste, setAprendiste] = useState('')

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '6px' }}>01 · qué pasó</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '16px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.3 }}>¿Qué fue lo más significativo de hoy?</div>
        <div style={{ position: 'relative' }}>
          <textarea value={paso} onChange={e => setPaso(e.target.value)} placeholder="Una sola cosa. La primera que venga." style={{ width: '100%', padding: '12px 48px 12px 14px', borderRadius: '12px', border: '1.5px solid rgba(42,37,32,0.2)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', resize: 'none', height: '80px', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}><MicButton onTranscript={setPaso} /></div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '6px' }}>02 · qué sentiste</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '16px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.3 }}>¿Qué emoción estuvo más presente?</div>
        <div style={{ position: 'relative' }}>
          <textarea value={sentiste} onChange={e => setSentiste(e.target.value)} placeholder="Sin juzgar lo que sientes." style={{ width: '100%', padding: '12px 48px 12px 14px', borderRadius: '12px', border: '1.5px solid rgba(42,37,32,0.2)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', resize: 'none', height: '80px', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}><MicButton onTranscript={setSentiste} /></div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '6px' }}>03 · qué aprendiste</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '16px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.3 }}>¿Qué te llevas de hoy?</div>
        <div style={{ position: 'relative' }}>
          <textarea value={aprendiste} onChange={e => setAprendiste(e.target.value)} placeholder="Puede ser pequeño." style={{ width: '100%', padding: '12px 48px 12px 14px', borderRadius: '12px', border: '1.5px solid rgba(42,37,32,0.2)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', resize: 'none', height: '80px', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}><MicButton onTranscript={setAprendiste} /></div>
        </div>
      </div>

      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '16px' }} onClick={() => onGuardar({ paso, sentiste, aprendiste })}>
        Guardar entrada →
      </button>

      <div style={{ background: '#F5EFE6', borderRadius: '12px', padding: '14px 16px', borderLeft: '3px solid #C9A96E' }}>
        <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '6px' }}>Clara puede ver esto</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '13px', color: '#2A2520', lineHeight: 1.6 }}>"¿Quieres que hablemos de lo que escribiste?"</div>
      </div>
    </div>
  )
}

function SemanaCincoFrases({ onGuardar }) {
  const [frases, setFrases] = useState(['', '', '', '', ''])
  const set = (i, v) => setFrases(prev => prev.map((x, j) => j === i ? v : x))

  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.3 }}>Cinco frases para soltar la semana.</div>
      <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '18px' }}>Una por línea. Sin pensar demasiado.</div>
      {frases.map((val, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', color: '#C9A96E', fontWeight: 700, minWidth: '20px' }}>{i + 1}</div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input value={val} onChange={e => set(i, e.target.value)} placeholder={i === 0 ? 'Esta semana...' : ''} style={{ width: '100%', padding: '11px 44px 11px 12px', borderRadius: '10px', border: '1.5px solid rgba(42,37,32,0.15)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
              <MicButton onTranscript={v => set(i, v)} size={24} />
            </div>
          </div>
        </div>
      ))}
      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '8px' }} onClick={() => onGuardar({ frases })}>
        Cerrar semana →
      </button>
    </div>
  )
}

export default function JournalingPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [plantillaActiva, setPlantillaActiva] = useState(null)
  const [completado, setCompletado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/holaclara/auth')
      else { setUsuario(user); setCargando(false) }
    })
  }, [])

  const guardar = async (datos) => {
    if (usuario && plantillaActiva) {
      await supabase.from('journaling_entradas').insert({
        user_id: usuario.id,
        plantilla_id: plantillaActiva.id,
        datos,
        fecha: new Date().toISOString().split('T')[0],
      }).catch(() => {})
    }
    setCompletado(true)
  }

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    container: { maxWidth: '420px', margin: '0 auto' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    navLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' },
    body: { padding: '24px 20px 48px' },
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  if (completado) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ ...s.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none"><polyline points="2,12 10,20 26,4" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '8px' }}>Entrada guardada.</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '32px' }}>escribir también es volver a ti</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
            <button style={{ padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => router.push('/holaclara/chat')}>
              Hablar con Clara →
            </button>
            <button style={{ padding: '13px', borderRadius: '12px', background: 'transparent', color: '#2A2520', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: '1px solid rgba(42,37,32,0.2)', cursor: 'pointer' }} onClick={() => { setCompletado(false); setPlantillaActiva(null) }}>
              Nueva entrada
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <nav style={s.nav}>
            <div>
              <div style={s.logoText}>Clara</div>
              <div style={s.goldLine} />
            </div>
            <div style={s.navLabel}>{plantillaActiva ? plantillaActiva.nombre : 'Journaling'}</div>
            <button style={s.backBtn} onClick={() => plantillaActiva ? setPlantillaActiva(null) : router.push('/holaclara/chat')}>
              ← volver
            </button>
          </nav>

          <div style={s.body}>
            {!plantillaActiva ? (
              <>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Escribe</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '4px' }}>Tu diario</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>sin filtro, sin juicio</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {PLANTILLAS.map(p => (
                    <div key={p.id} onClick={() => setPlantillaActiva(p)} style={{ background: '#fff', border: '0.5px solid rgba(42,37,32,0.15)', borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <PlantillaIcon plantilla={p} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#2A2520', marginBottom: '3px' }}>{p.nombre}</div>
                        <div style={{ fontSize: '12px', color: '#6B6057', lineHeight: 1.4, marginBottom: '4px' }}>{p.desc}</div>
                        <div style={{ fontSize: '10px', color: '#C9A96E', fontWeight: 700 }}>{p.duracion} · Free</div>
                      </div>
                      <div style={{ fontSize: '18px', color: '#9A8F84', fontWeight: 700, paddingTop: '2px' }}>›</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>{plantillaActiva.duracion}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '24px', color: '#2A2520', marginBottom: '24px', lineHeight: 1.2 }}>{plantillaActiva.nombre}</div>
                {plantillaActiva.id === 'volcado_mental' && <VolcadoMental onGuardar={guardar} />}
                {plantillaActiva.id === 'tres_cosas_hoy' && <TresCosasHoy onGuardar={guardar} />}
                {plantillaActiva.id === 'semana_5_frases' && <SemanaCincoFrases onGuardar={guardar} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
