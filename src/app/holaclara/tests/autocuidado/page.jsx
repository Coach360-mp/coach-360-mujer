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
  { id: 'P1', dir: 'neg', texto: 'Cuando cometo un error, me digo cosas que no le diría a una amiga.' },
  { id: 'P2', dir: 'neg', texto: 'Me exijo más de lo que exijo a los demás.' },
  { id: 'P3', dir: 'pos', texto: 'Reconozco cuando hice algo bien sin minimizarlo.' },
  { id: 'P4', dir: 'pos', texto: 'Cuando estoy mal, me cuido como cuidaría a alguien que quiero.' },
  { id: 'P5', dir: 'neg', texto: 'Me cuesta aceptar un cumplido sin desviarlo.' },
  { id: 'P6', dir: 'neg', texto: 'Soy más paciente con los demás que conmigo misma.' },
  { id: 'P7', dir: 'pos', texto: 'Me permito descansar sin sentir que tengo que merecerlo.' },
  { id: 'P8', dir: 'neg', texto: 'Mi voz interna es más crítica que compasiva.' },
]

const OPCIONES = [
  { valor: 1, label: 'Nunca' },
  { valor: 2, label: 'Casi nunca' },
  { valor: 3, label: 'A veces' },
  { valor: 4, label: 'Casi siempre' },
  { valor: 5, label: 'Siempre' },
]

const PERFILES = {
  critica: {
    nombre: 'La Crítica Severa',
    frase: 'Tu voz interna no te perdonaría lo que sí le perdonas a todos los demás.',
    color: '#FAECE7',
    acento: '#993C1D',
    revelacion: 'Lo que te dices a ti misma tiene un costo real — en energía, en confianza, en cómo te mueves en el mundo. No es carácter fuerte. Es un hábito aprendido, muchas veces en la infancia, que ya no te sirve.',
    partida: 'Tu punto de partida es reconocer la voz crítica — no combatirla, solo notarla. "Ahí está de nuevo." Eso ya es un cambio.',
    ejes: [
      { titulo: 'Notar sin juzgar', desc: 'Identificar cuándo la voz interna es desproporcionadamente dura' },
      { titulo: 'Reescribir el diálogo', desc: 'Aprender a hablarte como le hablarías a alguien que quieres' },
      { titulo: 'Merecimiento sin condición', desc: 'Descansar, recibir y celebrar sin tener que ganártelo primero' },
    ],
    dias: [
      'Una conversación con Clara sobre de dónde viene esa voz crítica',
      'Identificar una cosa que hiciste bien esta semana — sin minimizarla',
      'Decirte algo amable en un momento difícil y ver qué pasa',
    ],
    clara: '¿Qué le dirías a una amiga que estuviera en la situación en que tú estás ahora mismo?',
    fortaleza: 'Alta consciencia de los demás',
    debilidad: 'Autoexigencia desproporcionada',
  },
  transicion: {
    nombre: 'En Transición',
    frase: 'A veces te cuidas. A veces te exiges demasiado. Estás aprendiendo la diferencia.',
    color: '#F5EFE6',
    acento: '#C9A96E',
    revelacion: 'Tienes momentos de autocuidado genuino y momentos de crítica severa. Eso no es inconsistencia — es que estás en el proceso de cambiar un patrón muy arraigado. Lo más importante: ya tienes consciencia.',
    partida: 'Estás en el punto más interesante del cambio — entre el hábito viejo y el nuevo. Ya no puedes no ver la voz crítica. Ahora el trabajo es elegir diferente.',
    ejes: [
      { titulo: 'Consistencia compasiva', desc: 'Llevar el autocuidado a los días difíciles, no solo a los buenos' },
      { titulo: 'Recibir sin desviar', desc: 'Aceptar reconocimiento y ayuda sin minimizarlos' },
      { titulo: 'Límites desde el valor propio', desc: 'Decir que no desde lo que necesitas, no desde la culpa' },
    ],
    dias: [
      'Identificar en qué contextos eres más compasiva contigo misma',
      'Llevar esa compasión a un momento difícil de la semana',
      'Aceptar un cumplido sin desviarlo — solo decir "gracias"',
    ],
    clara: '¿En qué momentos eres más amable contigo misma? ¿Qué los hace diferentes al resto?',
    fortaleza: 'Consciencia en crecimiento',
    debilidad: 'Inconsistencia según el contexto',
  },
  activa: {
    nombre: 'Autocuidado Activo',
    frase: 'Ya tienes una relación más amable contigo misma. El siguiente nivel es profundizar.',
    color: '#EAF5EE',
    acento: '#1D9E75',
    revelacion: 'Tienes una base sólida de autocuidado. Puedes reconocer tus logros, descansar sin culpa y hablarte con más amabilidad. Eso no es lo normal — es el resultado de trabajo consciente.',
    partida: 'Tu punto de partida no es empezar — es profundizar. ¿Hay áreas de tu vida donde todavía opera la voz crítica con más fuerza? Esas son las que merecen atención ahora.',
    ejes: [
      { titulo: 'Profundizar la autocompasión', desc: 'Llevarla a las áreas donde todavía te exiges más de la cuenta' },
      { titulo: 'Modelar para otros', desc: 'Tu relación contigo misma impacta cómo las demás mujeres a tu alrededor se tratan' },
      { titulo: 'Sostenibilidad', desc: 'Mantener el autocuidado en momentos de alta exigencia externa' },
    ],
    dias: [
      'Identificar el área donde la voz crítica todavía aparece más',
      'Una práctica de autocuidado en ese espacio específico',
      'Una conversación con Clara sobre cómo sostenerlo cuando todo presiona',
    ],
    clara: '¿Hay algún área de tu vida donde todavía te exiges más de lo que le exigirías a alguien que amas?',
    fortaleza: 'Relación compasiva contigo misma',
    debilidad: 'Posibles áreas ciegas de autoexigencia',
  },
}

function calcularPerfil(respuestas) {
  let total = 0
  PREGUNTAS.forEach((p, i) => {
    const val = respuestas[i] || 3
    total += p.dir === 'neg' ? (6 - val) : val
  })
  const pct = ((total - PREGUNTAS.length) / (PREGUNTAS.length * 4)) * 100
  if (pct < 40) return PERFILES.critica
  if (pct < 70) return PERFILES.transicion
  return PERFILES.activa
}

export default function TestAutocuidado() {
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
              user_id: usuario.id, test_slug: 'autocuidado',
              respuestas: nuevas, resultado_slug: p.nombre,
              scores: { total: nuevas.reduce((a, b) => a + b, 0) },
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
          <img src="/images/test_autocuidado_portada.png" alt="Test autocuidado" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,250,247,1) 0%, rgba(250,250,247,0) 60%)' }} />
          <button onClick={() => router.back()} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#2A2520', cursor: 'pointer', fontFamily: 'inherit' }}>← volver</button>
        </div>
        <div style={s.container}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Test · 5 min · Esencial</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '16px', lineHeight: 1.2 }}>¿Cómo te hablas a ti misma?</div>
          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '20px' }}>El autocuidado no empieza en la bañera. Empieza en cómo te hablas cuando nadie escucha — y cuando algo sale mal.</div>
          <div style={{ background: '#F5EFE6', borderRadius: '12px', padding: '12px 14px', marginBottom: '32px', borderLeft: '3px solid #C9A96E' }}>
            <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Metodología</div>
            <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>Basado en investigación sobre lenguaje interno, autocompasión y bienestar psicológico.</div>
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
              <span style={{ fontSize: '11px', color: '#9A8F84' }}>Cómo te hablas</span>
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

          {/* PERFIL */}
          <div style={{ background: perfil.color, borderRadius: '20px', padding: '24px', marginBottom: '16px', borderLeft: `4px solid ${perfil.acento}` }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: perfil.acento, fontWeight: 700, marginBottom: '8px' }}>Tu perfil</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '10px', lineHeight: 1.2 }}>{perfil.nombre}</div>
            <div style={{ fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>{perfil.frase}</div>
          </div>

          {/* FORTALEZA Y PUNTO DÉBIL */}
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

          {/* LO QUE REVELA */}
          <div style={{ background: '#2A2520', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '10px' }}>Lo que esto revela</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{perfil.revelacion}</div>
          </div>

          {/* TU CAMINO */}
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

          {/* EN 7 DÍAS */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>En 7 días puedes tener</div>
            {perfil.dias.map((dia, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < perfil.dias.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '12px', color: perfil.acento, fontWeight: 700, flexShrink: 0 }}>✓</div>
                <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>{dia}</div>
              </div>
            ))}
          </div>

          {/* CLARA */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '12px', color: '#fff' }}>c</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.6 }}>{perfil.clara}</div>
            </div>
          </div>

          {/* CTAs */}
          <button onClick={() => router.push(`/holaclara/chat?msg=${encodeURIComponent(`Clara, hice el test de cómo me hablo a mí misma. Mi resultado fue "${perfil.nombre}". ${perfil.clara}`)}`)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
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
