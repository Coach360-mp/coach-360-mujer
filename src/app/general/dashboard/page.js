'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const leo = {
  name: 'Leo',
  credential: 'El Mentor Estratégico',
  desc: 'Directo, desafiante, enfocado en acción. Te acompaña a construir los hábitos que cambian todo.',
  color: '#14b8a6',
  colorSecondary: '#0d9488',
  colorBg: 'rgba(20, 184, 166, 0.08)',
  colorBorder: 'rgba(20, 184, 166, 0.3)',
}

const dimensiones = [
  { key: 'mente', label: 'Mente', desc: '¿Alimentaste tu enfoque hoy?', color: '#6366f1' },
  { key: 'cuerpo', label: 'Cuerpo', desc: '¿Moviste tu cuerpo?', color: '#10b981' },
  { key: 'corazon', label: 'Relaciones', desc: '¿Conectaste con alguien?', color: '#f59e0b' },
  { key: 'espiritu', label: 'Propósito', desc: '¿Trabajaste en lo importante?', color: '#8b5cf6' },
]

const animos = [
  { label: 'Difícil', value: 1 },
  { label: 'Regular', value: 2 },
  { label: 'Bien', value: 3 },
  { label: 'Muy bien', value: 4 },
  { label: 'En fuego', value: 5 },
]

const habitosSugeridos = {
  mente: ['Leer 30 minutos', 'Deep work 90 min', 'Meditar', 'Aprender algo técnico', 'Desconexión digital', 'Journaling', 'Podcast formativo', 'Revisar metas'],
  cuerpo: ['Gimnasio', 'Correr', 'HIIT', 'Caminar 10k pasos', 'Ayuno intermitente', 'Dormir 7+ horas', 'Hidratación', 'Estiramiento'],
  corazon: ['Llamar a alguien', 'Networking 1:1', 'Quality time familia', 'Mensaje intencional', 'Practicar agradecimiento', 'Pedir feedback', 'Resolver un conflicto', 'Mentoría'],
  espiritu: ['Revisar objetivos', 'Trabajar en el proyecto importante', 'Planificar el día', 'Review semanal', 'Lectura inspiradora', 'Momento de claridad', 'Reflexión estratégica', 'Decisión difícil'],
}

const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function DashboardGeneral() {
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
  const [habitosUsuario, setHabitosUsuario] = useState([])
  const [habitosCompletados, setHabitosCompletados] = useState([])
  const [configurandoHabitos, setConfigurandoHabitos] = useState(false)
  const [configDimension, setConfigDimension] = useState(0)
  const [habitosSeleccionados, setHabitosSeleccionados] = useState({ mente: [], cuerpo: [], corazon: [], espiritu: [] })
  const [nuevoHabito, setNuevoHabito] = useState('')
  const [statModal, setStatModal] = useState(null)
  const [pricing, setPricing] = useState(null)

  const chatEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs, typing])
  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/general'); return }
    setUser(user)

    const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    setPerfil(profile)

    // Verificar si hizo el onboarding de general
    const { data: onboarding } = await supabase
      .from('onboarding_respuestas')
      .select('id')
      .eq('user_id', user.id)
      .eq('vertical', 'general')
      .maybeSingle()

    if (!onboarding) {
      router.push('/general/onboarding')
      return
    }

    setChatMsgs([{ r: 'a', t: `Hola, ${profile?.nombre || 'bienvenido'}.\n\nSoy Leo. Voy directo al grano: no estoy aquí para escucharte quejarte — estoy aquí para ayudarte a actuar.\n\n¿Qué tienes entre manos hoy?` }])

    // Cargar tests, herramientas, módulos filtrados por vertical general
    // Si no existe la columna vertical todavía, carga todo
    const { data: t } = await supabase.from('tests').select('*').eq('activo', true).order('orden')
    const { data: h } = await supabase.from('templates').select('*').eq('activo', true).order('orden')
    const { data: m } = await supabase.from('modulos').select('*').eq('activo', true).order('orden')
    if (t) setTests(t)
    if (h) setHerramientas(h)
    if (m) setModulos(m)

    // Hábitos del día
    const hoy = new Date().toISOString().split('T')[0]
    const { data: hab } = await supabase.from('habitos_usuario').select('*').eq('user_id', user.id).eq('activo', true)
    const { data: hcomp } = await supabase.from('habitos_completados').select('*').eq('user_id', user.id).eq('fecha', hoy)
    if (hab) setHabitosUsuario(hab)
    if (hcomp) setHabitosCompletados(hcomp.map(c => c.habito_id))

    // Cargar precios según país
    try {
      const resPricing = await fetch(`/api/pricing?userId=${user.id}`)
      const dataPricing = await resPricing.json()
      if (dataPricing && !dataPricing.error) setPricing(dataPricing)
    } catch (err) { console.error('Error cargando pricing:', err) }

    setLoading(false)
  }

  const handleCheckout = async (planId) => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, userId: user.id, userEmail: user.email, vertical: 'general' }) })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
    } catch (err) { console.error('Checkout error:', err) }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/general') }
  const navigate = (newView) => { setPrevView(view); setView(newView) }
  const goBack = () => {
    if (activeTest && !testResult) { setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (testResult) { setTestResult(null); setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (activeHerramienta) { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('herramientas'); return }
    if (prevView) { setView(prevView); setPrevView(null) }
    else { setView('inicio') }
  }

  const sumarPuntos = async (accion, puntos, descripcion = null) => {
    if (!user) return
    try {
      const { data } = await supabase.rpc('sumar_puntos', {
        p_user_id: user.id, p_accion: accion, p_puntos: puntos, p_descripcion: descripcion,
      })
      if (data) {
        setPerfil(prev => ({
          ...prev,
          puntos_totales: data.puntos_totales,
          nivel: data.nivel,
          racha_dias: data.racha_dias,
          mejor_racha: Math.max(prev?.mejor_racha || 0, data.racha_dias),
        }))
      }
    } catch (err) { console.error('Error sumando puntos:', err) }
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
      const resultado = { nombre: 'Resultado', descLarga: 'Tu resultado está listo. Leo te va a ayudar a interpretarlo.' }
      setTestResult(resultado)
      if (user) {
        await supabase.from('resultados_test').insert({ usuario_id: user.id, test_id: activeTest.id, puntaje_total: newAnswers.reduce((a, b) => a + b, 0), perfil_resultado: resultado.nombre, respuestas: newAnswers })
        await sumarPuntos('test_completado', 20, `Test: ${activeTest.titulo}`)
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
        await sumarPuntos('herramienta_completada', 15, `Herramienta: ${activeHerramienta.titulo}`)
      } catch (err) { console.error('Error:', err) }
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
      const res = await fetch('/api/chat-general', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, userId: user?.id }) })
      const data = await res.json()
      setTyping(false)
      const reply = data.reply || 'Cuéntame más.'
      setChatMsgs(prev => [...prev, { r: 'a', t: reply }])
      const mensajesDelUsuario = chatMsgs.filter(m => m.r === 'u').length
      if (mensajesDelUsuario === 0) { sumarPuntos('conversacion_coach', 5, `Conversación con Leo`) }
    } catch {
      setTyping(false)
      setChatMsgs(prev => [...prev, { r: 'a', t: 'Hubo un error. Intenta de nuevo.' }])
    }
  }

  const toggleHabitoSeleccionado = (dim, habito) => {
    setHabitosSeleccionados(prev => {
      const actuales = prev[dim] || []
      const existe = actuales.find(h => h.nombre === habito)
      if (existe) return { ...prev, [dim]: actuales.filter(h => h.nombre !== habito) }
      return { ...prev, [dim]: [...actuales, { nombre: habito, dias: [1,2,3,4,5,6,7], horario: null }] }
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
      const habito = habitosUsuario.find(h => h.id === habitoId)
      await sumarPuntos('habito_completado', 3, habito ? `Hábito: ${habito.nombre}` : 'Hábito')
    }
  }

  const iniciarConfiguracion = () => {
    setConfigurandoHabitos(true)
    setConfigDimension(0)
    setHabitosSeleccionados({ mente: [], cuerpo: [], corazon: [], espiritu: [] })
  }

  if (loading) return (<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}><p style={{ color: '#14b8a6' }}>Cargando ✦</p></div>)

  const nombre = perfil?.nombre || user?.user_metadata?.full_name || 'Bienvenido'

  const Header = ({ title, subtitle, showBack = true }) => (
    <div style={{ padding: '48px 20px 16px', background: '#042f2e', borderBottom: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
      {showBack && <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#fff', padding: '4px 8px' }}>←</button>}
      <div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, margin: 0, color: '#fff' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: '#a8a8a8', margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #042f2e 0%, #0a0a0a 100%)', color: '#fff', paddingBottom: 80, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {view === 'inicio' && (
        <div style={{ padding: '48px 20px 20px' }}>
          <p style={{ fontSize: 14, color: '#a8a8a8' }}>Hola,</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, marginBottom: 20, color: '#fff' }}>{nombre} ✦</h1>

          {!checkinDone ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#fff' }}>¿Cómo empezaste el día?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                {animos.map(a => (
                  <button key={a.value} onClick={() => { setAnimoHoy(a.value); setCheckinDone(true); sumarPuntos('checkin', 5, `Check-in: ${a.label}`) }} style={{
                    background: animoHoy === a.value ? '#14b8a6' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(20,184,166,0.2)', borderRadius: 12, padding: '10px 14px', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: '#fff', transition: 'all 0.2s', fontFamily: 'inherit'
                  }}>{a.label}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: 16, padding: 16, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#14b8a6' }}>Check-in completado ✦</p>
            </div>
          )}

          {/* Leo card */}
          <div onClick={() => navigate('clara')} style={{
            background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))',
            border: '1px solid rgba(20,184,166,0.3)', borderRadius: 16, padding: 20,
            marginBottom: 16, cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'center'
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 600, flexShrink: 0 }}>L</div>
            <div>
              <p style={{ fontSize: 11, color: '#14b8a6', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{leo.credential}</p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#fff', marginBottom: 4 }}>Habla con Leo</h3>
              <p style={{ fontSize: 12, color: '#a8a8a8' }}>Tu mentor estratégico ✦</p>
            </div>
          </div>

          <div onClick={() => navigate('equilibrio')} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 20, marginBottom: 20, cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, margin: 0, color: '#fff' }}>Tus hábitos</h3>
              <span style={{ fontSize: 14, color: '#14b8a6' }}>→</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {dimensiones.map(d => (
                <div key={d.key} style={{ textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, margin: '0 auto 6px' }} />
                  <p style={{ fontSize: 10, color: '#a8a8a8' }}>{d.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Racha', val: perfil?.racha_dias || 0, key: 'racha' },
              { label: 'Nivel', val: perfil?.nivel || 1, key: 'nivel' },
              { label: 'Puntos', val: perfil?.puntos_totales || 0, key: 'puntos' }
            ].map(s => (
              <div key={s.label} onClick={() => setStatModal(s.key)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(20,184,166,0.15)',
                borderRadius: 16, padding: 16, textAlign: 'center', cursor: 'pointer'
              }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#14b8a6' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: '#a8a8a8' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {tests.length > 0 && (
            <>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 12, color: '#fff' }}>Tests</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {tests.slice(0, 3).map(t => (
                  <div key={t.id} onClick={() => startTest(t)} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: 16, cursor: 'pointer'
                  }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{t.titulo}</p>
                    <p style={{ fontSize: 12, color: '#a8a8a8' }}>{t.numero_preguntas} preguntas · {t.categoria}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat con Leo */}
      {view === 'clara' && !activeTest && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '48px 20px 12px', borderBottom: '1px solid rgba(20,184,166,0.2)', background: '#042f2e', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#fff', padding: '4px 8px' }}>←</button>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 600 }}>L</div>
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, margin: 0, color: '#fff' }}>Leo ✦</h2>
              <p style={{ fontSize: 11, color: '#a8a8a8', margin: 0 }}>{leo.credential}</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.r === 'u' ? 'flex-end' : 'flex-start', maxWidth: '85%', flexDirection: m.r === 'u' ? 'row-reverse' : 'row' }}>
                {m.r === 'a' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 600, marginTop: 4, flexShrink: 0 }}>L</div>}
                <div style={{
                  padding: '12px 16px', borderRadius: m.r === 'u' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.r === 'u' ? '#14b8a6' : 'rgba(255,255,255,0.06)', color: '#fff',
                  fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap'
                }}>{m.t}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, marginTop: 4 }}>L</div>
                <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.06)', color: '#a8a8a8', fontSize: 14 }}>
                  Leo está pensando ✦
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px 20px 32px', background: '#042f2e', borderTop: '1px solid rgba(20,184,166,0.2)', display: 'flex', gap: 8 }}>
            <input placeholder="Escríbele a Leo..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(20,184,166,0.3)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
            <button onClick={sendMessage} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', fontSize: 16, cursor: 'pointer' }}>→</button>
          </div>
        </div>
      )}

      {/* Mi Equilibrio / Hábitos */}
      {view === 'equilibrio' && !activeTest && (
        <div>
          <Header title="Tus hábitos ✦" subtitle={habitosUsuario.length > 0 ? 'Lo que estás cultivando' : 'Configura tu sistema'} />

          {(configurandoHabitos || habitosUsuario.length === 0) && (
            <div style={{ padding: '20px' }}>
              {!configurandoHabitos && habitosUsuario.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
                  <p style={{ fontSize: 14, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 20 }}>
                    Leo construye resultados con hábitos. Elige pocos y específicos — mejor cumplir 3 que fallar en 10.
                  </p>
                  <button onClick={iniciarConfiguracion} style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Configurar mis hábitos ✦</button>
                </div>
              )}

              {configurandoHabitos && (() => {
                const dim = dimensiones[configDimension]
                const seleccionados = habitosSeleccionados[dim.key] || []
                const sugerencias = habitosSugeridos[dim.key] || []
                return (
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                      {dimensiones.map((d, i) => (
                        <div key={d.key} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= configDimension ? d.color : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                      ))}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: dim.color, margin: '0 auto 8px' }} />
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 26, marginBottom: 6, color: '#fff' }}>{dim.label}</h3>
                      <p style={{ fontSize: 13, color: '#a8a8a8' }}>¿Qué hábitos vas a cultivar?</p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {sugerencias.map(h => {
                        const isSelected = seleccionados.find(s => s.nombre === h)
                        return (
                          <button key={h} onClick={() => toggleHabitoSeleccionado(dim.key, h)} style={{
                            padding: '10px 14px', borderRadius: 20,
                            border: `1.5px solid ${isSelected ? dim.color : 'rgba(255,255,255,0.15)'}`,
                            background: isSelected ? `${dim.color}25` : 'rgba(255,255,255,0.03)',
                            color: isSelected ? dim.color : '#c8c8c8',
                            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                            fontWeight: isSelected ? 600 : 400, transition: 'all 0.2s'
                          }}>{isSelected && '✓ '}{h}</button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                      <input type="text" value={nuevoHabito} onChange={(e) => setNuevoHabito(e.target.value)}
                        placeholder="Agregar hábito propio..."
                        style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                        onKeyDown={(e) => e.key === 'Enter' && agregarHabitoPropio(dim.key)} />
                      <button onClick={() => agregarHabitoPropio(dim.key)} style={{ padding: '0 16px', borderRadius: 12, border: 'none', background: dim.color, color: '#fff', fontSize: 18, cursor: 'pointer' }}>+</button>
                    </div>

                    {seleccionados.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: '#a8a8a8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Tus hábitos de {dim.label.toLowerCase()}</p>
                        {seleccionados.map(h => (
                          <div key={h.nombre} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#fff' }}>{h.nombre}</p>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {diasSemana.map((d, i) => {
                                const diaNum = i + 1
                                const activo = h.dias.includes(diaNum)
                                return (
                                  <button key={i} onClick={() => toggleDiaHabito(dim.key, h.nombre, diaNum)} style={{
                                    flex: 1, height: 32, borderRadius: 8, border: 'none',
                                    background: activo ? dim.color : 'rgba(255,255,255,0.06)',
                                    color: activo ? '#fff' : '#666',
                                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                                  }}>{d}</button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                      {configDimension > 0 && (
                        <button onClick={() => setConfigDimension(configDimension - 1)} style={{ flex: 1, background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Anterior</button>
                      )}
                      {configDimension < dimensiones.length - 1 ? (
                        <button onClick={() => setConfigDimension(configDimension + 1)} style={{ flex: 1, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Siguiente →</button>
                      ) : (
                        <button onClick={guardarHabitos} style={{ flex: 1, background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Guardar ✦</button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {!configurandoHabitos && habitosUsuario.length > 0 && (
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: 13, color: '#a8a8a8', marginBottom: 20, lineHeight: 1.5 }}>
                Marca lo que completaste hoy. Cada hábito suma +3 puntos.
              </p>
              {dimensiones.map(d => {
                const habitosDim = habitosUsuario.filter(h => h.dimension === d.key)
                if (habitosDim.length === 0) return null
                const completadosDim = habitosDim.filter(h => habitosCompletados.includes(h.id)).length
                const porcentaje = (completadosDim / habitosDim.length) * 100
                return (
                  <div key={d.key} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                        <p style={{ fontWeight: 600, fontSize: 15, color: '#fff' }}>{d.label}</p>
                      </div>
                      <p style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{completadosDim}/{habitosDim.length}</p>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ background: d.color, height: '100%', width: `${porcentaje}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    {habitosDim.map(h => {
                      const completado = habitosCompletados.includes(h.id)
                      return (
                        <button key={h.id} onClick={() => toggleHabitoCompletado(h.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                          padding: '10px 12px', marginBottom: 6, borderRadius: 10,
                          background: completado ? `${d.color}15` : 'transparent',
                          border: `1px solid ${completado ? d.color + '40' : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s'
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            border: `2px solid ${completado ? d.color : 'rgba(255,255,255,0.3)'}`,
                            background: completado ? d.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0
                          }}>{completado && '✓'}</div>
                          <span style={{ fontSize: 14, color: completado ? d.color : '#c8c8c8', fontWeight: completado ? 600 : 400, textDecoration: completado ? 'line-through' : 'none' }}>
                            {h.nombre}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
              <button onClick={iniciarConfiguracion} style={{ width: '100%', background: 'transparent', color: '#14b8a6', border: '1px dashed #14b8a6', padding: '12px', borderRadius: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16 }}>+ Reconfigurar hábitos</button>
            </div>
          )}
        </div>
      )}

      {/* Tests list */}
      {view === 'tests' && !activeTest && (
        <div>
          <Header title="Tests ✦" subtitle="Descubre patrones en tu forma de actuar" showBack={false} />
          <div style={{ padding: '20px' }}>
            {tests.length === 0 ? (
              <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', padding: 40 }}>Próximamente: tests específicos para Coach 360 General</p>
            ) : tests.map(t => (
              <div key={t.id} onClick={() => startTest(t)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{t.titulo}</p>
                    <p style={{ fontSize: 12, color: '#a8a8a8' }}>{t.numero_preguntas} preguntas · {t.categoria}</p>
                  </div>
                  <span style={{ fontSize: 14, color: '#14b8a6' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Herramientas list */}
      {view === 'herramientas' && !activeHerramienta && (
        <div>
          <Header title="Herramientas ✦" subtitle="Ejercicios prácticos" showBack={false} />
          <div style={{ padding: '20px' }}>
            {herramientas.length === 0 ? (
              <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', padding: 40 }}>Próximamente: herramientas específicas para Coach 360 General</p>
            ) : herramientas.map(h => (
              <div key={h.id} onClick={() => startHerramienta(h)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{h.titulo}</p>
                    <p style={{ fontSize: 12, color: '#a8a8a8' }}>{h.categoria} · {h.pasos?.length || 0} pasos</p>
                  </div>
                  <span style={{ fontSize: 14, color: '#14b8a6' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perfil */}
      {view === 'perfil' && !activeTest && (
        <div>
          <Header title="Tu Perfil ✦" showBack={false} />
          <div style={{ padding: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'Georgia, serif', margin: '0 auto 12px' }}>
                {nombre[0].toUpperCase()}
              </div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#fff' }}>{nombre}</h3>
              <p style={{ fontSize: 13, color: '#a8a8a8', marginTop: 4 }}>{user?.email}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Racha actual', val: perfil?.racha_dias || 0 },
                  { label: 'Mejor racha', val: perfil?.mejor_racha || 0 },
                  { label: 'Nivel', val: perfil?.nivel || 1 },
                  { label: 'Puntos', val: perfil?.puntos_totales || 0 }
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 28, fontWeight: 700, color: '#14b8a6' }}>{s.val}</p>
                    <p style={{ fontSize: 12, color: '#a8a8a8' }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => navigate('planes')} style={{ width: '100%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>Ver planes y precios</button>
            <button onClick={() => router.push('/')} style={{ width: '100%', background: 'transparent', color: '#c8c8c8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>Cambiar de vertical</button>
            <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* Planes */}
      {view === 'planes' && (
        <div>
          <Header title="Planes y precios ✦" subtitle={pricing ? `Precios en ${pricing.pais_nombre}` : 'Elige el plan que mejor se adapta a ti'} />
          <div style={{ padding: '20px' }}>
            {[
              { id: 'free', nombre: 'Gratis', features: ['Leo como tu coach', '3 conversaciones por semana', 'Check-in diario', 'Hábitos básicos'] },
              { id: 'esencial', nombre: 'Esencial', popular: true, features: ['Leo sin límites', 'Conversaciones ilimitadas', 'Todos los tests y herramientas', 'Mi Equilibrio completo', 'Acceso solo a Coach 360 General'] },
              { id: 'premium', nombre: 'Premium', features: ['Todo lo de Esencial', 'Acceso a las 3 verticales (Mujer + General + Líderes)', 'Memoria cruzada entre coaches', 'Acceso anticipado a nuevo contenido', 'Soporte prioritario'] },
            ].map(p => {
              const isCurrentPlan = perfil?.plan_actual === p.id || (!perfil?.plan_actual && p.id === 'free')
              const precioInfo = pricing?.precios?.[p.id]
              const precioMostrado = p.id === 'free' ? '$0' : (precioInfo?.precio_formateado || '...')
              return (
                <div key={p.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: p.popular ? '2px solid #14b8a6' : isCurrentPlan ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: 20, marginBottom: 16, position: 'relative'
                }}>
                  {p.popular && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#14b8a6', color: '#fff', padding: '3px 14px', borderRadius: 12, fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
                      MÁS POPULAR
                    </div>
                  )}
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#fff', marginBottom: 14 }}>{p.nombre}</h3>
                  <div style={{ marginBottom: 16 }}>
                    {p.features.map((f, i) => (
                      <p key={i} style={{ fontSize: 13, color: '#c8c8c8', marginBottom: 6, paddingLeft: 16, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#14b8a6' }}>·</span>{f}
                      </p>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: '#fff' }}>{precioMostrado}</span>
                      {p.id !== 'free' && <span style={{ fontSize: 13, color: '#a8a8a8' }}>/mes</span>}
                    </div>
                    {isCurrentPlan ? (
                      <span style={{ fontSize: 13, color: '#14b8a6', fontWeight: 600 }}>Plan actual</span>
                    ) : p.id === 'free' ? (
                      <span style={{ fontSize: 13, color: '#a8a8a8' }}>Gratis</span>
                    ) : (
                      <button onClick={() => handleCheckout(p.id)} style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Elegir</button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Sesiones personales */}
            <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: 20, marginTop: 20 }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#fff', marginBottom: 8 }}>Sesiones con coach humano</h3>
              <p style={{ fontSize: 13, color: '#a8a8a8', lineHeight: 1.5, marginBottom: 14 }}>
                Complementa tu trabajo con Leo con sesiones 1:1 con un coach profesional certificado.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'sesion_personal_1', label: '1 sesión', desc: '60 minutos' },
                  { id: 'sesion_personal_4', label: 'Pack 4', desc: 'Ahorras con el pack' },
                  { id: 'sesion_personal_8', label: 'Pack 8', desc: 'Mejor valor' },
                ].map(s => {
                  const precioInfo = pricing?.precios?.[s.id]
                  return (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 12 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.label}</p>
                        <p style={{ fontSize: 11, color: '#a8a8a8' }}>{s.desc}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{precioInfo?.precio_formateado || '...'}</span>
                        <button onClick={() => handleCheckout(s.id)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid #14b8a6', background: 'transparent', color: '#14b8a6', cursor: 'pointer', fontFamily: 'inherit' }}>Comprar</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      {!activeTest && !testResult && !activeHerramienta && !['clara', 'equilibrio', 'planes'].includes(view) && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#042f2e', borderTop: '1px solid rgba(20,184,166,0.2)', padding: '12px 0', display: 'flex', justifyContent: 'space-around' }}>
          <button onClick={() => setView('inicio')} style={{ background: 'none', border: 'none', color: view === 'inicio' ? '#14b8a6' : '#666', fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>⬡</span>Inicio
          </button>
          <button onClick={() => setView('tests')} style={{ background: 'none', border: 'none', color: view === 'tests' ? '#14b8a6' : '#666', fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>◇</span>Tests
          </button>
          <button onClick={() => navigate('clara')} style={{ background: 'none', border: 'none', color: '#14b8a6', fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>✦</span>Leo
          </button>
          <button onClick={() => setView('herramientas')} style={{ background: 'none', border: 'none', color: view === 'herramientas' ? '#14b8a6' : '#666', fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>◎</span>Herramientas
          </button>
          <button onClick={() => setView('perfil')} style={{ background: 'none', border: 'none', color: view === 'perfil' ? '#14b8a6' : '#666', fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 16 }}>○</span>Yo
          </button>
        </div>
      )}
    </div>
  )
}
