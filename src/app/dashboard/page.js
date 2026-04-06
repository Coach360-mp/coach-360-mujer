'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const coaches = {
  free: { name: 'Clara', photo: '/clara.jpg', credential: 'Coach certificada', desc: 'Tu compañera de crecimiento. Te escucha, te hace preguntas poderosas y te ayuda a ver con más claridad.' },
  esencial: { name: 'Sofía', photo: '/sofia.jpg', credential: 'Coach + Especialista en autodesarrollo', desc: 'Te recomienda herramientas, tests y módulos según lo que necesitas. Integra estrategias de bienestar integral.' },
  premium: { name: 'Victoria', photo: '/victoria.jpg', credential: 'Coach + Neurobiología + Mentora', desc: 'Te da seguimiento personalizado, recuerda tus conversaciones y usa neurociencia aplicada para guiarte.' },
}

const planes = [
  {
    id: 'free', nombre: 'Gratis', precio: '$0', periodo: '',
    features: ['Clara como tu coach', '3 conversaciones por semana', '2 tests básicos', 'Check-in diario', 'Mi Equilibrio'],
  },
  {
    id: 'esencial', nombre: 'Esencial', precio: '$6.990', periodo: '/mes',
    features: ['Sofía como tu coach', 'Conversaciones ilimitadas', 'Todos los tests', 'Todos los módulos', 'Herramientas guiadas', 'Mi Equilibrio completo'],
    popular: true,
  },
  {
    id: 'premium', nombre: 'Premium', precio: '$19.990', periodo: '/mes',
    features: ['Victoria como tu mentora', 'Todo lo de Esencial', 'Coaching con voz', 'Seguimiento personalizado', 'Victoria recuerda tus conversaciones', 'Acceso anticipado a nuevo contenido'],
  },
]

const dimensiones = [
  { key: 'mente', label: 'Mente', desc: '¿Alimentaste tu mente hoy?', color: '#6366f1' },
  { key: 'cuerpo', label: 'Cuerpo', desc: '¿Te moviste hoy?', color: '#10b981' },
  { key: 'corazon', label: 'Corazón', desc: '¿Cómo estás emocionalmente?', color: '#f59e0b' },
  { key: 'espiritu', label: 'Espíritu', desc: '¿Tuviste un momento de calma?', color: '#8b5cf6' },
]

const animos = [
  { label: 'Difícil', value: 1 },
  { label: 'Regular', value: 2 },
  { label: 'Bien', value: 3 },
  { label: 'Muy bien', value: 4 },
  { label: 'Increíble', value: 5 },
]

const elementProfiles = {
  1: { nombre: 'Agua', desc: 'Eres profunda, intuitiva y empática. Sientes antes de pensar. Tu fortaleza es la conexión emocional. Tu desafío es no perderte en las emociones de otros.' },
  2: { nombre: 'Tierra', desc: 'Eres estable, práctica y confiable. Analizas antes de actuar. Tu fortaleza es la solidez. Tu desafío es soltar el control y fluir con lo inesperado.' },
  3: { nombre: 'Fuego', desc: 'Eres apasionada, directa y valiente. Actúas antes de dudar. Tu fortaleza es la determinación. Tu desafío es pausar y escuchar antes de responder.' },
  4: { nombre: 'Aire', desc: 'Eres creativa, adaptable y libre. Exploras antes de comprometerte. Tu fortaleza es la versatilidad. Tu desafío es profundizar y sostener.' },
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [view, setView] = useState('inicio')
  const [prevView, setPrevView] = useState(null)
  const [loading, setLoading] = useState(true)

  const [tests, setTests] = useState([])
  const [herramientas, setHerramientas] = useState([])
  const [modulos, setModulos] = useState([])
  const [activeTest, setActiveTest] = useState(null)
  const [testQuestions, setTestQuestions] = useState([])
  const [testStep, setTestStep] = useState(0)
  const [testAnswers, setTestAnswers] = useState([])
  const [testResult, setTestResult] = useState(null)
  const [activeHerramienta, setActiveHerramienta] = useState(null)
  const [herramientaStep, setHerramientaStep] = useState(0)

  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [animoHoy, setAnimoHoy] = useState(null)
  const [equilibrio, setEquilibrio] = useState({ mente: 0, cuerpo: 0, corazon: 0, espiritu: 0 })
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const chatEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const router = useRouter()

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs, typing])
  useEffect(() => { checkUser() }, [])

  const plan = perfil?.plan_actual || 'free'
  const coach = coaches[plan] || coaches.free

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    setPerfil(profile)

    const currentCoach = coaches[profile?.plan_actual || 'free']
    setChatMsgs([{ r: 'a', t: `Hola, bienvenida ✦\n\nSoy ${currentCoach.name}, ${currentCoach.credential.toLowerCase()}. Estoy aquí para ayudarte a ver con más claridad.\n\n¿Qué te trae hoy?` }])

    const { data: t } = await supabase.from('tests').select('*').eq('activo', true).order('orden')
    const { data: h } = await supabase.from('templates').select('*').eq('activo', true).order('orden')
    const { data: m } = await supabase.from('modulos').select('*').eq('activo', true).order('orden')
    if (t) setTests(t)
    if (h) setHerramientas(h)
    if (m) setModulos(m)
    setLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }
  const navigate = (newView) => { setPrevView(view); setView(newView) }
  const goBack = () => {
    if (activeTest && !testResult) { setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (testResult) { setTestResult(null); setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (activeHerramienta) { setActiveHerramienta(null); setHerramientaStep(0); setView('herramientas'); return }
    if (prevView) { setView(prevView); setPrevView(null) }
    else { setView('inicio') }
  }

  const startTest = async (test) => {
    const { data: questions } = await supabase.from('preguntas').select('*').eq('test_id', test.id).order('orden')
    if (questions && questions.length > 0) {
      setTestQuestions(questions); setActiveTest(test); setTestStep(0); setTestAnswers([]); setTestResult(null)
    }
  }

  const answerQuestion = async (value) => {
    const newAnswers = [...testAnswers, value]
    setTestAnswers(newAnswers)
    if (testStep + 1 < testQuestions.length) { setTestStep(testStep + 1) }
    else {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
      newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      const profile = elementProfiles[dominant] || { nombre: 'Explorador', desc: 'Tienes una combinación única de elementos.' }
      setTestResult(profile)
      if (user) {
        await supabase.from('resultados_test').insert({ usuario_id: user.id, test_id: activeTest.id, puntaje_total: newAnswers.reduce((a, b) => a + b, 0), perfil_resultado: profile.nombre, respuestas: newAnswers })
      }
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMsgs(prev => [...prev, { r: 'u', t: msg }])
    setChatInput(''); setTyping(true)
    try {
      const history = chatMsgs.map(m => ({ role: m.r === 'a' ? 'assistant' : 'user', content: m.t }))
      history.push({ role: 'user', content: msg })
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      const data = await res.json()
      setTyping(false)
      const reply = data.reply || 'Cuéntame más ✦'
      setChatMsgs(prev => [...prev, { r: 'a', t: reply }])
      speakText(reply)
    } catch {
      setTyping(false)
      setChatMsgs(prev => [...prev, { r: 'a', t: 'Perdona, hubo un error. ¿Puedes intentar de nuevo? ✦' }])
    }
  }

  const speakText = async (text) => {
    try {
      const coachKey = Object.keys(coaches).find(k => coaches[k] === coach) || 'clara'
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, coach: coachKey }),
      })
      const data = await res.json()
      if (data.audio) {
        setIsPlaying(true)
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`)
        audio.onended = () => setIsPlaying(false)
        audio.play()
      }
    } catch (err) {
      console.error('TTS error:', err)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        
        // Use browser SpeechRecognition for simplicity
        // The text will be set in chatInput for the user to review before sending
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Use Web Speech API for real-time transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'es-CL'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setChatInput(transcript)
          setIsRecording(false)
        }

        recognition.onerror = () => {
          setIsRecording(false)
        }

        recognition.onend = () => {
          setIsRecording(false)
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
        }

        recognition.start()
      }
    } catch (err) {
      console.error('Microphone error:', err)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warm)' }}>
      <p style={{ color: 'var(--text-light)' }}>Cargando ✦</p>
    </div>
  )

  const nombre = perfil?.nombre || user?.user_metadata?.full_name || 'Bienvenida'
  const canAccess = (required) => required === 'free' || plan === 'premium' || (plan === 'esencial' && required !== 'premium')

  const Header = ({ title, subtitle, showBack = true }) => (
    <div style={{ padding: '48px 20px 16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
      {showBack && <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '4px 8px' }}>←</button>}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-light)', margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--warm)', paddingBottom: 80 }}>

      {/* === INICIO === */}
      {view === 'inicio' && (
        <div style={{ padding: '48px 20px 20px' }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Hola,</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 20 }}>{nombre} ✦</h1>

          {!checkinDone ? (
            <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>¿Cómo te sientes hoy?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {animos.map(a => (
                  <button key={a.value} onClick={() => { setAnimoHoy(a.value); setCheckinDone(true) }}
                    style={{ background: animoHoy === a.value ? 'var(--gold)' : 'var(--warm-dark)', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: animoHoy === a.value ? '#fff' : 'var(--text)', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--gold)' }}>Check-in completado ✦</p>
            </div>
          )}

          {/* Coach card with photo */}
          <div className="card" style={{ marginBottom: 16, background: 'var(--dark)', color: '#fff', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center' }} onClick={() => navigate('clara')}>
            <img src={coach.photo} alt={coach.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-light)' }} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--gold-light)', marginBottom: 2 }}>{coach.credential}</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', marginBottom: 4 }}>Habla con {coach.name}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Tu coach personal con IA ✦</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20, cursor: 'pointer' }} onClick={() => navigate('equilibrio')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: 0 }}>Mi Equilibrio</h3>
              <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {dimensiones.map(d => (
                <div key={d.key} style={{ textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 10, color: 'var(--text-light)' }}>{d.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[{ label: 'Racha', val: perfil?.racha_dias || 0 }, { label: 'Nivel', val: perfil?.nivel || 1 }, { label: 'Puntos', val: perfil?.puntos_totales || 0 }].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: 16 }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Conoce al equipo */}
          <div className="card" style={{ marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate('planes')}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Conoce a tu equipo de coaches</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {Object.values(coaches).map(c => (
                <div key={c.name} style={{ textAlign: 'center' }}>
                  <img src={c.photo} alt={c.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: plan === Object.keys(coaches).find(k => coaches[k].name === c.name) ? '2px solid var(--gold)' : '2px solid #e0dbd4' }} />
                  <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{c.name}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--gold)', textAlign: 'center', marginTop: 8 }}>Ver planes →</p>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Tests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {tests.slice(0, 3).map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => canAccess(t.plan_requerido) && startTest(t)}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p>
                </div>
                {!canAccess(t.plan_requerido) && <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === PLANES === */}
      {view === 'planes' && (
        <div>
          <Header title="Elige tu coach ✦" subtitle="Cada plan te conecta con una coach diferente" />
          <div style={{ padding: '20px' }}>
            {planes.map(p => {
              const c = coaches[p.id]
              const isCurrentPlan = plan === p.id
              return (
                <div key={p.id} className="card" style={{
                  marginBottom: 16,
                  border: p.popular ? '2px solid var(--gold)' : isCurrentPlan ? '2px solid var(--dark)' : '2px solid transparent',
                  position: 'relative',
                }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', padding: '2px 16px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      Más popular
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                    <img src={c.photo} alt={c.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{c.name}</h3>
                      <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{c.credential}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 14 }}>{c.desc}</p>
                  <div style={{ marginBottom: 14 }}>
                    {p.features.map((f, i) => (
                      <p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>·</span>{f}
                      </p>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>{p.precio}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{p.periodo}</span>
                    </div>
                    {isCurrentPlan ? (
                      <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Plan actual</span>
                    ) : (
                      <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>
                        {p.id === 'free' ? 'Actual' : 'Elegir plan'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Sesiones aparte */}
            <div className="card" style={{ marginTop: 8, background: 'var(--warm-dark)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Sesiones con coach humana</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12 }}>
                Complementa tu proceso con una sesión 1:1 con una coach profesional certificada.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>1 sesión: <strong>$49.990</strong></p>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Pack 4: <strong>$159.990</strong></p>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Pack 8: <strong>$279.990</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* === TEST ACTIVO === */}
      {activeTest && !testResult && (
        <div>
          <Header title={activeTest.titulo} subtitle={`Pregunta ${testStep + 1} de ${testQuestions.length}`} />
          <div style={{ padding: '24px 20px' }}>
            <div style={{ background: 'var(--warm-dark)', borderRadius: 12, height: 4, marginBottom: 32 }}>
              <div style={{ background: 'var(--gold)', borderRadius: 12, height: 4, width: `${((testStep + 1) / testQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.3, marginBottom: 28 }}>{testQuestions[testStep]?.texto}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {testQuestions[testStep]?.opciones?.map((opt, i) => (
                <button key={i} onClick={() => answerQuestion(testQuestions[testStep].valores[i])}
                  style={{ padding: '16px 20px', borderRadius: 14, border: '2px solid #e0dbd4', background: '#fff', textAlign: 'left', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', lineHeight: 1.4, transition: 'all 0.2s', color: 'var(--text)' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === RESULTADO TEST === */}
      {testResult && (
        <div>
          <Header title="Tu Resultado ✦" />
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--gold-light)', fontSize: 36, fontFamily: 'var(--font-display)' }}>{testResult.nombre[0]}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>{testResult.nombre}</h2>
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 32px' }}>{testResult.desc}</p>
            <button className="btn-primary" onClick={() => { setTestResult(null); setActiveTest(null); navigate('clara') }} style={{ marginBottom: 12 }}>
              Explorar esto con {coach.name} ✦
            </button>
            <button className="btn-secondary" onClick={() => { setTestResult(null); setActiveTest(null) }}>Volver al inicio</button>
          </div>
        </div>
      )}

      {/* === MI EQUILIBRIO === */}
      {view === 'equilibrio' && !activeTest && (
        <div>
          <Header title="Mi Equilibrio ✦" subtitle="Tu bienestar integral de hoy" />
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.5 }}>Cuida las cuatro dimensiones que impactan tu claridad y tus decisiones.</p>
            {dimensiones.map(d => (
              <div key={d.key} className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{d.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{d.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setEquilibrio(prev => ({ ...prev, [d.key]: v }))}
                      style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', background: equilibrio[d.key] >= v ? d.color : '#f0ebe3', opacity: equilibrio[d.key] >= v ? 1 : 0.5, transition: 'all 0.2s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-light)' }}>Nada</span>
                  <span style={{ fontSize: 10, color: 'var(--text-light)' }}>Mucho</span>
                </div>
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('inicio')}>Guardar mi equilibrio ✦</button>
          </div>
        </div>
      )}

      {/* === CLARA/SOFÍA/VICTORIA CHAT === */}
      {view === 'clara' && !activeTest && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '48px 20px 12px', borderBottom: '1px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '4px 8px' }}>←</button>
            <img src={coach.photo} alt={coach.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{coach.name} ✦</h2>
              <p style={{ fontSize: 11, color: 'var(--text-light)', margin: 0 }}>{coach.credential}</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.r === 'u' ? 'flex-end' : 'flex-start', maxWidth: '85%', flexDirection: m.r === 'u' ? 'row-reverse' : 'row' }}>
                {m.r === 'a' && <img src={coach.photo} alt={coach.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 4, flexShrink: 0 }} />}
                <div style={{
                  padding: '12px 16px', borderRadius: m.r === 'u' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.r === 'u' ? 'var(--dark)' : '#fff', color: m.r === 'u' ? '#fff' : 'var(--text)',
                  fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', boxShadow: m.r === 'a' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                }}>{m.t}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
                <img src={coach.photo} alt={coach.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 4 }} />
                <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#fff', color: 'var(--text-light)', fontSize: 14 }}>
                  {coach.name} está pensando ✦
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px 20px 32px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <button onClick={isRecording ? stopRecording : startRecording}
              style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: isRecording ? '#c53030' : 'var(--warm-dark)', color: isRecording ? '#fff' : 'var(--text)', fontSize: 18, cursor: 'pointer', transition: 'all 0.2s' }}>
              {isRecording ? '◼' : '🎙'}
            </button>
            <input className="input-field" placeholder={`Escríbele a ${coach.name}...`} value={chatInput}
              onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
            <button onClick={sendMessage} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'var(--dark)', color: '#fff', fontSize: 16 }}>→</button>
          </div>
        </div>
      )}

      {/* === TESTS === */}
      {view === 'tests' && !activeTest && (
        <div>
          <Header title="Tests ✦" subtitle="Descubre más sobre ti misma" showBack={false} />
          <div style={{ padding: '20px' }}>
            {tests.map(t => (
              <div key={t.id} className="card" style={{ marginBottom: 10, cursor: canAccess(t.plan_requerido) ? 'pointer' : 'default' }}
                onClick={() => canAccess(t.plan_requerido) && startTest(t)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p>
                  </div>
                  {!canAccess(t.plan_requerido) ? (
                    <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                  ) : <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === HERRAMIENTAS === */}
      {view === 'herramientas' && !activeHerramienta && (
        <div>
          <Header title="Herramientas ✦" subtitle="Ejercicios prácticos con neurociencia" showBack={false} />
          <div style={{ padding: '20px' }}>
            {herramientas.map(h => (
              <div key={h.id} className="card" style={{ marginBottom: 10, cursor: canAccess(h.plan_requerido) ? 'pointer' : 'default' }}
                onClick={() => { if (canAccess(h.plan_requerido)) { setActiveHerramienta(h); setHerramientaStep(0); navigate('herramienta_activa') } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{h.titulo}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{h.categoria} · {h.pasos?.length || 0} pasos</p>
                  </div>
                  {!canAccess(h.plan_requerido) ? (
                    <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                  ) : <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === HERRAMIENTA ACTIVA === */}
      {activeHerramienta && view === 'herramienta_activa' && (
        <div>
          <Header title={activeHerramienta.titulo} subtitle={`Paso ${herramientaStep + 1} de ${activeHerramienta.pasos?.length || 0}`} />
          <div style={{ padding: '24px 20px' }}>
            <div style={{ background: 'var(--warm-dark)', borderRadius: 12, height: 4, marginBottom: 24 }}>
              <div style={{ background: 'var(--gold)', borderRadius: 12, height: 4, width: `${((herramientaStep + 1) / (activeHerramienta.pasos?.length || 1)) * 100}%`, transition: 'width 0.3s' }} />
            </div>
            {herramientaStep === 0 && <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>{activeHerramienta.descripcion}</p>}
            <div className="card" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 15, lineHeight: 1.7 }}>{activeHerramienta.pasos?.[herramientaStep]}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {herramientaStep > 0 && <button className="btn-secondary" onClick={() => setHerramientaStep(herramientaStep - 1)} style={{ flex: 1 }}>← Anterior</button>}
              {herramientaStep < (activeHerramienta.pasos?.length || 1) - 1 ? (
                <button className="btn-primary" onClick={() => setHerramientaStep(herramientaStep + 1)} style={{ flex: 1 }}>Siguiente →</button>
              ) : (
                <button className="btn-primary" onClick={() => { setActiveHerramienta(null); setHerramientaStep(0); setView('herramientas') }} style={{ flex: 1 }}>Completar ✦</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === PERFIL === */}
      {view === 'perfil' && !activeTest && (
        <div>
          <Header title="Tu Perfil ✦" showBack={false} />
          <div style={{ padding: '20px' }}>
            <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'var(--font-display)', margin: '0 auto 12px' }}>
                {nombre[0].toUpperCase()}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{nombre}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{user?.email}</p>
              <p style={{ display: 'inline-block', marginTop: 8, fontSize: 12, background: 'var(--warm-dark)', padding: '4px 12px', borderRadius: 8, color: 'var(--gold)', fontWeight: 600, textTransform: 'capitalize' }}>Plan {plan}</p>
            </div>

            {/* Tu coach actual */}
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
              <img src={coach.photo} alt={coach.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Tu coach: {coach.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{coach.credential}</p>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[{ label: 'Racha actual', val: perfil?.racha_dias || 0 }, { label: 'Mejor racha', val: perfil?.mejor_racha || 0 }, { label: 'Nivel', val: perfil?.nivel || 1 }, { label: 'Puntos', val: perfil?.puntos_totales || 0 }].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={() => navigate('planes')} style={{ marginBottom: 12 }}>Cambiar plan</button>
            <button className="btn-secondary" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* === BOTTOM NAV === */}
      {!activeTest && !testResult && !activeHerramienta && !['clara', 'equilibrio', 'herramienta_activa', 'planes'].includes(view) && (
        <div className="bottom-nav">
          <button className={`nav-item ${view === 'inicio' ? 'active' : ''}`} onClick={() => setView('inicio')}><span className="nav-icon">⬡</span>Inicio</button>
          <button className={`nav-item ${view === 'tests' ? 'active' : ''}`} onClick={() => setView('tests')}><span className="nav-icon">◇</span>Tests</button>
          <button className="nav-item" onClick={() => navigate('clara')}><span className="nav-icon">✦</span>{coach.name}</button>
          <button className={`nav-item ${view === 'herramientas' ? 'active' : ''}`} onClick={() => setView('herramientas')}><span className="nav-icon">◎</span>Herramientas</button>
          <button className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}><span className="nav-icon">○</span>Yo</button>
        </div>
      )}
    </div>
  )
}
