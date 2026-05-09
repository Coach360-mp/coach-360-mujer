'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const HABITOS_POR_PERFIL = {
  cumplidora_cansada: [
    { n: 'Pausa de 5 minutos', icon: '◎', desc: 'Sin pantalla, sin hacer nada' },
    { n: 'Una cosa por día', icon: '◈', desc: 'Elegir una prioridad real' },
    { n: 'Decir que no', icon: '◉', desc: 'Una vez a la semana' },
  ],
  cuida_a_todos: [
    { n: 'Tiempo solo tuyo', icon: '◎', desc: '15 minutos sin atender a nadie' },
    { n: 'Pedir algo', icon: '◈', desc: 'Expresar una necesidad real' },
    { n: 'Check-in emocional', icon: '◉', desc: 'Preguntarte cómo estás cada día' },
  ],
  no_se_reconoce: [
    { n: 'Escritura libre', icon: '◎', desc: '5 minutos sin filtro' },
    { n: 'Una cosa que te gusta', icon: '◈', desc: 'Que no sea productiva' },
    { n: 'Pregunta del día', icon: '◉', desc: 'Una pregunta sobre ti misma' },
  ],
  escucha_el_cuerpo: [
    { n: 'Escaneo corporal', icon: '◎', desc: '2 minutos al despertar' },
    { n: 'Movimiento suave', icon: '◈', desc: '10 minutos de tu elección' },
    { n: 'Dormir a tiempo', icon: '◉', desc: 'Respetar tu hora de dormir' },
  ],
  la_que_busca: [
    { n: 'Reflexión diaria', icon: '◎', desc: '5 minutos de journaling' },
    { n: 'Aprender algo nuevo', icon: '◈', desc: 'Un artículo, podcast o libro' },
    { n: 'Acción pequeña', icon: '◉', desc: 'Un paso hacia lo que quieres' },
  ],
}

const HABITOS_DEFAULT = [
  { n: 'Pausa de 5 minutos', icon: '◎', desc: 'Sin pantalla, sin hacer nada' },
  { n: 'Check-in emocional', icon: '◈', desc: 'Preguntarte cómo estás cada día' },
  { n: 'Escritura libre', icon: '◉', desc: '5 minutos sin filtro' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [nombrePerfil, setNombrePerfil] = useState('')
  const [habitosSel, setHabitosSel] = useState([])
  const [cicloOpc, setCicloOpc] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/holaclara/auth'); return }
      setUsuario(user)
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
      if (p) {
        setPerfil(p)
        setNombrePerfil(p.nombre || user.email.split('@')[0])
      }
      // Si ya completó onboarding, ir al chat
      const { data: ob } = await supabase.from('onboarding_progreso').select('completado').eq('user_id', user.id).single()
      if (ob?.completado) router.push('/holaclara/chat')
    })
  }, [])

  const habitosSugeridos = HABITOS_POR_PERFIL[perfil?.perfil_test_entrada] || HABITOS_DEFAULT

  const toggleHabito = (h) => {
    if (habitosSel.includes(h.n)) setHabitosSel(prev => prev.filter(x => x !== h.n))
    else if (habitosSel.length < 3) setHabitosSel(prev => [...prev, h.n])
  }

  const guardarHabitos = async () => {
    if (!usuario || habitosSel.length === 0) return
    for (const nombre of habitosSel) {
      const habito = habitosSugeridos.find(h => h.n === nombre)
      try {
        await supabase.from('habitos_usuario').insert({
          user_id: usuario.id,
          dimension: 'mente',
          nombre,
          frecuencia: 'Todos los días',
          dias_semana: [1,2,3,4,5,6,7],
          activo: true,
        })
      } catch(e) { console.error(e) }
    }
  }

  const completarOnboarding = async () => {
    if (!usuario) return
    try {
      await supabase.from('onboarding_progreso').upsert({
        user_id: usuario.id,
        completado: true,
        bienvenida_vista: true,
        ciclo_configurado: cicloOpc !== null,
        habitos_elegidos: habitosSel.length > 0,
        primera_conversacion: false,
        updated_at: new Date().toISOString(),
      })
    } catch(e) { console.error(e) }
    router.push('/holaclara/chat')
  }

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    container: { maxWidth: '420px', margin: '0 auto', padding: '32px 24px 60px' },
    title: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.2 },
    sub: { fontSize: '14px', color: '#6B6057', lineHeight: 1.6, marginBottom: '32px' },
    btn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' },
    btnLight: { width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer', marginTop: '10px' },
  }

  const pasos = [
    { num: 1, label: 'Bienvenida' },
    { num: 2, label: 'Hábitos' },
    { num: 3, label: 'Ciclo' },
    { num: 4, label: 'Listo' },
  ]

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        {/* PROGRESS */}
        <div style={{ padding: '16px 24px 0', maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {pasos.map(p => (
              <div key={p.num} style={{ flex: 1, height: '3px', borderRadius: '2px', background: paso >= p.num ? '#C9A96E' : 'rgba(42,37,32,0.1)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>

        <div style={s.container}>

          {/* PASO 1 — BIENVENIDA */}
          {paso === 1 && (
            <div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#C9A96E', marginBottom: '16px' }}>Hola, {nombrePerfil}.</div>
              <div style={s.title}>Estás en el lugar correcto.</div>
              <div style={s.sub}>
                Soy Clara. Voy a acompañarte a conocerte mejor, crecer en tus términos y volver a ti misma.
                <br /><br />
                No soy una app de meditación ni un diario. Soy una coach que te recuerda, te pregunta y está cuando me necesites.
              </div>
              <div style={{ background: '#F5EFE6', borderRadius: '14px', padding: '16px 18px', marginBottom: '32px', borderLeft: '3px solid #C9A96E' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>
                  "En 7 días vas a tener más claridad sobre ti misma de la que has tenido en meses."
                </div>
                <div style={{ fontSize: '11px', color: '#9A8F84', marginTop: '8px' }}>— Clara</div>
              </div>
              <button style={s.btn} onClick={() => setPaso(2)}>Empezar →</button>
            </div>
          )}

          {/* PASO 2 — HÁBITOS */}
          {paso === 2 && (
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Paso 2 de 4</div>
              <div style={s.title}>Elige hasta 3 hábitos</div>
              <div style={s.sub}>Basados en tu perfil. Sin streaks agresivos — solo pequeñas acciones que sostienes.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {habitosSugeridos.map((h, i) => {
                  const sel = habitosSel.includes(h.n)
                  return (
                    <div key={i} onClick={() => toggleHabito(h)} style={{ padding: '16px', borderRadius: '14px', border: sel ? '2px solid #C9A96E' : '1px solid rgba(42,37,32,0.12)', background: sel ? '#FBF5EC' : '#fff', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '20px', color: sel ? '#C9A96E' : '#9A8F84', flexShrink: 0 }}>{h.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{h.n}</div>
                        <div style={{ fontSize: '12px', color: '#6B6057' }}>{h.desc}</div>
                      </div>
                      {sel && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>}
                    </div>
                  )
                })}
              </div>
              <button style={{ ...s.btn, background: habitosSel.length > 0 ? '#2A2520' : 'rgba(42,37,32,0.3)' }} onClick={async () => { await guardarHabitos(); setPaso(3) }}>
                {habitosSel.length > 0 ? `Continuar con ${habitosSel.length} hábito${habitosSel.length > 1 ? 's' : ''} →` : 'Elige al menos uno'}
              </button>
              <button style={s.btnLight} onClick={() => setPaso(3)}>Saltar por ahora</button>
            </div>
          )}

          {/* PASO 3 — CICLO */}
          {paso === 3 && (
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Paso 3 de 4</div>
              <div style={s.title}>¿Quieres que Clara conozca tu ciclo?</div>
              <div style={s.sub}>Opcional. Si activas esto, Clara va a adaptar su acompañamiento según tu fase hormonal. Es un diferenciador real.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {[
                  { val: 'si', titulo: 'Sí, quiero que Clara conozca mi ciclo', desc: 'Acompañamiento hormonal personalizado' },
                  { val: 'no', titulo: 'No por ahora', desc: 'Puedes activarlo después en tu perfil' },
                ].map((op) => (
                  <div key={op.val} onClick={() => setCicloOpc(op.val)} style={{ padding: '16px', borderRadius: '14px', border: cicloOpc === op.val ? '2px solid #C9A96E' : '1px solid rgba(42,37,32,0.12)', background: cicloOpc === op.val ? '#FBF5EC' : '#fff', cursor: 'pointer' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#2A2520', marginBottom: '4px' }}>{op.titulo}</div>
                    <div style={{ fontSize: '12px', color: '#6B6057' }}>{op.desc}</div>
                  </div>
                ))}
              </div>
              <button style={{ ...s.btn, background: cicloOpc ? '#2A2520' : 'rgba(42,37,32,0.3)' }} onClick={() => {
                if (!cicloOpc) return
                if (cicloOpc === 'si') router.push('/holaclara/ciclo?desde=onboarding')
                else setPaso(4)
              }}>
                Continuar →
              </button>
            </div>
          )}

          {/* PASO 4 — LISTO */}
          {paso === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="28" height="24" viewBox="0 0 28 24" fill="none"><polyline points="2,12 10,20 26,4" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '8px' }}>Lista para empezar.</div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#C9A96E', marginBottom: '32px' }}>Clara ya te está esperando.</div>
              <div style={{ background: '#F5EFE6', borderRadius: '14px', padding: '16px 18px', marginBottom: '32px', textAlign: 'left', borderLeft: '3px solid #C9A96E' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>
                  "Tengo curiosidad por conocerte. ¿Por dónde quieres que empecemos?"
                </div>
                <div style={{ fontSize: '11px', color: '#9A8F84', marginTop: '8px' }}>— Clara</div>
              </div>
              <button style={s.btn} onClick={completarOnboarding}>Hablar con Clara →</button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
