'use client'
import TabBar from '../components/TabBar'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const RITUALES = [
  {
    id: 'respiraciones',
    nombre: '3 respiraciones',
    tipo: 'breathing',
    duracion: '3 min',
    categoria: 'espiritu',
    iconBg: '#F5EFE6',
    iconColor: '#C9A96E',
    descripcion: 'Tres ciclos de respiración para volver al cuerpo.',
  },
  {
    id: 'checkin',
    nombre: 'Check-in 1 minuto',
    tipo: 'checkin',
    duracion: '1 min',
    categoria: 'mente',
    iconBg: '#E1F5EE',
    iconColor: '#1D9E75',
    descripcion: '¿Cómo llegas a este momento?',
    opciones: ['Con energía y foco', 'Cansada pero presente', 'Dispersa, necesito parar', 'En piloto automático'],
  },
  {
    id: 'pausa_mediodia',
    nombre: 'Pausa de mediodía',
    tipo: 'timer',
    duracion: '3 min',
    categoria: 'cuerpo',
    iconBg: '#E6F1FB',
    iconColor: '#185FA5',
    descripcion: 'Tres minutos para ti, sin hacer nada más.',
    segundos: 180,
    instrucciones: [
      'Cierra los ojos o mira un punto fijo',
      'Respira despacio, sin contar',
      'No hagas nada más hasta que termine',
    ],
  },
  {
    id: 'gratitud',
    nombre: '3 cosas por las que estoy',
    tipo: 'gratitude',
    duracion: '3 min',
    categoria: 'corazon',
    iconBg: '#EEEDFE',
    iconColor: '#534AB7',
    descripcion: 'Hoy estoy agradecida por...',
  },
  {
    id: 'soltar',
    nombre: 'Lo que quiero soltar hoy',
    tipo: 'textprompt',
    duracion: '5 min',
    categoria: 'corazon',
    iconBg: '#FAECE7',
    iconColor: '#993C1D',
    pregunta: '¿Qué llevas cargando hoy que ya no necesitas?',
    hint: 'Solo tú puedes leer esto.',
  },
  {
    id: 'grounding',
    nombre: '5-4-3-2-1 sensorial',
    tipo: 'grounding',
    duracion: '5 min',
    categoria: 'cuerpo',
    iconBg: '#F1EFE8',
    iconColor: '#5F5E5A',
    pasos: [
      { num: 5, q: 'Cosas que puedes ver', hint: 'Mira alrededor. Nómbralas.' },
      { num: 4, q: 'Cosas que puedes tocar', hint: 'Siente las texturas.' },
      { num: 3, q: 'Cosas que puedes escuchar', hint: 'Cierra los ojos si quieres.' },
      { num: 2, q: 'Cosas que puedes oler', hint: 'Respira profundo.' },
      { num: 1, q: 'Cosa que puedes saborear', hint: 'Ya estás aquí.' },
    ],
  },
  {
    id: 'manana',
    nombre: 'Antes de comer',
    tipo: 'checkin',
    duracion: '1 min',
    categoria: 'cuerpo',
    iconBg: '#E1F5EE',
    iconColor: '#1D9E75',
    descripcion: '¿Cómo está tu cuerpo ahora mismo?',
    opciones: ['Con hambre real', 'Comiendo por ansiedad', 'En modo automático', 'Presente y lista'],
  },
  {
    id: 'cierre',
    nombre: 'Cierre de día rápido',
    tipo: 'textprompt',
    duracion: '3 min',
    categoria: 'mente',
    iconBg: '#FAECE7',
    iconColor: '#993C1D',
    pregunta: '¿Qué fue lo más significativo de hoy?',
    hint: 'Una sola cosa. La primera que venga.',
  },
  {
    id: 'termostato',
    nombre: 'Termostato emocional',
    tipo: 'checkin',
    duracion: '1 min',
    categoria: 'corazon',
    iconBg: '#EEEDFE',
    iconColor: '#534AB7',
    descripcion: '¿En qué temperatura emocional estás?',
    opciones: ['Fría y distante', 'Templada, ok', 'Cálida y abierta', 'Sobrecalentada'],
  },
  {
    id: 'recordar',
    nombre: 'Recordar quién soy',
    tipo: 'textprompt',
    duracion: '3 min',
    categoria: 'espiritu',
    iconBg: '#F5EFE6',
    iconColor: '#C9A96E',
    pregunta: '¿Qué sé de mí misma que a veces olvido?',
    hint: 'Lo que ya sabes, aunque no siempre lo recuerdes.',
  },
]

function RitualIcon({ ritual }) {
  const icons = {
    breathing: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={ritual.iconColor} strokeWidth="1.5" /><circle cx="10" cy="10" r="3" fill={ritual.iconColor} opacity="0.6" /></svg>,
    checkin: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="3" stroke={ritual.iconColor} strokeWidth="1.5" /><line x1="10" y1="7" x2="10" y2="13" stroke={ritual.iconColor} strokeWidth="1.5" strokeLinecap="round" /><line x1="7" y1="10" x2="13" y2="10" stroke={ritual.iconColor} strokeWidth="1.5" strokeLinecap="round" /></svg>,
    timer: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={ritual.iconColor} strokeWidth="1.5" /><line x1="10" y1="7" x2="10" y2="11" stroke={ritual.iconColor} strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="13.5" r="0.8" fill={ritual.iconColor} /></svg>,
    gratitude: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3.5 L11.8 8.5 L17 8.5 L12.8 11.5 L14.3 16.5 L10 13.5 L5.7 16.5 L7.2 11.5 L3 8.5 L8.2 8.5 Z" stroke={ritual.iconColor} strokeWidth="1.5" fill="none" strokeLinejoin="round" /></svg>,
    textprompt: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5 L10 11 L15 7.5" stroke={ritual.iconColor} strokeWidth="1.5" strokeLinecap="round" /><rect x="4" y="6" width="12" height="9" rx="2" stroke={ritual.iconColor} strokeWidth="1.5" /></svg>,
    grounding: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" fill={ritual.iconColor} /><circle cx="10" cy="4" r="1.5" fill={ritual.iconColor} opacity="0.5" /><circle cx="10" cy="16" r="1.5" fill={ritual.iconColor} opacity="0.5" /><circle cx="4" cy="10" r="1.5" fill={ritual.iconColor} opacity="0.5" /><circle cx="16" cy="10" r="1.5" fill={ritual.iconColor} opacity="0.5" /></svg>,
  }
  return <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: ritual.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons[ritual.tipo]}</div>
}

function MicButton({ onTranscript, style }) {
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
    <button onClick={toggle} style={{ width: '30px', height: '30px', borderRadius: '50%', background: grabando ? '#C9A96E' : '#2A2520', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s', ...style }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="4" y="1" width="6" height="8" rx="3" fill="#FAFAF7" />
        <path d="M2 7c0 2.76 2.24 5 5 5s5-2.24 5-5" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <line x1="7" y1="12" x2="7" y2="14" stroke="#FAFAF7" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function BreathingRitual({ ritual, onComplete }) {
  const fases = [
    { label: 'inhala...', dur: 4 },
    { label: 'mantén...', dur: 4 },
    { label: 'exhala...', dur: 4 },
  ]
  const [activo, setActivo] = useState(false)
  const [faseIdx, setFaseIdx] = useState(0)
  const [ciclo, setCiclo] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!activo) return
    let fi = 0
    const avanzar = () => {
      fi = (fi + 1) % 3
      setFaseIdx(fi)
      if (fi === 0) setCiclo(c => c + 1)
    }
    intervalRef.current = setInterval(avanzar, 4000)
    return () => clearInterval(intervalRef.current)
  }, [activo])

  useEffect(() => {
    if (ciclo >= 3) { clearInterval(intervalRef.current); setActivo(false); onComplete() }
  }, [ciclo])

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(201,169,110,0.12)', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', transition: 'transform 4s ease-in-out', transform: activo && faseIdx === 0 ? 'scale(1.2)' : 'scale(1)' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="16" stroke="#C9A96E" strokeWidth="1.5" opacity="0.4" />
          <circle cx="24" cy="24" r="7" fill="#C9A96E" opacity="0.6" />
        </svg>
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '6px' }}>
        {activo ? fases[faseIdx].label : 'lista para comenzar'}
      </div>
      <div style={{ fontSize: '11px', color: '#C9A96E', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
        {activo ? `ciclo ${ciclo + 1} de 3` : '4 · 4 · 4'}
      </div>
      {!activo && <button style={{ padding: '12px 32px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '16px' }} onClick={() => { setActivo(true); setFaseIdx(0); setCiclo(0) }}>Comenzar</button>}
    </div>
  )
}

function TimerRitual({ ritual, onComplete }) {
  const [segundos, setSegundos] = useState(ritual.segundos || 180)
  const [activo, setActivo] = useState(false)
  const [listo, setListo] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!activo) return
    intervalRef.current = setInterval(() => {
      setSegundos(s => {
        if (s <= 1) { clearInterval(intervalRef.current); setActivo(false); setListo(true); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [activo])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '60px', color: listo ? '#5DCAA5' : '#C9A96E', lineHeight: 1, marginBottom: '4px' }}>{fmt(segundos)}</div>
        <div style={{ fontSize: '11px', color: '#6B6057', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '20px' }}>minutos de pausa</div>
      </div>
      {ritual.instrucciones && (
        <div style={{ background: '#F5EFE6', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', borderLeft: '3px solid #C9A96E' }}>
          <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Mientras suena el tiempo</div>
          {ritual.instrucciones.map((inst, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12px', color: '#2A2520', marginBottom: i < ritual.instrucciones.length - 1 ? '6px' : 0, lineHeight: 1.4 }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, marginTop: '5px' }} />
              <span>{inst}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ textAlign: 'center' }}>
        {!listo
          ? <button style={{ padding: '12px 32px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => setActivo(a => !a)}>
              {activo ? 'Pausar' : 'Iniciar pausa'}
            </button>
          : <button style={{ padding: '12px 32px', borderRadius: '12px', background: '#5DCAA5', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={onComplete}>
              Completado ✓
            </button>
        }
      </div>
    </div>
  )
}

function CheckinRitual({ ritual, onComplete }) {
  const [sel, setSel] = useState(null)
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '20px', lineHeight: 1.3 }}>{ritual.descripcion}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {ritual.opciones.map((op, i) => (
          <button key={i} onClick={() => setSel(i)} style={{ padding: '14px 16px', borderRadius: '12px', border: sel === i ? '2px solid #C9A96E' : '1.5px solid #C4BDB5', background: sel === i ? '#FBF5EC' : '#FFFFFF', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600, color: '#2A2520', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4 }}>
            {op}
          </button>
        ))}
      </div>
      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: sel !== null ? '#2A2520' : 'rgba(42,37,32,0.3)', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: sel !== null ? 'pointer' : 'default' }} onClick={() => sel !== null && onComplete({ respuesta: ritual.opciones[sel] })} disabled={sel === null}>
        Continuar →
      </button>
    </div>
  )
}

function TextPromptRitual({ ritual, onComplete }) {
  const [texto, setTexto] = useState('')
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '16px', lineHeight: 1.3 }}>{ritual.pregunta}</div>
      <div style={{ position: 'relative', marginBottom: '6px' }}>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribe o usa el micrófono..." style={{ width: '100%', padding: '12px 48px 12px 14px', borderRadius: '12px', border: '1.5px solid rgba(42,37,32,0.2)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', resize: 'none', height: '120px', boxSizing: 'border-box', lineHeight: 1.6 }} />
        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
          <MicButton onTranscript={setTexto} />
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#9A8F84', marginBottom: '20px' }}>{ritual.hint}</div>
      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => onComplete({ texto })}>
        Listo →
      </button>
    </div>
  )
}

function GratitudeRitual({ ritual, onComplete }) {
  const [items, setItems] = useState(['', '', ''])
  const set = (i, v) => setItems(prev => prev.map((x, j) => j === i ? v : x))
  return (
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '20px', lineHeight: 1.3 }}>Hoy estoy agradecida por...</div>
      {items.map((val, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '13px', color: '#C9A96E', fontWeight: 700, minWidth: '20px' }}>{i + 1}</div>
          <div style={{ flex: 1, position: 'relative' }}>
            <input value={val} onChange={e => set(i, e.target.value)} placeholder={i === 0 ? 'algo pequeño está bien' : ''} style={{ width: '100%', padding: '11px 44px 11px 12px', borderRadius: '10px', border: '1.5px solid rgba(42,37,32,0.15)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
              <MicButton onTranscript={v => set(i, v)} style={{ width: '24px', height: '24px' }} />
            </div>
          </div>
        </div>
      ))}
      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '8px' }} onClick={() => onComplete({ items })}>
        Guardar →
      </button>
    </div>
  )
}

function GroundingRitual({ ritual, onComplete }) {
  const [pasoActivo, setPasoActivo] = useState(0)
  return (
    <div>
      {ritual.pasos.map((paso, i) => (
        <div key={i} onClick={() => setPasoActivo(i)} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', opacity: pasoActivo === i ? 1 : 0.45, cursor: 'pointer', transition: 'opacity 0.2s' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: pasoActivo === i ? '#2A2520' : 'rgba(42,37,32,0.15)', color: pasoActivo === i ? '#FAFAF7' : '#2A2520', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>{paso.num}</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#2A2520', marginBottom: '3px' }}>{paso.q}</div>
            <div style={{ fontSize: '12px', color: '#6B6057' }}>{paso.hint}</div>
          </div>
        </div>
      ))}
      <button style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '8px' }} onClick={onComplete}>
        Completar ritual →
      </button>
    </div>
  )
}

export default function RitualesPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [ritualActivo, setRitualActivo] = useState(null)
  const [completado, setCompletado] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/holaclara/auth')
      else setUsuario(user)
    })
  }, [])

  const completarRitual = async (datos = {}) => {
    if (usuario && ritualActivo) {
      await supabase.from('rituales_completados').insert({
        user_id: usuario.id,
        ritual_id: ritualActivo.id,
        tipo: ritualActivo.tipo,
        datos,
        fecha: new Date().toISOString().split('T')[0],
      }).catch(() => {})
      fetch('/api/holaclara/sumar-puntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: usuario.id, tipo: 'ritual' }),
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

  if (completado) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none"><polyline points="2,12 10,20 26,4" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '8px' }}>Ritual completado.</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '32px' }}>pequeños momentos, grandes cambios</div>
          <button style={{ padding: '13px 32px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => { setCompletado(false); setRitualActivo(null) }}>
            Volver a rituales
          </button>
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
            <div style={s.navLabel}>{ritualActivo ? ritualActivo.nombre : 'Rituales'}</div>
            <button style={s.backBtn} onClick={() => ritualActivo ? setRitualActivo(null) : router.push('/holaclara/chat')}>
              ← volver
            </button>
          </nav>

          <div style={s.body}>
            {!ritualActivo ? (
              <>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Para hoy</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '4px' }}>Tu momento</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>elige un ritual corto</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {RITUALES.map(ritual => (
                    <div key={ritual.id} onClick={() => setRitualActivo(ritual)} style={{ background: '#fff', border: '0.5px solid rgba(42,37,32,0.15)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <RitualIcon ritual={ritual} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{ritual.nombre}</div>
                        <div style={{ fontSize: '10px', color: '#6B6057' }}>{ritual.tipo.charAt(0).toUpperCase() + ritual.tipo.slice(1)} · {ritual.duracion}</div>
                      </div>
                      <div style={{ fontSize: '18px', color: '#9A8F84', fontWeight: 700 }}>›</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>{ritualActivo.duracion}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '24px', color: '#2A2520', marginBottom: '24px', lineHeight: 1.2 }}>{ritualActivo.nombre}</div>
                {ritualActivo.tipo === 'breathing' && <BreathingRitual ritual={ritualActivo} onComplete={completarRitual} />}
                {ritualActivo.tipo === 'timer' && <TimerRitual ritual={ritualActivo} onComplete={completarRitual} />}
                {ritualActivo.tipo === 'checkin' && <CheckinRitual ritual={ritualActivo} onComplete={completarRitual} />}
                {ritualActivo.tipo === 'textprompt' && <TextPromptRitual ritual={ritualActivo} onComplete={completarRitual} />}
                {ritualActivo.tipo === 'gratitude' && <GratitudeRitual ritual={ritualActivo} onComplete={completarRitual} />}
                {ritualActivo.tipo === 'grounding' && <GroundingRitual ritual={ritualActivo} onComplete={completarRitual} />}
              </div>
            )}
          </div>
        </div>
      </div>
      <TabBar />
    </>
  )
}
