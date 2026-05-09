'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const TEST = {
  slug: 'valores',
  titulo: '¿Estás viviendo lo que de verdad importa?',
  desc: 'No los valores que dices tener. Los que se ven en cómo gastas tu tiempo y tu energía.',
  duracion: '5 min',
  plan: 'Esencial',
  imagen: '/images/test_valores_portada.png',
  metodologia: 'Basado en Acceptance and Commitment Therapy (ACT) y clarificación de valores.',
  chatMsg: 'Clara, hice el test de valores. Quiero explorar contigo si estoy viviendo lo que de verdad me importa.',
  preguntas: [
    { texto: 'Siento que mis decisiones diarias reflejan lo que de verdad me importa.', dir: 'pos' },
    { texto: 'Hay cosas que hago por obligación que consumen tiempo que daría a lo que valoro.', dir: 'neg' },
    { texto: 'Sé con claridad qué es lo más importante para mí en esta etapa de vida.', dir: 'pos' },
    { texto: 'A veces siento que vivo la vida que se espera de mí, no la que elegiría.', dir: 'neg' },
    { texto: 'Puedo decir que no a cosas que no se alinean con lo que valoro.', dir: 'pos' },
    { texto: 'Me cuesta definir qué quiero porque hay muchas cosas que debería querer.', dir: 'neg' },
    { texto: 'Cuando tomo una decisión importante, sé cuál es mi brújula interna.', dir: 'pos' },
    { texto: 'Siento que hay una brecha entre quién soy y quién quiero ser.', dir: 'neg' },
  ],
  perfiles: [
    { nombre: 'Desconectada de tus valores', interpretacion: 'Hay una distancia entre lo que dices que importa y cómo vives. Eso no es hipocresía — es que nadie te enseñó a tomar decisiones desde valores propios. La mayoría vivimos desde expectativas ajenas.', pregunta: '¿Si nadie supiera cómo vives, qué cambiarías primero?', min: 0, max: 40 },
    { nombre: 'En proceso de claridad', interpretacion: 'Sabes que hay algo que quieres cambiar pero no tienes claro del todo qué. Estás en el punto más interesante: entre la vida conocida y la vida elegida.', pregunta: '¿Hay una decisión que llevas tiempo posponiendo porque no sabes qué quieres de verdad?', min: 41, max: 65 },
    { nombre: 'Alineada con tus valores', interpretacion: 'Vives desde un lugar propio. Eso no significa que todo sea perfecto — significa que tienes una brújula. La siguiente pregunta es: ¿hacia dónde apunta ahora?', pregunta: '¿Qué valor tuyo crees que todavía no estás honrando del todo?', min: 66, max: 100 },
  ],
}

const OPCIONES = [
  { valor: 1, label: 'Nunca' },
  { valor: 2, label: 'Casi nunca' },
  { valor: 3, label: 'A veces' },
  { valor: 4, label: 'Casi siempre' },
  { valor: 5, label: 'Siempre' },
]

function calcularPerfil(respuestas, preguntas, perfiles) {
  let total = 0
  preguntas.forEach((p, i) => {
    const val = respuestas[i] || 3
    total += p.dir === 'neg' ? (6 - val) : val
  })
  const pct = ((total - preguntas.length) / (preguntas.length * 4)) * 100
  return perfiles.find(p => pct >= p.min && pct <= p.max) || perfiles[1]
}

export default function TestPage() {
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
    if (idx < TEST.preguntas.length - 1) {
      setIdx(i => i + 1)
    } else {
      setFase('calculando')
      setTimeout(async () => {
        const p = calcularPerfil(nuevas, TEST.preguntas, TEST.perfiles)
        setPerfil(p)
        if (usuario) {
          try {
            await supabase.from('tests_resultados_usuaria').upsert({
              user_id: usuario.id,
              test_slug: TEST.slug,
              respuestas: nuevas,
              resultado_slug: p.nombre,
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
        <div style={ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }>
          <img src={TEST.imagen} alt={TEST.titulo} style={ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' } />
          <div style={ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,250,247,1) 0%, rgba(250,250,247,0) 60%)' } />
          <button onClick={() => router.back()} style={ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#2A2520', cursor: 'pointer', fontFamily: 'inherit' }>← volver</button>
        </div>
        <div style={s.container}>
          <div style={ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }>Test · {TEST.duracion} · {TEST.plan}</div>
          <div style={ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '16px', lineHeight: 1.2 }>{TEST.titulo}</div>
          <div style={ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '20px' }>{TEST.desc}</div>
          <div style={ background: '#F5EFE6', borderRadius: '12px', padding: '12px 14px', marginBottom: '32px', borderLeft: '3px solid #C9A96E' }>
            <div style={ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }>Metodología</div>
            <div style={ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }>{TEST.metodologia}</div>
          </div>
          <button onClick={() => setFase('test')} style={ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }>Empezar el test →</button>
          <button onClick={() => router.back()} style={ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }>Volver</button>
        </div>
        <TabBar />
      </div>
    </>
  )

  if (fase === 'test') {
    const pregunta = TEST.preguntas[idx]
    const progreso = (idx / TEST.preguntas.length) * 100
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
        <div style={s.root}>
          <div style={ padding: '16px 20px 0', maxWidth: '420px', margin: '0 auto' }>
            <div style={ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }>
              <span style={ fontSize: '11px', color: '#9A8F84', fontWeight: 700 }>{idx + 1} de {TEST.preguntas.length}</span>
              <span style={ fontSize: '11px', color: '#9A8F84' }>{TEST.titulo}</span>
            </div>
            <div style={ height: '3px', background: 'rgba(42,37,32,0.08)', borderRadius: '2px', overflow: 'hidden' }>
              <div style={ height: '100%', background: '#C9A96E', borderRadius: '2px', width: `${progreso}%`, transition: 'width 0.3s' } />
            </div>
          </div>
          <div style={s.container}>
            <div style={ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520', marginBottom: '32px', marginTop: '24px', lineHeight: 1.4 }>{pregunta.texto}</div>
            <div style={ display: 'flex', flexDirection: 'column', gap: '10px' }>
              {OPCIONES.map(op => (
                <button key={op.valor} onClick={() => responder(op.valor)} style={ padding: '16px', borderRadius: '12px', border: '1px solid rgba(42,37,32,0.12)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600, color: '#2A2520', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }>
                  {op.label}<span style={ fontSize: '12px', color: '#C9A96E', fontWeight: 700 }>{op.valor}</span>
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
      <div style={ minHeight: '100vh', background: '#FAFAF7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }>
        <div style={ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #EDE8DF', borderTopColor: '#C9A96E', animation: 'spin 1s linear infinite', marginBottom: '24px' } />
        <div style={ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '8px' }>Clara está leyendo tus respuestas...</div>
        <div style={ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E' }>un momento</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </>
  )

  if (fase === 'resultado' && perfil) return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <div style={ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }>Tu resultado</div>
          <div style={ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '20px', lineHeight: 1.2 }>{perfil.nombre}</div>
          <div style={ background: '#F5EFE6', borderRadius: '16px', padding: '20px', marginBottom: '16px', borderLeft: '3px solid #C9A96E' }>
            <div style={ fontSize: '14px', color: '#2A2520', lineHeight: 1.7 }>{perfil.interpretacion}</div>
          </div>
          <div style={ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid rgba(42,37,32,0.1)' }>
            <div style={ display: 'flex', gap: '10px', alignItems: 'flex-start' }>
              <div style={ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '12px', color: '#fff' }>c</div>
              <div style={ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.6 }>{perfil.pregunta}</div>
            </div>
          </div>
          <button onClick={() => router.push(`/holaclara/chat?msg=${encodeURIComponent(TEST.chatMsg)}`)} style={ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }>
            Hablar con Clara sobre esto →
          </button>
          <button onClick={() => router.push('/holaclara/conocerme')} style={ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }>
            Volver a Conocerme
          </button>
        </div>
        <TabBar />
      </div>
    </>
  )

  return null
}
