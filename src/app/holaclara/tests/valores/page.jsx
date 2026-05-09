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
  { id: 'P1', dir: 'pos', texto: 'Siento que mis decisiones diarias reflejan lo que de verdad me importa.' },
  { id: 'P2', dir: 'neg', texto: 'Hay cosas que hago por obligación que consumen tiempo que daría a lo que valoro.' },
  { id: 'P3', dir: 'pos', texto: 'Sé con claridad qué es lo más importante para mí en esta etapa de vida.' },
  { id: 'P4', dir: 'neg', texto: 'A veces siento que vivo la vida que se espera de mí, no la que elegiría.' },
  { id: 'P5', dir: 'pos', texto: 'Puedo decir que no a cosas que no se alinean con lo que valoro.' },
  { id: 'P6', dir: 'neg', texto: 'Me cuesta definir qué quiero porque hay muchas cosas que debería querer.' },
  { id: 'P7', dir: 'pos', texto: 'Cuando tomo una decisión importante, sé cuál es mi brújula interna.' },
  { id: 'P8', dir: 'neg', texto: 'Siento que hay una brecha entre quién soy y quién quiero ser.' },
]

const OPCIONES = [
  { valor: 1, label: 'Nunca' },
  { valor: 2, label: 'Casi nunca' },
  { valor: 3, label: 'A veces' },
  { valor: 4, label: 'Casi siempre' },
  { valor: 5, label: 'Siempre' },
]

const PERFILES = {
  desconectada: {
    nombre: 'Desconectada de tus valores',
    frase: 'Vives bien según los estándares de todos. Pero no siempre según los tuyos.',
    color: '#FAECE7',
    acento: '#993C1D',
    revelacion: 'Hay una distancia entre lo que dices que importa y cómo vives. Eso no es hipocresía — es que nadie te enseñó a tomar decisiones desde valores propios. La mayoría vivimos desde expectativas ajenas sin darnos cuenta. Hasta que algo nos para.',
    partida: 'Tu punto de partida es nombrar. ¿Qué es lo que de verdad te importa — no lo que debería importarte? La respuesta honesta a esa pregunta es la brújula.',
    ejes: [
      { titulo: 'Identificar valores propios', desc: 'Separar lo que valoras tú de lo que valoran los demás para ti' },
      { titulo: 'Tomar decisiones desde dentro', desc: 'Aprender a preguntar "¿qué quiero yo?" antes de "¿qué se espera de mí?"' },
      { titulo: 'Decir que no con claridad', desc: 'Usar tus valores como criterio para lo que entra y lo que no en tu vida' },
    ],
    dias: [
      'Nombrar 3 cosas que de verdad te importan — sin importar si son "correctas"',
      'Identificar una decisión pendiente y analizarla desde tus valores',
      'Una conversación con Clara sobre qué vida elegirías si nadie supiera',
    ],
    clara: '¿Si nadie supiera cómo vives — ni tu familia, ni tus amigos, ni las redes — qué cambiarías primero?',
    fortaleza: 'Adaptabilidad social',
    debilidad: 'Dificultad para distinguir valores propios de ajenos',
  },
  proceso: {
    nombre: 'En Proceso de Claridad',
    frase: 'Algo en ti sabe que hay un cambio que hacer. Todavía no sabes exactamente cuál.',
    color: '#F5EFE6',
    acento: '#C9A96E',
    revelacion: 'Estás en el punto más fértil del crecimiento: ya no puedes vivir completamente desde el piloto automático, pero todavía no tienes claro del todo qué quieres en cambio. Esa tensión no es un problema — es la señal de que algo está cambiando.',
    partida: 'Tu punto de partida es la pregunta que no te has atrevido a responder del todo. No la que tienes respuesta — la que te incomoda porque la respuesta implicaría cambiar algo.',
    ejes: [
      { titulo: 'Clarificar la brújula', desc: 'Definir con más precisión qué es lo que de verdad importa ahora' },
      { titulo: 'Pasar de la reflexión a la acción', desc: 'Tomar una decisión pequeña desde tus valores y ver qué pasa' },
      { titulo: 'Soltar lo que ya no encaja', desc: 'Identificar qué estás sosteniendo por inercia, no por elección' },
    ],
    dias: [
      'Responder esta pregunta: ¿qué estaría haciendo diferente si supiera con certeza qué quiero?',
      'Una decisión pequeña tomada desde tus valores, no desde la expectativa',
      'Una conversación con Clara sobre qué es lo que más te cuesta soltar',
    ],
    clara: '¿Hay una decisión que llevas tiempo posponiendo porque no sabes qué quieres de verdad? ¿Cuál es?',
    fortaleza: 'Consciencia de que algo quiere cambiar',
    debilidad: 'Dificultad para pasar de la reflexión a la acción',
  },
  alineada: {
    nombre: 'Alineada con tus Valores',
    frase: 'Vives desde un lugar propio. Tienes una brújula — y la usas.',
    color: '#EAF5EE',
    acento: '#1D9E75',
    revelacion: 'Vivir alineada con tus valores no es lo normal. Requirió trabajo — decir que no a cosas que no encajaban, soltar expectativas ajenas, tomar decisiones incómodas. Eso te da una base muy sólida para lo que sigue.',
    partida: 'Tu punto de partida es la siguiente pregunta: ¿hacia dónde apunta tu brújula ahora? Estar alineada no es llegar — es un proceso continuo. ¿Qué valor tuyo todavía no estás honrando del todo?',
    ejes: [
      { titulo: 'Profundizar la alineación', desc: 'Llevarla a las áreas donde todavía hay tensión entre lo que valoras y cómo vives' },
      { titulo: 'Renovar la brújula', desc: 'Los valores evolucionan — ¿sigues viviendo desde los tuyos de hoy o los de hace 5 años?' },
      { titulo: 'Construir hacia adelante', desc: 'Usar la claridad actual para tomar las decisiones más importantes que vienen' },
    ],
    dias: [
      'Identificar un valor tuyo que todavía no estás honrando completamente',
      'Una acción concreta que lo honre esta semana',
      'Una conversación con Clara sobre hacia dónde quieres que apunte tu vida los próximos años',
    ],
    clara: '¿Qué valor tuyo crees que todavía no estás honrando del todo — y qué pasaría si empezaras a hacerlo?',
    fortaleza: 'Claridad sobre lo que importa',
    debilidad: 'Posible desactualización de la brújula',
  },
}

function calcularPerfil(respuestas) {
  let total = 0
  PREGUNTAS.forEach((p, i) => {
    const val = respuestas[i] || 3
    total += p.dir === 'neg' ? (6 - val) : val
  })
  const pct = ((total - PREGUNTAS.length) / (PREGUNTAS.length * 4)) * 100
  if (pct < 40) return PERFILES.desconectada
  if (pct < 70) return PERFILES.proceso
  return PERFILES.alineada
}

export default function TestValores() {
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
              user_id: usuario.id, test_slug: 'valores',
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
          <img src="/images/test_valores_portada.png" alt="Test valores" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,250,247,1) 0%, rgba(250,250,247,0) 60%)' }} />
          <button onClick={() => router.back()} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#2A2520', cursor: 'pointer', fontFamily: 'inherit' }}>← volver</button>
        </div>
        <div style={s.container}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Test · 5 min · Esencial</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '16px', lineHeight: 1.2 }}>¿Estás viviendo lo que de verdad importa?</div>
          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '20px' }}>No los valores que dices tener. Los que se ven en cómo gastas tu tiempo, tu energía y tus decisiones.</div>
          <div style={{ background: '#F5EFE6', borderRadius: '12px', padding: '12px 14px', marginBottom: '32px', borderLeft: '3px solid #C9A96E' }}>
            <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Metodología</div>
            <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>Basado en Terapia de Aceptación y Compromiso (ACT) y clarificación de valores de Steven Hayes.</div>
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
              <span style={{ fontSize: '11px', color: '#9A8F84' }}>Valores reales</span>
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
          <button onClick={() => router.push(`/holaclara/chat?msg=${encodeURIComponent(`Clara, hice el test de valores. Mi resultado fue "${perfil.nombre}". ${perfil.clara}`)}`)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
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
