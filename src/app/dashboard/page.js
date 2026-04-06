'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

  // Tests state
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

  // Chat state
  const [chatMsgs, setChatMsgs] = useState([
    { r: 'a', t: 'Hola, bienvenida ✦\n\nSoy Clara, tu coach personal. Estoy aquí para ayudarte a ver con más claridad.\n\n¿Qué te trae hoy?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [animoHoy, setAnimoHoy] = useState(null)
  const [equilibrio, setEquilibrio] = useState({ mente: 0, cuerpo: 0, corazon: 0, espiritu: 0 })
  const chatEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs, typing])

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    setPerfil(profile)
    
    // Load content
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
    if (activeHerramienta) { setActiveHerramienta(null); setHerramientaStep(0); return }
    if (prevView) { setView(prevView); setPrevView(null) }
    else { setView('inicio') }
  }

  const startTest = async (test) => {
    const { data: questions } = await supabase.from('preguntas').select('*').eq('test_id', test.id).order('orden')
    if (questions && questions.length > 0) {
      setTestQuestions(questions)
      setActiveTest(test)
      setTestStep(0)
      setTestAnswers([])
      setTestResult(null)
    }
  }

  const answerQuestion = async (value) => {
    const newAnswers = [...testAnswers, value]
    setTestAnswers(newAnswers)
    
    if (testStep + 1 < testQuestions.length) {
      setTestStep(testStep + 1)
    } else {
      // Calculate result
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
      newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      const profile = elementProfiles[dominant] || { nombre: 'Explorador', desc: 'Tienes una combinación única de elementos.' }
      setTestResult(profile)

      // Save to database
      if (user) {
        await supabase.from('resultados_test').insert({
          usuario_id: user.id,
          test_id: activeTest.id,
          puntaje_total: newAnswers.reduce((a, b) => a + b, 0),
          perfil_resultado: profile.nombre,
          respuestas: newAnswers,
        })
      }
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMsgs(prev => [...prev, { r: 'u', t: msg }])
    setChatInput('')
    setTyping(true)
    try {
      const history = chatMsgs.map(m => ({ role: m.r === 'a' ? 'assistant' : 'user', content: m.t }))
      history.push({ role: 'user', content: msg })
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
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
  const nombre = perfil?.nombre || user?.user_metadata?.full_name || 'Bienvenida'
  const canAccess = (required) => required === 'free' || plan === 'premium' || (plan === 'esencial' && required !== 'premium')

  const Header = ({ title, subtitle, showBack = true }) => (
    <div style={{ padding: '48px 20px 16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
      {showBack && (
        <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '4px 8px' }}>←</button>
      )}
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

          <div className="card" style={{ marginBottom: 16, background: 'var(--dark)', color: '#fff', cursor: 'pointer' }} onClick={() => navigate('clara')}>
            <p style={{ fontSize: 13, color: 'var(--gold-light)', marginBottom: 4 }}>Tu coach IA</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', marginBottom: 8 }}>Habla con Clara</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Empieza una conversación de coaching ✦</p>
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

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Tests</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {tests.slice(0, 3).map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => canAccess(t.plan_requerido) && startTest(t)}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p>
                </div>
                {!canAccess(t.plan_requerido) && (
                  <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                )}
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>Tu Camino</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modulos.slice(0, 3).map(m => (
              <div key={m.id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{m.titulo}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{m.descripcion}</p>
                    <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>{m.numero_semanas} semanas</p>
                  </div>
                  {!canAccess(m.plan_requerido) && (
                    <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                  )}
                </div>
              </div>
            ))}
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
            
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.3, marginBottom: 28 }}>
              {testQuestions[testStep]?.texto}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {testQuestions[testStep]?.opciones?.map((opt, i) => (
                <button key={i} onClick={() => answerQuestion(testQuestions[testStep].valores[i])}
                  style={{
                    padding: '16px 20px', borderRadius: 14, border: '2px solid #e0dbd4',
                    background: '#fff', textAlign: 'left', fontSize: 14, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', lineHeight: 1.4, transition: 'all 0.2s',
                    color: 'var(--text)',
                  }}>
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
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px',
              background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--gold-light)', fontSize: 36, fontFamily: 'var(--font-display)' }}>
                {testResult.nombre[0]}
              </span>
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>
              {testResult.nombre}
            </h2>
            
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 32px' }}>
              {testResult.desc}
            </p>

            <button className="btn-primary" onClick={() => { setTestResult(null); setActiveTest(null); navigate('clara') }}
              style={{ marginBottom: 12 }}>
              Explorar esto con Clara ✦
            </button>
            
            <button className="btn-secondary" onClick={() => { setTestResult(null); setActiveTest(null) }}>
              Volver al inicio
            </button>
          </div>
        </div>
      )}

      {/* === MI EQUILIBRIO === */}
      {view === 'equilibrio' && !activeTest && (
        <div>
          <Header title="Mi Equilibrio ✦" subtitle="Tu bienestar integral de hoy" />
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.5 }}>
              Cuida las cuatro dimensiones que impactan tu claridad y tus decisiones.
            </p>
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
                      style={{
                        flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: equilibrio[d.key] >= v ? d.color : '#f0ebe3',
                        opacity: equilibrio[d.key] >= v ? 1 : 0.5, transition: 'all 0.2s',
                      }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-light)' }}>Nada</span>
                  <span style={{ fontSize: 10, color: 'var(--text-light)' }}>Mucho</span>
                </div>
              </div>
            ))}
            <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('inicio')}>
              Guardar mi equilibrio ✦
            </button>
          </div>
        </div>
      )}

      {/* === CLARA === */}
      {view === 'clara' && !activeTest && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '48px 20px 12px', borderBottom: '1px solid #eee', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '4px 8px' }}>←</button>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0 }}>Clara ✦</h2>
              <p style={{ fontSize: 12, color: 'var(--text-light)', margin: 0 }}>Tu coach personal con IA</p>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.r === 'u' ? 'flex-end' : 'flex-start', maxWidth: '80%',
                padding: '12px 16px', borderRadius: m.r === 'u' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.r === 'u' ? 'var(--dark)' : '#fff', color: m.r === 'u' ? '#fff' : 'var(--text)',
                fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                boxShadow: m.r === 'a' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              }}>{m.t}</div>
            ))}
            {typing && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#fff', color: 'var(--text-light)', fontSize: 14 }}>
                Clara está pensando ✦
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '12px 20px 32px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <input className="input-field" placeholder="Escribe aquí..." value={chatInput}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tests.map(t => (
                <div key={t.id} className="card" style={{ cursor: canAccess(t.plan_requerido) ? 'pointer' : 'default' }}
                  onClick={() => canAccess(t.plan_requerido) && startTest(t)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p>
                    </div>
                    {!canAccess(t.plan_requerido) ? (
                      <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                    ) : (
                      <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === HERRAMIENTAS === */}
      {view === 'herramientas' && !activeHerramienta && (
        <div>
          <Header title="Herramientas ✦" subtitle="Ejercicios prácticos con neurociencia" showBack={false} />
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {herramientas.map(h => (
                <div key={h.id} className="card" style={{ cursor: canAccess(h.plan_requerido) ? 'pointer' : 'default' }}
                  onClick={() => canAccess(h.plan_requerido) && (() => { setActiveHerramienta(h); setHerramientaStep(0); navigate('herramienta_activa') })()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{h.titulo}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{h.categoria} · {h.pasos?.length || 0} pasos</p>
                    </div>
                    {!canAccess(h.plan_requerido) ? (
                      <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                    ) : (
                      <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

            {herramientaStep === 0 && (
              <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>
                {activeHerramienta.descripcion}
              </p>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 15, lineHeight: 1.7 }}>
                {activeHerramienta.pasos?.[herramientaStep]}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {herramientaStep > 0 && (
                <button className="btn-secondary" onClick={() => setHerramientaStep(herramientaStep - 1)} style={{ flex: 1 }}>
                  ← Anterior
                </button>
              )}
              {herramientaStep < (activeHerramienta.pasos?.length || 1) - 1 ? (
                <button className="btn-primary" onClick={() => setHerramientaStep(herramientaStep + 1)} style={{ flex: 1 }}>
                  Siguiente →
                </button>
              ) : (
                <button className="btn-primary" onClick={() => { setActiveHerramienta(null); setHerramientaStep(0); navigate('herramientas') }} style={{ flex: 1 }}>
                  Completar ✦
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === CAMINO === */}
      {view === 'camino' && !activeTest && (
        <div>
          <Header title="Tu Camino ✦" subtitle="Módulos de crecimiento personal" showBack={false} />
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {modulos.map(m => (
                <div key={m.id} className="card" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{m.titulo}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{m.descripcion}</p>
                      <p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 4 }}>{m.numero_semanas} semanas</p>
                    </div>
                    {!canAccess(m.plan_requerido) ? (
                      <span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>
                    ) : (
                      <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>
                    )}
                  </div>
                </div>
              ))}
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
            <button className="btn-secondary" onClick={handleLogout} style={{ marginTop: 8 }}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* === BOTTOM NAV === */}
      {!activeTest && !testResult && !activeHerramienta && view !== 'clara' && view !== 'equilibrio' && view !== 'herramienta_activa' && (
        <div className="bottom-nav">
          <button className={`nav-item ${view === 'inicio' ? 'active' : ''}`} onClick={() => setView('inicio')}>
            <span className="nav-icon">⬡</span>Inicio
          </button>
          <button className={`nav-item ${view === 'tests' ? 'active' : ''}`} onClick={() => setView('tests')}>
            <span className="nav-icon">◇</span>Tests
          </button>
          <button className="nav-item" onClick={() => navigate('clara')}>
            <span className="nav-icon">✦</span>Clara
          </button>
          <button className={`nav-item ${view === 'herramientas' ? 'active' : ''}`} onClick={() => setView('herramientas')}>
            <span className="nav-icon">◎</span>Herramientas
          </button>
          <button className={`nav-item ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>
            <span className="nav-icon">○</span>Yo
          </button>
        </div>
      )}
    </div>
  )
}
