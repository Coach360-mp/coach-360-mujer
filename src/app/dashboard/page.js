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
  { id: 'free', nombre: 'Gratis', precio: '$0', periodo: '', features: ['Clara como tu coach', '3 conversaciones por semana', '2 tests básicos', 'Check-in diario', 'Mi Equilibrio'] },
  { id: 'esencial', nombre: 'Esencial', precio: '$6.990', periodo: '/mes', features: ['Sofía como tu coach', 'Conversaciones ilimitadas', 'Todos los tests', 'Todos los módulos', 'Herramientas guiadas', 'Mi Equilibrio completo'], popular: true },
  { id: 'premium', nombre: 'Premium', precio: '$19.990', periodo: '/mes', features: ['Victoria como tu mentora', 'Todo lo de Esencial', 'Coaching con voz', 'Seguimiento personalizado', 'Victoria recuerda tus conversaciones', 'Acceso anticipado a nuevo contenido'] },
]

const dimensiones = [
  { key: 'mente', label: 'Mente', desc: '¿Alimentaste tu mente hoy?', color: '#6366f1' },
  { key: 'cuerpo', label: 'Cuerpo', desc: '¿Te moviste hoy?', color: '#10b981' },
  { key: 'corazon', label: 'Corazón', desc: '¿Cómo estás emocionalmente?', color: '#f59e0b' },
  { key: 'espiritu', label: 'Espíritu', desc: '¿Tuviste un momento de calma?', color: '#8b5cf6' },
]

const animos = [{ label: 'Difícil', value: 1 }, { label: 'Regular', value: 2 }, { label: 'Bien', value: 3 }, { label: 'Muy bien', value: 4 }, { label: 'Increíble', value: 5 }]

const habitosSugeridos = {
  mente: ['Leer 20 minutos', 'Meditar', 'Escribir en un diario', 'Aprender algo nuevo', 'Hacer un puzzle', 'Escuchar un podcast', 'Desconectarme del celular 1 hora', 'Journaling matutino'],
  cuerpo: ['Caminar 30 minutos', 'Pilates', 'Gimnasio', 'Yoga', 'Tomar 2 litros de agua', 'Dormir 8 horas', 'Comer 5 porciones de verduras', 'Estirarme 10 minutos'],
  corazon: ['Llamar a alguien querido', 'Expresar agradecimiento', 'Journaling emocional', 'Conectar con amigas', 'Cuidar a alguien', 'Escribir lo que sentí hoy', 'Pasar tiempo con mi pareja', 'Tiempo con mis hijos'],
  espiritu: ['Meditación guiada', 'Caminar en naturaleza', 'Oración', 'Momento de silencio', 'Respiración consciente', 'Leer algo inspirador', 'Gratitud al dormir', 'Contemplación'],
}

const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const elementProfiles = {
  1: { nombre: 'Agua', icono: '💧', color: '#0ea5e9', colorBg: 'rgba(14, 165, 233, 0.12)', desc: 'Eres profunda, intuitiva y empática. Sientes antes de pensar.', descLarga: 'Tu naturaleza fluye con las emociones — las tuyas y las de quienes te rodean. Tienes una capacidad poco común de leer entre líneas, percibir lo no dicho y conectar con la verdad emocional de cada situación.', fortalezas: ['Empatía profunda con otros', 'Intuición que rara vez se equivoca', 'Capacidad de crear vínculos auténticos', 'Sensibilidad para captar lo que otros no ven'], sombras: ['Puedes perderte en las emociones de otros', 'A veces evitas la confrontación necesaria', 'Cargas con peso que no es tuyo'], recomendaciones: ['Practica poner límites desde el amor, no desde el miedo', 'Pregúntate: ¿esta emoción es mía o la estoy absorbiendo?', 'Date espacios de soledad para reconectar contigo misma'], proximoPaso: 'El módulo "Gestión Emocional" está diseñado para ti.', promptClara: 'Acabo de descubrir que mi elemento es Agua. Me gustaría conversar sobre cómo gestionar mejor mi sensibilidad emocional sin perderme en las emociones de otros.' },
  2: { nombre: 'Tierra', icono: '🌱', color: '#84cc16', colorBg: 'rgba(132, 204, 22, 0.12)', desc: 'Eres estable, práctica y confiable. Analizas antes de actuar.', descLarga: 'Tu fortaleza es la solidez. Eres el ancla en momentos de tormenta, la voz de la razón, la que construye paso a paso lo que otras solo sueñan.', fortalezas: ['Estabilidad que inspira confianza', 'Capacidad de planificar y ejecutar', 'Paciencia para los procesos largos', 'Pragmatismo que evita errores costosos'], sombras: ['Te cuesta soltar el control', 'A veces pierdes oportunidades por sobreanalizar', 'Puedes volverte rígida ante el cambio'], recomendaciones: ['Practica decir sí a algo nuevo cada semana sin planearlo', 'Permítete equivocarte — la perfección es una jaula', 'Confía en otros para soltar parte del peso'], proximoPaso: 'La herramienta "Pausa Antes de Decidir" te va a sorprender.', promptClara: 'Mi elemento es Tierra. Soy muy analítica y me cuesta soltar el control. Quiero trabajar en confiar más y permitirme fluir.' },
  3: { nombre: 'Fuego', icono: '🔥', color: '#f97316', colorBg: 'rgba(249, 115, 22, 0.12)', desc: 'Eres apasionada, directa y valiente. Actúas antes de dudar.', descLarga: 'Tu energía es contagiosa. Donde otras ven obstáculos, tú ves desafíos. Cuando te comprometes con algo, lo das todo.', fortalezas: ['Determinación que mueve montañas', 'Coraje para iniciar lo que otras posponen', 'Pasión que inspira a quienes te rodean', 'Honestidad directa, sin máscaras'], sombras: ['A veces respondes antes de escuchar', 'Puedes quemarte por exceso de intensidad', 'Tu directness puede herir sin querer'], recomendaciones: ['Antes de responder, respira 3 veces', 'Aprende la diferencia entre directo y abrupto', 'Programa pausas reales — no son debilidad, son estrategia'], proximoPaso: 'La herramienta "Reset de 10 Minutos" es tu mejor aliada esta semana.', promptClara: 'Mi elemento es Fuego. Soy intensa y directa, pero a veces actúo antes de pensar.' },
  4: { nombre: 'Aire', icono: '🌬️', color: '#a78bfa', colorBg: 'rgba(167, 139, 250, 0.12)', desc: 'Eres creativa, adaptable y libre. Exploras antes de comprometerte.', descLarga: 'Tu mente vuela alto y conecta ideas que otras no ven. Eres la que llena espacios de chispa, humor y posibilidades nuevas.', fortalezas: ['Creatividad que rompe esquemas', 'Adaptabilidad ante el cambio', 'Visión amplia y conectiva', 'Capacidad de reinventarte'], sombras: ['Te cuesta sostener compromisos largos', 'Saltas de idea en idea sin profundizar', 'A veces evitas el peso de las emociones difíciles'], recomendaciones: ['Elige UNA cosa esta semana y termínala', 'Practica quedarte 5 minutos más en una conversación incómoda', 'Profundiza en algo que ya conoces antes de buscar lo nuevo'], proximoPaso: 'El módulo "Decisiones Alineadas" te va a ayudar a sostener tus elecciones.', promptClara: 'Mi elemento es Aire. Soy creativa pero me cuesta profundizar y sostener compromisos.' },
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
  const [herramientaReflexion, setHerramientaReflexion] = useState('')
  const [herramientaCompletada, setHerramientaCompletada] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [animoHoy, setAnimoHoy] = useState(null)
  const [equilibrio, setEquilibrio] = useState({ mente: 0, cuerpo: 0, corazon: 0, espiritu: 0 })
  const [habitosUsuario, setHabitosUsuario] = useState([])
  const [habitosCompletados, setHabitosCompletados] = useState([])
  const [configurandoHabitos, setConfigurandoHabitos] = useState(false)
  const [configDimension, setConfigDimension] = useState(0)
  const [habitosSeleccionados, setHabitosSeleccionados] = useState({ mente: [], cuerpo: [], corazon: [], espiritu: [] })
  const [nuevoHabito, setNuevoHabito] = useState('')
  const [statModal, setStatModal] = useState(null)
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

    // Cargar hábitos personalizados y completados del día
    const hoy = new Date().toISOString().split('T')[0]
    const { data: hab } = await supabase.from('habitos_usuario').select('*').eq('user_id', user.id).eq('activo', true)
    const { data: hcomp } = await supabase.from('habitos_completados').select('*').eq('user_id', user.id).eq('fecha', hoy)
    if (hab) setHabitosUsuario(hab)
    if (hcomp) setHabitosCompletados(hcomp.map(c => c.habito_id))

    setLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }
  const navigate = (newView) => { setPrevView(view); setView(newView) }
  const goBack = () => {
    if (activeTest && !testResult) { setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (testResult) { setTestResult(null); setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (activeHerramienta) { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('herramientas'); return }
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

  const startHerramienta = (h) => {
    setActiveHerramienta(h); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); navigate('herramienta_activa')
  }

  const completeHerramienta = async () => {
    setHerramientaCompletada(true)
    if (user && herramientaReflexion.trim()) {
      try {
        await supabase.from('resultados_test').insert({ usuario_id: user.id, test_id: null, puntaje_total: 0, perfil_resultado: `Herramienta: ${activeHerramienta.titulo}`, respuestas: { reflexion: herramientaReflexion, herramienta_id: activeHerramienta.id } })
      } catch (err) { console.error('Error guardando reflexión:', err) }
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
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, userId: user?.id }) })
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
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, coach: coachKey }) })
      const data = await res.json()
      if (data.audio) {
        setIsPlaying(true)
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`)
        audio.onended = () => setIsPlaying(false)
        audio.play()
      }
    } catch (err) { console.error('TTS error:', err) }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => { audioChunksRef.current.push(event.data) }
      mediaRecorder.onstop = async () => { stream.getTracks().forEach(track => track.stop()) }
      mediaRecorder.start()
      setIsRecording(true)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'es-CL'
        recognition.interimResults = false
        recognition.maxAlternatives = 1
        recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; setChatInput(transcript); setIsRecording(false) }
        recognition.onerror = () => { setIsRecording(false) }
        recognition.onend = () => { setIsRecording(false); if (mediaRecorderRef.current?.state === 'recording') { mediaRecorderRef.current.stop() } }
        recognition.start()
      }
    } catch (err) { console.error('Microphone error:', err); setIsRecording(false) }
  }

  const stopRecording = () => { if (mediaRecorderRef.current?.state === 'recording') { mediaRecorderRef.current.stop() } setIsRecording(false) }

  const toggleHabitoSeleccionado = (dim, habito) => {
    setHabitosSeleccionados(prev => {
      const actuales = prev[dim] || []
      const existe = actuales.find(h => h.nombre === habito)
      if (existe) {
        return { ...prev, [dim]: actuales.filter(h => h.nombre !== habito) }
      } else {
        return { ...prev, [dim]: [...actuales, { nombre: habito, dias: [1,2,3,4,5,6,7], horario: null }] }
      }
    })
  }

  const toggleDiaHabito = (dim, habitoNombre, dia) => {
    setHabitosSeleccionados(prev => ({
      ...prev,
      [dim]: prev[dim].map(h => {
        if (h.nombre !== habitoNombre) return h
        const nuevosDias = h.dias.includes(dia) ? h.dias.filter(d => d !== dia) : [...h.dias, dia].sort()
        return { ...h, dias: nuevosDias }
      })
    }))
  }

  const agregarHabitoPropio = (dim) => {
    if (!nuevoHabito.trim()) return
    setHabitosSeleccionados(prev => ({
      ...prev,
      [dim]: [...(prev[dim] || []), { nombre: nuevoHabito.trim(), dias: [1,2,3,4,5,6,7], horario: null }]
    }))
    setNuevoHabito('')
  }

  const guardarHabitos = async () => {
    if (!user) return
    const todosLosHabitos = []
    Object.keys(habitosSeleccionados).forEach(dim => {
      habitosSeleccionados[dim].forEach(h => {
        todosLosHabitos.push({ user_id: user.id, dimension: dim, nombre: h.nombre, dias_semana: h.dias, horario: h.horario, activo: true })
      })
    })
    if (todosLosHabitos.length > 0) {
      const { data } = await supabase.from('habitos_usuario').insert(todosLosHabitos).select()
      if (data) setHabitosUsuario(data)
    }
    setConfigurandoHabitos(false)
    setConfigDimension(0)
  }

  const toggleHabitoCompletado = async (habitoId) => {
    if (!user) return
    const hoy = new Date().toISOString().split('T')[0]
    const yaCompletado = habitosCompletados.includes(habitoId)
    if (yaCompletado) {
      await supabase.from('habitos_completados').delete().eq('habito_id', habitoId).eq('fecha', hoy)
      setHabitosCompletados(prev => prev.filter(id => id !== habitoId))
    } else {
      await supabase.from('habitos_completados').insert({ user_id: user.id, habito_id: habitoId, fecha: hoy })
      setHabitosCompletados(prev => [...prev, habitoId])
    }
  }

  const iniciarConfiguracion = () => {
    setConfigurandoHabitos(true)
    setConfigDimension(0)
    setHabitosSeleccionados({ mente: [], cuerpo: [], corazon: [], espiritu: [] })
  }

  if (loading) return (<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warm)' }}><p style={{ color: 'var(--text-light)' }}>Cargando ✦</p></div>)

  const nombre = perfil?.nombre || user?.user_metadata?.full_name || 'Bienvenida'
  const canAccess = (required) => required === 'free' || plan === 'premium' || (plan === 'esencial' && required !== 'premium')

  const handleCheckout = async (planId) => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, userId: user.id, userEmail: user.email }) })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
    } catch (err) { console.error('Checkout error:', err) }
  }

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

      {view === 'inicio' && (
        <div style={{ padding: '48px 20px 20px' }}>
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Hola,</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 20 }}>{nombre} ✦</h1>
          {!checkinDone ? (
            <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>¿Cómo te sientes hoy?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {animos.map(a => (<button key={a.value} onClick={() => { setAnimoHoy(a.value); setCheckinDone(true) }} style={{ background: animoHoy === a.value ? 'var(--gold)' : 'var(--warm-dark)', border: 'none', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: animoHoy === a.value ? '#fff' : 'var(--text)', transition: 'all 0.2s', fontFamily: 'var(--font-body)' }}>{a.label}</button>))}
              </div>
            </div>
          ) : (<div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: 16 }}><p style={{ fontSize: 13, color: 'var(--gold)' }}>Check-in completado ✦</p></div>)}

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
              {dimensiones.map(d => (<div key={d.key} style={{ textAlign: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, margin: '0 auto 6px' }} /><p style={{ fontSize: 10, color: 'var(--text-light)' }}>{d.label}</p></div>))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Racha', val: perfil?.racha_dias || 0, key: 'racha' },
              { label: 'Nivel', val: perfil?.nivel || 1, key: 'nivel' },
              { label: 'Puntos', val: perfil?.puntos_totales || 0, key: 'puntos' }
            ].map(s => (
              <div key={s.label} className="card" onClick={() => setStatModal(s.key)} style={{ textAlign: 'center', padding: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate('planes')}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 12 }}>Conoce a tu equipo de coaches</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {Object.values(coaches).map(c => (<div key={c.name} style={{ textAlign: 'center' }}><img src={c.photo} alt={c.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: plan === Object.keys(coaches).find(k => coaches[k].name === c.name) ? '2px solid var(--gold)' : '2px solid #e0dbd4' }} /><p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{c.name}</p></div>))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--gold)', textAlign: 'center', marginTop: 8 }}>Ver planes →</p>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Tests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {tests.slice(0, 3).map(t => (<div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => canAccess(t.plan_requerido) && startTest(t)}><div><p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p></div>{!canAccess(t.plan_requerido) && <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>}</div>))}
          </div>
        </div>
      )}

      {view === 'planes' && (
        <div>
          <Header title="Elige tu coach ✦" subtitle="Cada plan te conecta con una coach diferente" />
          <div style={{ padding: '20px' }}>
            {planes.map(p => {
              const c = coaches[p.id]
              const isCurrentPlan = plan === p.id
              return (
                <div key={p.id} className="card" style={{ marginBottom: 16, border: p.popular ? '2px solid var(--gold)' : isCurrentPlan ? '2px solid var(--dark)' : '2px solid transparent', position: 'relative' }}>
                  {p.popular && (<div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', padding: '2px 16px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Más popular</div>)}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}><img src={c.photo} alt={c.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} /><div><h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{c.name}</h3><p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{c.credential}</p></div></div>
                  <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 14 }}>{c.desc}</p>
                  <div style={{ marginBottom: 14 }}>{p.features.map((f, i) => (<p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, paddingLeft: 16, position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>·</span>{f}</p>))}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>{p.precio}</span><span style={{ fontSize: 13, color: 'var(--text-light)' }}>{p.periodo}</span></div>
                    {isCurrentPlan ? (<span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Plan actual</span>) : p.id === 'free' ? (<span style={{ fontSize: 13, color: 'var(--text-light)' }}>Gratis</span>) : (<button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => handleCheckout(p.id)}>Elegir plan</button>)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTest && !testResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => { setActiveTest(null); setTestStep(0); setTestAnswers([]); }} style={{ background: 'transparent', border: 'none', color: '#a8a8a8', fontSize: 14, cursor: 'pointer' }}>← Salir</button>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase' }}>{testStep + 1} / {testQuestions.length}</div>
          </div>
          <div style={{ padding: '0 24px 32px' }}><div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: 12, height: 4, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg, #d4af37, #f5c842)', height: '100%', width: `${((testStep + 1) / testQuestions.length) * 100}%`, transition: 'width 0.4s ease' }} /></div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 40px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>{activeTest.titulo}</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, lineHeight: 1.4, marginBottom: 40, color: '#fff', textAlign: 'center', fontWeight: 300 }}>{testQuestions[testStep]?.texto}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {testQuestions[testStep]?.opciones?.map((opt, i) => (<button key={i} onClick={() => answerQuestion(testQuestions[testStep].valores[i])} style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 14, padding: '18px 20px', color: '#fff', fontSize: 15, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1.5, fontFamily: 'inherit' }}>{opt}</button>))}
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: testResult.nombre === 'Agua' ? 'linear-gradient(180deg, #082f49 0%, #0c4a6e 40%, #0a0a0a 100%)' : testResult.nombre === 'Tierra' ? 'linear-gradient(180deg, #1a2e05 0%, #365314 40%, #0a0a0a 100%)' : testResult.nombre === 'Fuego' ? 'linear-gradient(180deg, #431407 0%, #7c2d12 40%, #0a0a0a 100%)' : testResult.nombre === 'Aire' ? 'linear-gradient(180deg, #2e1065 0%, #4c1d95 40%, #0a0a0a 100%)' : 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ padding: '20px 24px' }}><button onClick={() => { setTestResult(null); setActiveTest(null); }} style={{ background: 'transparent', border: 'none', color: '#a8a8a8', fontSize: 14, cursor: 'pointer' }}>← Cerrar</button></div>
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 60px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: testResult.color || '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tu elemento es</div>
              <div style={{ fontSize: 80, marginBottom: 8 }}>{testResult.icono || '✦'}</div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 300, color: '#fff', marginBottom: 16 }}>{testResult.nombre}</h1>
              <p style={{ fontSize: 16, color: '#d4d4d4', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>{testResult.descLarga || testResult.desc}</p>
            </div>
            {testResult.fortalezas && (<div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: testResult.color, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>✦ Tus fortalezas</div>{testResult.fortalezas.map((f, i) => (<div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, color: '#e5e5e5', fontSize: 14, lineHeight: 1.5 }}><span style={{ color: testResult.color, flexShrink: 0 }}>—</span><span>{f}</span></div>))}</div>)}
            {testResult.sombras && (<div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: '#a8a8a8', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Tu sombra</div>{testResult.sombras.map((s, i) => (<div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, color: '#c4c4c4', fontSize: 14, lineHeight: 1.5 }}><span style={{ color: '#a8a8a8', flexShrink: 0 }}>—</span><span>{s}</span></div>))}</div>)}
            {testResult.recomendaciones && (<div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: testResult.color, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Para esta semana</div>{testResult.recomendaciones.map((r, i) => (<div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, color: '#e5e5e5', fontSize: 14, lineHeight: 1.5 }}><span style={{ color: testResult.color, flexShrink: 0, fontWeight: 600 }}>{i + 1}.</span><span>{r}</span></div>))}</div>)}
            {testResult.proximoPaso && (<div style={{ background: testResult.colorBg, border: `1px solid ${testResult.color}40`, borderRadius: 16, padding: 24, marginBottom: 24 }}><div style={{ fontSize: 11, letterSpacing: 2, color: testResult.color, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>✦ Tu próximo paso</div><div style={{ color: '#fff', fontSize: 15, lineHeight: 1.5 }}>{testResult.proximoPaso}</div></div>)}
            <button onClick={() => { const prompt = testResult.promptClara || `Acabo de hacer un test y mi resultado es ${testResult.nombre}.`; setChatMsgs([{ r: 'u', t: prompt }]); setTestResult(null); setActiveTest(null); setView('clara') }} style={{ width: '100%', background: `linear-gradient(135deg, ${testResult.color}, ${testResult.color}cc)`, color: '#0a0a0a', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>Conversar con {coach.name} sobre esto →</button>
            <button onClick={() => { setTestResult(null); setActiveTest(null); }} style={{ width: '100%', background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Volver al inicio</button>
          </div>
        </div>
      )}

      {activeHerramienta && view === 'herramienta_activa' && !herramientaCompletada && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setView('herramientas') }} style={{ background: 'transparent', border: 'none', color: '#a8a8a8', fontSize: 14, cursor: 'pointer' }}>← Salir</button>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase' }}>{herramientaStep + 1} / {(activeHerramienta.pasos?.length || 0) + 1}</div>
          </div>
          <div style={{ padding: '0 24px 32px' }}><div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: 12, height: 4, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg, #d4af37, #f5c842)', height: '100%', width: `${((herramientaStep + 1) / ((activeHerramienta.pasos?.length || 1) + 1)) * 100}%`, transition: 'width 0.4s ease' }} /></div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 40px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>{activeHerramienta.titulo}</div>
            {herramientaStep < (activeHerramienta.pasos?.length || 0) ? (
              <>
                {herramientaStep === 0 && activeHerramienta.descripcion && (<p style={{ fontSize: 14, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 24, textAlign: 'center', fontStyle: 'italic' }}>{activeHerramienta.descripcion}</p>)}
                <div style={{ background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 28, marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Paso {herramientaStep + 1}</div>
                  <p style={{ fontSize: 17, lineHeight: 1.7, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 300 }}>{activeHerramienta.pasos?.[herramientaStep]}</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {herramientaStep > 0 && (<button onClick={() => setHerramientaStep(herramientaStep - 1)} style={{ flex: 1, background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Anterior</button>)}
                  <button onClick={() => setHerramientaStep(herramientaStep + 1)} style={{ flex: 1, background: 'linear-gradient(135deg, #d4af37, #f5c842)', color: '#0a0a0a', border: 'none', padding: '16px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{herramientaStep + 1 < (activeHerramienta.pasos?.length || 1) ? 'Siguiente →' : 'Reflexión final →'}</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>✦ Tu reflexión</div>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: '#fff', marginBottom: 20, fontFamily: 'Georgia, serif', fontWeight: 300 }}>¿Qué se te abrió al hacer este ejercicio? ¿Qué notaste? ¿Qué te llevas?</p>
                  <textarea value={herramientaReflexion} onChange={(e) => setHerramientaReflexion(e.target.value)} placeholder="Escribe lo que necesites soltar..." style={{ width: '100%', minHeight: 140, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <button onClick={completeHerramienta} disabled={!herramientaReflexion.trim()} style={{ width: '100%', background: herramientaReflexion.trim() ? 'linear-gradient(135deg, #d4af37, #f5c842)' : 'rgba(212, 175, 55, 0.2)', color: herramientaReflexion.trim() ? '#0a0a0a' : '#a8a8a8', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: herramientaReflexion.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>Completar ✦</button>
              </>
            )}
          </div>
        </div>
      )}

      {activeHerramienta && herramientaCompletada && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, #0a0a0a 60%)', zIndex: 1000, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✦</div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Completaste</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, color: '#fff', marginBottom: 16 }}>{activeHerramienta.titulo}</h1>
            <p style={{ fontSize: 16, color: '#d4d4d4', lineHeight: 1.6, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Tu reflexión quedó guardada. Puedes volver a ella cuando necesites recordar este momento.</p>
            <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 6 }}>+10 puntos</div>
              <div style={{ fontSize: 13, color: '#a8a8a8' }}>Cada herramienta completada te acerca a tu siguiente nivel</div>
            </div>
            <button onClick={() => { const prompt = `Acabo de completar la herramienta "${activeHerramienta.titulo}" y mi reflexión fue: "${herramientaReflexion}". Me gustaría conversar contigo sobre lo que se me abrió.`; setChatMsgs([{ r: 'u', t: prompt }]); setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('clara') }} style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f5c842)', color: '#0a0a0a', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>Conversar con {coach.name} sobre esto →</button>
            <button onClick={() => { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('herramientas') }} style={{ width: '100%', background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Volver a herramientas</button>
          </div>
        </div>
      )}

      {view === 'equilibrio' && !activeTest && (
        <div>
          <Header title="Mi Equilibrio ✦" subtitle={habitosUsuario.length > 0 ? 'Tus hábitos de hoy' : 'Configura tu bienestar'} />

          {/* Modo configuración (primera vez o reconfigurar) */}
          {(configurandoHabitos || habitosUsuario.length === 0) && (
            <div style={{ padding: '20px' }}>
              {!configurandoHabitos && habitosUsuario.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20 }}>
                    Tu bienestar se construye con hábitos propios. Elige los que quieres cultivar en cada dimensión y nosotras te acompañamos.
                  </p>
                  <button className="btn-primary" onClick={iniciarConfiguracion}>Empezar ✦</button>
                </div>
              )}

              {configurandoHabitos && (() => {
                const dim = dimensiones[configDimension]
                const seleccionados = habitosSeleccionados[dim.key] || []
                const sugerencias = habitosSugeridos[dim.key] || []
                return (
                  <div>
                    {/* Progress */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                      {dimensiones.map((d, i) => (
                        <div key={d.key} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= configDimension ? d.color : '#e0dbd4', transition: 'all 0.3s' }} />
                      ))}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: dim.color, margin: '0 auto 8px' }} />
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 6 }}>{dim.label}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-light)' }}>¿Qué hábitos quieres cultivar?</p>
                    </div>

                    {/* Sugerencias */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {sugerencias.map(h => {
                        const isSelected = seleccionados.find(s => s.nombre === h)
                        return (
                          <button key={h} onClick={() => toggleHabitoSeleccionado(dim.key, h)} style={{
                            padding: '10px 14px', borderRadius: 20, border: `1.5px solid ${isSelected ? dim.color : '#e0dbd4'}`,
                            background: isSelected ? `${dim.color}15` : '#fff', color: isSelected ? dim.color : 'var(--text)',
                            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: isSelected ? 600 : 400, transition: 'all 0.2s'
                          }}>
                            {isSelected && '✓ '}{h}
                          </button>
                        )
                      })}
                    </div>

                    {/* Agregar propio */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                      <input type="text" value={nuevoHabito} onChange={(e) => setNuevoHabito(e.target.value)}
                        placeholder="Agregar hábito propio..." className="input-field" style={{ flex: 1, fontSize: 13 }}
                        onKeyDown={(e) => e.key === 'Enter' && agregarHabitoPropio(dim.key)} />
                      <button onClick={() => agregarHabitoPropio(dim.key)} style={{
                        padding: '0 16px', borderRadius: 12, border: 'none', background: dim.color, color: '#fff', fontSize: 18, cursor: 'pointer'
                      }}>+</button>
                    </div>

                    {/* Días por hábito seleccionado */}
                    {seleccionados.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Tus hábitos de {dim.label.toLowerCase()}</p>
                        {seleccionados.map(h => (
                          <div key={h.nombre} className="card" style={{ marginBottom: 10, padding: 14 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{h.nombre}</p>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {diasSemana.map((d, i) => {
                                const diaNum = i + 1
                                const activo = h.dias.includes(diaNum)
                                return (
                                  <button key={i} onClick={() => toggleDiaHabito(dim.key, h.nombre, diaNum)} style={{
                                    flex: 1, height: 32, borderRadius: 8, border: 'none',
                                    background: activo ? dim.color : '#f0ebe3', color: activo ? '#fff' : 'var(--text-light)',
                                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                                  }}>{d}</button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Navegación */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      {configDimension > 0 && (
                        <button className="btn-secondary" onClick={() => setConfigDimension(configDimension - 1)} style={{ flex: 1 }}>← Anterior</button>
                      )}
                      {configDimension < dimensiones.length - 1 ? (
                        <button className="btn-primary" onClick={() => setConfigDimension(configDimension + 1)} style={{ flex: 1 }}>Siguiente →</button>
                      ) : (
                        <button className="btn-primary" onClick={guardarHabitos} style={{ flex: 1 }}>Guardar ✦</button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Modo tracking diario (ya configuró) */}
          {!configurandoHabitos && habitosUsuario.length > 0 && (
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.5 }}>
                Marca los hábitos que completaste hoy. Cada uno suma puntos a tu progreso.
              </p>

              {dimensiones.map(d => {
                const habitosDim = habitosUsuario.filter(h => h.dimension === d.key)
                if (habitosDim.length === 0) return null
                const completadosDim = habitosDim.filter(h => habitosCompletados.includes(h.id)).length
                const porcentaje = habitosDim.length > 0 ? (completadosDim / habitosDim.length) * 100 : 0

                return (
                  <div key={d.key} className="card" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{d.label}</p>
                      </div>
                      <p style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{completadosDim}/{habitosDim.length}</p>
                    </div>
                    <div style={{ background: '#f0ebe3', borderRadius: 12, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ background: d.color, height: '100%', width: `${porcentaje}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    {habitosDim.map(h => {
                      const completado = habitosCompletados.includes(h.id)
                      return (
                        <button key={h.id} onClick={() => toggleHabitoCompletado(h.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                          padding: '10px 12px', marginBottom: 6, borderRadius: 10,
                          background: completado ? `${d.color}12` : 'transparent',
                          border: `1px solid ${completado ? d.color + '40' : '#e0dbd4'}`,
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s'
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            border: `2px solid ${completado ? d.color : '#c0b8ab'}`,
                            background: completado ? d.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0
                          }}>{completado && '✓'}</div>
                          <span style={{ fontSize: 14, color: completado ? d.color : 'var(--text)', fontWeight: completado ? 600 : 400, textDecoration: completado ? 'line-through' : 'none' }}>
                            {h.nombre}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}

              <button onClick={iniciarConfiguracion} style={{
                width: '100%', background: 'transparent', color: 'var(--gold)', border: '1px dashed var(--gold)',
                padding: '12px', borderRadius: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16
              }}>
                + Reconfigurar mis hábitos
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'clara' && !activeTest && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '48px 20px 12px', borderBottom: '1px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '4px 8px' }}>←</button>
            <img src={coach.photo} alt={coach.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{coach.name} ✦</h2><p style={{ fontSize: 11, color: 'var(--text-light)', margin: 0 }}>{coach.credential}</p></div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMsgs.map((m, i) => (<div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.r === 'u' ? 'flex-end' : 'flex-start', maxWidth: '85%', flexDirection: m.r === 'u' ? 'row-reverse' : 'row' }}>{m.r === 'a' && <img src={coach.photo} alt={coach.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 4, flexShrink: 0 }} />}<div style={{ padding: '12px 16px', borderRadius: m.r === 'u' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.r === 'u' ? 'var(--dark)' : '#fff', color: m.r === 'u' ? '#fff' : 'var(--text)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', boxShadow: m.r === 'a' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>{m.t}</div></div>))}
            {typing && (<div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}><img src={coach.photo} alt={coach.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 4 }} /><div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#fff', color: 'var(--text-light)', fontSize: 14 }}>{coach.name} está pensando ✦</div></div>)}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px 20px 32px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: '12px 16px', borderRadius: 12, border: 'none', background: isRecording ? '#c53030' : 'var(--warm-dark)', color: isRecording ? '#fff' : 'var(--text)', fontSize: 18, cursor: 'pointer', transition: 'all 0.2s' }}>{isRecording ? '◼' : '🎙'}</button>
            <input className="input-field" placeholder={`Escríbele a ${coach.name}...`} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1 }} />
            <button onClick={sendMessage} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'var(--dark)', color: '#fff', fontSize: 16 }}>→</button>
          </div>
        </div>
      )}

      {view === 'tests' && !activeTest && (
        <div>
          <Header title="Tests ✦" subtitle="Descubre más sobre ti misma" showBack={false} />
          <div style={{ padding: '20px' }}>
            {tests.map(t => (<div key={t.id} className="card" style={{ marginBottom: 10, cursor: canAccess(t.plan_requerido) ? 'pointer' : 'default' }} onClick={() => canAccess(t.plan_requerido) && startTest(t)}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p></div>{!canAccess(t.plan_requerido) ? (<span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>) : <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>}</div></div>))}
          </div>
        </div>
      )}

      {view === 'herramientas' && !activeHerramienta && (
        <div>
          <Header title="Herramientas ✦" subtitle="Ejercicios prácticos con neurociencia" showBack={false} />
          <div style={{ padding: '20px' }}>
            {herramientas.map(h => (<div key={h.id} className="card" style={{ marginBottom: 10, cursor: canAccess(h.plan_requerido) ? 'pointer' : 'default' }} onClick={() => { if (canAccess(h.plan_requerido)) { startHerramienta(h) } }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{h.titulo}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{h.categoria} · {h.pasos?.length || 0} pasos</p></div>{!canAccess(h.plan_requerido) ? (<span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>) : <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>}</div></div>))}
          </div>
        </div>
      )}

      {view === 'perfil' && !activeTest && (
        <div>
          <Header title="Tu Perfil ✦" showBack={false} />
          <div style={{ padding: '20px' }}>
            <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'var(--font-display)', margin: '0 auto 12px' }}>{nombre[0].toUpperCase()}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{nombre}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{user?.email}</p>
              <p style={{ display: 'inline-block', marginTop: 8, fontSize: 12, background: 'var(--warm-dark)', padding: '4px 12px', borderRadius: 8, color: 'var(--gold)', fontWeight: 600, textTransform: 'capitalize' }}>Plan {plan}</p>
            </div>
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
              <img src={coach.photo} alt={coach.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              <div><p style={{ fontWeight: 600, fontSize: 14 }}>Tu coach: {coach.name}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{coach.credential}</p></div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[{ label: 'Racha actual', val: perfil?.racha_dias || 0 }, { label: 'Mejor racha', val: perfil?.mejor_racha || 0 }, { label: 'Nivel', val: perfil?.nivel || 1 }, { label: 'Puntos', val: perfil?.puntos_totales || 0 }].map(s => (<div key={s.label} style={{ textAlign: 'center' }}><p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{s.label}</p></div>))}
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('planes')} style={{ marginBottom: 12 }}>Cambiar plan</button>
            <button className="btn-secondary" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* === MODAL STATS INTERACTIVAS === */}
      {statModal && (() => {
        const racha = perfil?.racha_dias || 0
        const mejorRacha = perfil?.mejor_racha || 0
        const nivel = perfil?.nivel || 1
        const puntos = perfil?.puntos_totales || 0
        const niveles = [
          { n: 1, nombre: 'Exploradora', min: 0, max: 100 },
          { n: 2, nombre: 'Buscadora', min: 100, max: 300 },
          { n: 3, nombre: 'Descubridora', min: 300, max: 600 },
          { n: 4, nombre: 'Reveladora', min: 600, max: 1000 },
          { n: 5, nombre: 'Transformadora', min: 1000, max: 1500 },
          { n: 6, nombre: 'Creadora', min: 1500, max: 2200 },
          { n: 7, nombre: 'Guía', min: 2200, max: 3000 },
          { n: 8, nombre: 'Maestra', min: 3000, max: Infinity },
        ]
        const nivelActual = niveles[Math.min(nivel - 1, niveles.length - 1)]
        const siguienteNivel = niveles[Math.min(nivel, niveles.length - 1)]
        const progresoNivel = nivelActual.max === Infinity ? 100 : ((puntos - nivelActual.min) / (nivelActual.max - nivelActual.min)) * 100

        return (
          <div onClick={() => setStatModal(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center',
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)',
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
              padding: '24px 24px 40px', border: '1px solid rgba(212, 175, 55, 0.25)',
              borderBottom: 'none',
            }}>
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, margin: '0 auto 24px' }} />

              {statModal === 'racha' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tu racha</div>
                    <div style={{ fontSize: 72, fontFamily: 'Georgia, serif', fontWeight: 300, color: '#d4af37', lineHeight: 1 }}>{racha}</div>
                    <div style={{ fontSize: 14, color: '#a8a8a8', marginTop: 4 }}>días consecutivos</div>
                  </div>

                  <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Tu mejor racha</div>
                    <div style={{ fontSize: 28, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 300 }}>{mejorRacha} días</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Rachas que puedes completar</div>
                    {[
                      { dias: 3, nombre: 'Primer impulso', completado: racha >= 3 },
                      { dias: 7, nombre: 'Una semana', completado: racha >= 7 },
                      { dias: 14, nombre: 'Consistencia', completado: racha >= 14 },
                      { dias: 30, nombre: 'Un mes entero', completado: racha >= 30 },
                      { dias: 60, nombre: 'Transformación', completado: racha >= 60 },
                      { dias: 100, nombre: 'Leyenda', completado: racha >= 100 },
                    ].map(r => (
                      <div key={r.dias} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: `2px solid ${r.completado ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
                            background: r.completado ? '#d4af37' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: r.completado ? '#0a0a0a' : '#666', fontSize: 12, fontWeight: 700,
                          }}>{r.completado ? '✓' : r.dias}</div>
                          <span style={{ color: r.completado ? '#fff' : '#a8a8a8', fontSize: 14 }}>{r.nombre}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#666' }}>{r.dias} días</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, textAlign: 'center', marginTop: 16 }}>
                    Tu racha crece cada día que haces check-in, completas un hábito, una herramienta o conversas con tu coach.
                  </p>
                </>
              )}

              {statModal === 'nivel' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tu nivel</div>
                    <div style={{ fontSize: 72, fontFamily: 'Georgia, serif', fontWeight: 300, color: '#d4af37', lineHeight: 1 }}>{nivel}</div>
                    <div style={{ fontSize: 18, color: '#fff', marginTop: 8, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{nivelActual.nombre}</div>
                  </div>

                  {nivelActual.max !== Infinity && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: '#a8a8a8' }}>Progreso al siguiente nivel</span>
                        <span style={{ fontSize: 12, color: '#d4af37', fontWeight: 600 }}>{puntos} / {nivelActual.max}</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, height: 8, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(90deg, #d4af37, #f5c842)', height: '100%', width: `${Math.min(progresoNivel, 100)}%`, transition: 'width 0.5s' }} />
                      </div>
                      <p style={{ fontSize: 12, color: '#a8a8a8', marginTop: 12, lineHeight: 1.5 }}>
                        Te faltan <strong style={{ color: '#d4af37' }}>{nivelActual.max - puntos} puntos</strong> para ser <em style={{ color: '#fff' }}>{siguienteNivel.nombre}</em>
                      </p>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Todos los niveles</div>
                    {niveles.map(n => (
                      <div key={n.n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: n.n <= nivel ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: n.n <= nivel ? '#d4af37' : 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: n.n <= nivel ? '#0a0a0a' : '#666', fontSize: 12, fontWeight: 700,
                          }}>{n.n}</div>
                          <span style={{ color: '#fff', fontSize: 14, fontStyle: n.n === nivel ? 'italic' : 'normal' }}>{n.nombre}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#666' }}>{n.min}{n.max !== Infinity ? `-${n.max}` : '+'} pts</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {statModal === 'puntos' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tus puntos</div>
                    <div style={{ fontSize: 72, fontFamily: 'Georgia, serif', fontWeight: 300, color: '#d4af37', lineHeight: 1 }}>{puntos}</div>
                    <div style={{ fontSize: 14, color: '#a8a8a8', marginTop: 4 }}>puntos totales</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Cómo ganar puntos</div>
                    {[
                      { accion: 'Check-in diario', puntos: 5 },
                      { accion: 'Completar un hábito', puntos: 3 },
                      { accion: 'Hacer un test', puntos: 20 },
                      { accion: 'Completar una herramienta', puntos: 15 },
                      { accion: 'Conversar con tu coach', puntos: 5 },
                      { accion: 'Completar una lección de módulo', puntos: 10 },
                      { accion: 'Racha de 7 días', puntos: 30 },
                      { accion: 'Racha de 30 días', puntos: 100 },
                    ].map(a => (
                      <div key={a.accion} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#e5e5e5', fontSize: 14 }}>{a.accion}</span>
                        <span style={{ color: '#d4af37', fontSize: 13, fontWeight: 600 }}>+{a.puntos}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, textAlign: 'center', marginTop: 16 }}>
                    Los puntos reflejan tu compromiso contigo misma. No compiten con nadie — solo contigo misma.
                  </p>
                </>
              )}

              <button onClick={() => setStatModal(null)} style={{
                width: '100%', background: 'transparent', color: '#a8a8a8',
                border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px',
                borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                marginTop: 20,
              }}>Cerrar</button>
            </div>
          </div>
        )
      })()}

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
