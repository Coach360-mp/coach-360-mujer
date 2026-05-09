'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const PREGUNTAS = [
  { id: 'P1', tipo: 'ANS', texto: 'Me preocupa que las personas que quiero se alejen de mí.' },
  { id: 'P2', tipo: 'EVI', texto: 'Me cuesta pedir ayuda aunque la necesite.' },
  { id: 'P3', tipo: 'SEG', texto: 'En los conflictos, busco resolución aunque sea incómoda.' },
  { id: 'P4', tipo: 'ANS', texto: 'A veces siento que amo más de lo que me aman.' },
  { id: 'P5', tipo: 'EVI', texto: 'Prefiero no depender emocionalmente de nadie.' },
  { id: 'P6', tipo: 'SEG', texto: 'Puedo expresar lo que necesito sin sentir que es demasiado.' },
  { id: 'P7', tipo: 'ANS', texto: 'Los silencios o la distancia de alguien me generan ansiedad.' },
  { id: 'P8', tipo: 'EVI', texto: 'Las relaciones íntimas me generan incomodidad aunque las desee.' },
]

const OPCIONES = [
  { valor: 1, label: 'Nunca' },
  { valor: 2, label: 'Casi nunca' },
  { valor: 3, label: 'A veces' },
  { valor: 4, label: 'Casi siempre' },
  { valor: 5, label: 'Siempre' },
]

const PERFILES = {
  ansioso: {
    nombre: 'Apego Ansioso',
    frase: 'Amas con intensidad. Y el miedo a perder a veces dirige más que el amor en sí.',
    color: '#FAECE7',
    acento: '#993C1D',
    revelacion: 'La ansiedad de apego no significa que amas mal. Significa que aprendiste a amar en condiciones donde la presencia de los demás no era predecible. Tu sistema nervioso aprendió a estar alerta. Eso se puede cambiar.',
    partida: 'Tu punto de partida es notar cuándo el miedo a perder empieza a conducir tus decisiones en las relaciones. No para ignorarlo — para elegir diferente.',
    ejes: [
      { titulo: 'Regular la ansiedad relacional', desc: 'Aprender a calmarte cuando el miedo a la pérdida se activa' },
      { titulo: 'Comunicar necesidades sin urgencia', desc: 'Pedir lo que necesitas sin que parezca una emergencia' },
      { titulo: 'Desarrollar base segura interna', desc: 'Que tu estabilidad no dependa completamente de la presencia de otros' },
    ],
    dias: [
      'Identificar un momento donde el miedo a perder dirigió tu comportamiento',
      'Una conversación donde pides algo que necesitas sin urgencia',
      'Una práctica de regulación cuando sientes que alguien se aleja',
    ],
    clara: '¿Qué necesitarías sentir en una relación para no tener miedo de perderla?',
    fortaleza: 'Alta capacidad de amor y conexión',
    debilidad: 'Ansiedad cuando hay distancia o silencio',
  },
  evitativo: {
    nombre: 'Apego Evitativo',
    frase: 'Valoras tu independencia. Y también te cuesta recibir lo que más quieres.',
    color: '#EEEDFE',
    acento: '#534AB7',
    revelacion: 'El apego evitativo no es falta de amor — es un mecanismo aprendido para protegerte de la decepción. El problema es que también te protege de la intimidad que deseas. La independencia se volvió un escudo.',
    partida: 'Tu punto de partida es reconocer cuándo la incomodidad con la intimidad es protección aprendida — no una preferencia real. Hay una diferencia entre elegir la independencia y huir de la dependencia.',
    ejes: [
      { titulo: 'Tolerar la intimidad', desc: 'Aprender a estar cerca sin que se sienta una amenaza' },
      { titulo: 'Pedir y recibir', desc: 'Desarrollar la capacidad de recibir cuidado sin desactivarte' },
      { titulo: 'Vulnerabilidad selectiva', desc: 'Elegir con quién y cuándo abrirte — en vez de nunca' },
    ],
    dias: [
      'Identificar un momento donde la distancia fue protección, no elección',
      'Pedir algo pequeño a alguien de confianza y dejar que te lo den',
      'Una conversación con Clara sobre qué te da miedo de depender de alguien',
    ],
    clara: '¿Cuándo fue la última vez que dejaste que alguien te cuidara de verdad — sin salir corriendo?',
    fortaleza: 'Autonomía y autosuficiencia',
    debilidad: 'Dificultad para recibir e intimar',
  },
  seguro: {
    nombre: 'Apego Seguro',
    frase: 'Puedes amar sin perderte. Pedir sin miedo. Alejarte sin huir.',
    color: '#EAF5EE',
    acento: '#1D9E75',
    revelacion: 'El apego seguro no es suerte — es el resultado de experiencias relacionales que te enseñaron que la intimidad es segura. Eso te da una base muy sólida para todas tus relaciones. Y también una responsabilidad.',
    partida: 'Tu punto de partida es profundizar. ¿Hay relaciones específicas donde el apego seguro cuesta más? ¿Hay momentos donde aparece la ansiedad o el alejamiento? Esos son los bordes del trabajo.',
    ejes: [
      { titulo: 'Profundizar la intimidad', desc: 'Llevar la seguridad a los lugares donde todavía te proteges' },
      { titulo: 'Ser base segura para otros', desc: 'Tu estilo de apego impacta las relaciones de quienes te rodean' },
      { titulo: 'Sostener en los momentos difíciles', desc: 'Mantener el apego seguro cuando hay conflicto o crisis' },
    ],
    dias: [
      'Identificar una relación donde el apego seguro te cuesta más',
      'Una conversación honesta sobre lo que necesitas en esa relación',
      'Una reflexión con Clara sobre qué construyó tu base segura',
    ],
    clara: '¿Qué te enseñaron tus relaciones más seguras sobre cómo mereces ser amada?',
    fortaleza: 'Intimidad sin pérdida de identidad',
    debilidad: 'Posibles zonas de apego inseguro no identificadas',
  },
}

function calcularPerfil(respuestas) {
  let ans = 0, evi = 0, seg = 0
  PREGUNTAS.forEach((p, i) => {
    const val = respuestas[i] || 3
    if (p.tipo === 'ANS') ans += val
    if (p.tipo === 'EVI') evi += val
    if (p.tipo === 'SEG') seg += val
  })
  if (seg >= ans && seg >= evi) return PERFILES.seguro
  if (ans >= evi) return PERFILES.ansioso
  return PERFILES.evitativo
}

export default function TestApego() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [fase, setFase] = useState('intro')
  const [idx, setIdx] = useState(0)
  const [respuestas, setRespuestas] = useState([])
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/holaclara/auth')
      else setUsuario(user)
    })
  }, [])

  const responder = async (valor) => {
    const nuevas = [...respuestas, valor]
    setRespuestas(nuevas)
    if (idx < PREGUNTAS.length - 1) {
      setIdx(i => i + 1)
    } else {
      setFase('calculando')
      setTimeout(async () => {
        const p = calcularPerfil(nuevas)
        setPerfil(p)
        if (usuario) {
          try {
            await supabase.from('tests_resultados_usuaria').upsert({
              user_id: usuario.id, test_slug: 'apego',
              respuestas: nuevas, resultado_slug: p.nombre,
              scores: { ans, evi, seg: 0 },
            })
            await supabase.rpc('sumar_puntos', { p_user_id: usuario.id, p_puntos: 20, p_tipo: 'test' })
          } catch(e) { console.error(e) }
        }
        setFase('resultado')
      }, 2500)
    }
  }

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    container: { maxWidth: '420px', margin: '0 auto', padding: '24px 20px 80px' },
  }

  if (fase === 'intro') return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
          <img src="/images/test_apego_portada.png" alt="Test apego" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,250,247,1) 0%, rgba(250,250,247,0) 60%)' }} />
          <button onClick={() => router.back()} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#2A2520', cursor: 'pointer', fontFamily: 'inherit' }}>← volver</button>
        </div>
        <div style={s.container}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Test · 6 min · Esencial</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '16px', lineHeight: 1.2 }}>¿Cómo amas y cómo necesitas ser amada?</div>
          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '20px' }}>Tu estilo de apego explica más de tus relaciones que cualquier otra cosa. Y la buena noticia es que se puede cambiar.</div>
          <div style={{ background: '#F5EFE6', borderRadius: '12px', padding: '12px 14px', marginBottom: '32px', borderLeft: '3px solid #C9A96E' }}>
            <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Metodología</div>
            <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>Basado en la teoría del apego de Bowlby y Ainsworth, actualizada por investigación contemporánea sobre vínculos adultos.</div>
          </div>
          <button onClick={() => setFase('test')} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>Empezar el test →</button>
          <button onClick={() => router.back()} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>Volver</button>
        </div>
        <TabBar />
      </div>
    </>
  )

  if (fase === 'test') {
    const pregunta = PREGUNTAS[idx]
    const progreso = (idx / PREGUNTAS.length) * 100
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
        <div style={s.root}>
          <div style={{ padding: '16px 20px 0', maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#9A8F84', fontWeight: 700 }}>{idx + 1} de {PREGUNTAS.length}</span>
              <span style={{ fontSize: '11px', color: '#9A8F84' }}>Estilo de apego</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(42,37,32,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#C9A96E', borderRadius: '2px', width: `${progreso}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={s.container}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520', marginBottom: '32px', marginTop: '24px', lineHeight: 1.4 }}>{pregunta.texto}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {OPCIONES.map(op => (
                <button key={op.valor} onClick={() => responder(op.valor)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(42,37,32,0.12)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600, color: '#2A2520', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {op.label}<span style={{ fontSize: '12px', color: '#C9A96E', fontWeight: 700 }}>{op.valor}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (fase === 'calculando') return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #EDE8DF', borderTopColor: '#C9A96E', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '8px' }}>Clara está leyendo tus respuestas...</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E' }}>un momento</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </>
  )

  if (fase === 'resultado' && perfil) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <div style={{ background: perfil.color, borderRadius: '20px', padding: '24px', marginBottom: '16px', borderLeft: `4px solid ${perfil.acento}` }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: perfil.acento, fontWeight: 700, marginBottom: '8px' }}>Tu perfil</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '10px', lineHeight: 1.2 }}>{perfil.nombre}</div>
            <div style={{ fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>{perfil.frase}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, background: '#EAF5EE', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: '6px' }}>Fortaleza</div>
              <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.4 }}>{perfil.fortaleza}</div>
            </div>
            <div style={{ flex: 1, background: '#FAECE7', borderRadius: '14px', padding: '14px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#993C1D', fontWeight: 700, marginBottom: '6px' }}>A trabajar</div>
              <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.4 }}>{perfil.debilidad}</div>
            </div>
          </div>
          <div style={{ background: '#2A2520', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '10px' }}>Lo que esto revela</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{perfil.revelacion}</div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>Lo que puedes desarrollar</div>
            {perfil.ejes.map((eje, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: perfil.acento, flexShrink: 0, marginTop: '6px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{eje.titulo}</div>
                  <div style={{ fontSize: '12px', color: '#6B6057', lineHeight: 1.5 }}>{eje.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>En 7 días puedes tener</div>
            {perfil.dias.map((dia, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < perfil.dias.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '12px', color: perfil.acento, fontWeight: 700, flexShrink: 0 }}>✓</div>
                <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>{dia}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '12px', color: '#fff' }}>c</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.6 }}>{perfil.clara}</div>
            </div>
          </div>
          <button onClick={() => router.push(`/holaclara/chat?msg=${encodeURIComponent(`Clara, hice el test de estilo de apego. Mi resultado fue "${perfil.nombre}". ${perfil.clara}`)}`)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
            Hablar con Clara sobre esto →
          </button>
          <button onClick={() => router.push('/holaclara/tests')} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
            Ver otros tests
          </button>
        </div>
        <TabBar />
      </div>
    </>
  )

  return null
}
