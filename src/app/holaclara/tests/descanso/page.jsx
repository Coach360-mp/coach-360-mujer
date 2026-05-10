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
  { id: 'P1', tipo: 'FIS', texto: 'Cuando despierto, mi cuerpo se siente cansado aunque haya dormido bien.' },
  { id: 'P2', tipo: 'MEN', texto: 'Mi mente no para, ni siquiera cuando intento descansar.' },
  { id: 'P3', tipo: 'EMO', texto: 'Termino el día sintiéndome emocionalmente vacía o sobrecargada.' },
  { id: 'P4', tipo: 'SEN', texto: 'Las luces, los ruidos, las pantallas me sobreestimulan más de lo que reconozco.' },
  { id: 'P5', tipo: 'SOC', texto: 'Después de estar con gente, necesito recuperarme aunque haya disfrutado.' },
  { id: 'P6', tipo: 'CRE', texto: 'Hace tiempo que no hago algo solo por placer, sin un propósito útil.' },
  { id: 'P7', tipo: 'ESP', texto: 'Siento que mi vida tiene movimiento pero no dirección clara.' },
  { id: 'P8', tipo: 'FIS', texto: 'Mi cuerpo tiene tensiones acumuladas (cuello, mandíbula, espalda) que no se van.' },
  { id: 'P9', tipo: 'MEN', texto: 'Tomo decisiones todo el día y al final no puedo decidir ni qué cenar.' },
  { id: 'P10', tipo: 'EMO', texto: 'Me cuesta diferenciar mis emociones de las de las personas a mi alrededor.' },
  { id: 'P11', tipo: 'SEN', texto: 'Cuando estoy sola en silencio, me siento mejor de lo que esperaba.' },
  { id: 'P12', tipo: 'SOC', texto: 'Tengo relaciones que me drenan más de lo que me llenan.' },
  { id: 'P13', tipo: 'CRE', texto: 'Resuelvo problemas todo el día pero rara vez creo algo desde mí.' },
  { id: 'P14', tipo: 'ESP', texto: 'Hago muchas cosas pero ninguna me conecta con algo más grande que yo.' },
]

const OPCIONES = [
  { valor: 1, label: 'Nunca' },
  { valor: 2, label: 'Casi nunca' },
  { valor: 3, label: 'A veces' },
  { valor: 4, label: 'Casi siempre' },
  { valor: 5, label: 'Siempre' },
]

const PERFILES = {
  FIS: {
    slug: 'descanso-fisico',
    titulo: 'Tu cuerpo lleva tiempo pidiendo descansar de verdad',
    tipo: 'Descanso Físico',
    color: '#F5EFE6',
    acento: '#C9A96E',
    frase: 'Mi descanso pendiente es físico. No es flojera, es información.',
    fortaleza: 'Resistencia y capacidad de seguir adelante',
    debilidad: 'Ignorar las señales físicas del agotamiento',
    interpretacion: 'Tu cuerpo está agotado a un nivel que el sueño solo no resuelve. Llevas semanas o meses funcionando con la batería en rojo, y has aprendido a operar así.\n\nEl descanso físico tiene dos formas. Pasivo: dormir, recostarte, soltar el cuerpo. Activo: estiramientos, yoga restaurativa, masaje, caminar lento sin destino.\n\nProbablemente has intentado dormir más y no fue suficiente. Eso es porque tu cuerpo necesita también el descanso activo: liberar tensiones acumuladas, mover lo que está estancado.',
    partida: 'Esta semana, una cosa concreta: 20 minutos al día solo para tu cuerpo. No para entrenar. Para escucharlo.',
    ejes: [
      { titulo: 'Descanso pasivo de calidad', desc: 'Mejorar el sueño y los momentos de reposo real, sin pantallas ni estimulación' },
      { titulo: 'Descanso activo', desc: 'Estiramientos, yoga restaurativa o caminar lento — mover lo que está estancado' },
      { titulo: 'Escuchar señales corporales', desc: 'Aprender a reconocer el cansancio antes de que llegue al límite' },
    ],
    dias: [
      'Identificar dónde carga tensión tu cuerpo (cuello, mandíbula, espalda)',
      '20 minutos de movimiento suave — no para quemar calorías, para soltar',
      'Una noche con ritual de cierre: sin pantallas 30 min antes de dormir',
    ],
    invitacion: '¿Cuándo fue la última vez que hiciste algo solo para tu cuerpo, sin que sirviera para nada más?',
  },
  MEN: {
    slug: 'descanso-mental',
    titulo: 'Tu mente no se apaga. Y eso te está costando.',
    tipo: 'Descanso Mental',
    color: '#EEEDFE',
    acento: '#534AB7',
    frase: 'Mi descanso pendiente es mental. Mi cabeza piensa más rápido de lo que vivo.',
    fortaleza: 'Capacidad analítica y resolución de problemas',
    debilidad: 'Mente que no se apaga ni en el descanso',
    interpretacion: 'Tu mente está en modo análisis 24/7. Resuelves problemas mientras te bañas, planificas mientras manejas, repasas conversaciones cuando intentas dormir.\n\nEsto se llama fatiga cognitiva, y es invisible hasta que se vuelve insoportable. La gente cree que descansa la mente con Netflix o redes sociales, pero esos son estimulantes, no descansos.\n\nEl descanso mental real es: silencio, naturaleza, hacer algo manual sin pensar mucho, escribir lo que tienes en la cabeza para sacarlo.',
    partida: 'Esta semana: 3 micro-pausas de 2 minutos al día sin pantalla. Sin agenda, sin producir. Solo eso.',
    ejes: [
      { titulo: 'Vaciado mental', desc: 'Escribir lo que tienes en la cabeza para sacarlo — el papel aguanta lo que la mente no debería cargar' },
      { titulo: 'Pausas sin estimulación', desc: 'Descanso real no es Netflix — es silencio, naturaleza o algo manual sin pensar' },
      { titulo: 'Límites a la toma de decisiones', desc: 'Reducir la carga cognitiva diaria para llegar al final del día con más reserva' },
    ],
    dias: [
      'Una pausa de 5 minutos sin pantalla en algún momento del día',
      'Escribir todo lo que tienes en la cabeza antes de dormir — sacarlo del loop',
      'Identificar una decisión que puedes delegar o eliminar esta semana',
    ],
    invitacion: '¿Cuándo fue la última vez que tu mente estuvo realmente en silencio?',
  },
  EMO: {
    slug: 'descanso-emocional',
    titulo: 'Llevas demasiado tiempo procesando emociones que no son tuyas.',
    tipo: 'Descanso Emocional',
    color: '#FAECE7',
    acento: '#993C1D',
    frase: 'Mi descanso pendiente es emocional. Cuido tanto a otros que olvido cuidarme yo.',
    fortaleza: 'Alta capacidad empática y contención',
    debilidad: 'Sistema emocional saturado de cargas ajenas',
    interpretacion: 'Eres alguien que siente mucho, escucha mucho, contiene mucho. A los demás y a ti misma. Y eso pesa.\n\nEl descanso emocional es la capacidad de no estar disponible para las emociones de los demás. De decir "ahora no puedo con esto" sin culpa.\n\nProbablemente cargas conversaciones que no son tuyas, problemas de gente que no son tu responsabilidad. Tu sistema emocional está saturado.',
    partida: 'Esta semana: identifica UNA relación que estás cargando que no es tuya, y pon un límite suave. Uno solo.',
    ejes: [
      { titulo: 'Soltar lo que no es tuyo', desc: 'Aprender a diferenciar tus emociones de las de los demás sin culpa' },
      { titulo: 'Límites emocionales', desc: 'Decir "ahora no puedo" sin que se sienta como abandono o egoísmo' },
      { titulo: 'Espacios sin rol', desc: 'Momentos donde no tienes que ser fuerte, disponible ni comprensiva' },
    ],
    dias: [
      'Identificar qué emociones llevas hoy que no son tuyas',
      'Una conversación donde dices lo que necesitas — no lo que el otro necesita',
      'Un momento de la semana solo tuyo, sin estar disponible para nadie',
    ],
    invitacion: '¿Qué emociones llevas hoy que no son tuyas?',
  },
  SEN: {
    slug: 'descanso-sensorial',
    titulo: 'El mundo te grita sin que lo notes.',
    tipo: 'Descanso Sensorial',
    color: '#EAF5EE',
    acento: '#1D9E75',
    frase: 'Mi descanso pendiente es sensorial. El silencio me hace bien y no lo sabía.',
    fortaleza: 'Sensibilidad y capacidad de percepción',
    debilidad: 'Sistema nervioso sobreestimulado sin saberlo',
    interpretacion: 'Vives sobreestimulada y ya ni te das cuenta. Pantallas, notificaciones, luces, ruido de fondo. Tu sistema nervioso recibe miles de inputs al día y casi nunca tiene silencio real.\n\nDescanso sensorial es: cerrar los ojos sin pantalla, estar en un lugar silencioso, bajar la luz al final del día, alejarse del celular por horas.\n\nLa buena noticia: es de los descansos más rápidos de activar. El cuerpo responde casi de inmediato al silencio.',
    partida: 'Esta semana: 30 minutos al día sin estímulos digitales. Cocinar en silencio, caminar sin auriculares, mirar por la ventana.',
    ejes: [
      { titulo: 'Silencio real cada día', desc: 'Al menos 20-30 min sin pantallas, música ni notificaciones — el sistema nervioso necesita ese reset' },
      { titulo: 'Entorno sensorial consciente', desc: 'Luz suave, menos ruido, espacios ordenados — el entorno impacta el sistema nervioso más de lo que crees' },
      { titulo: 'Detox digital progresivo', desc: 'Empezar a reducir la carga de inputs — no todo de golpe, sino por capas' },
    ],
    dias: [
      'Una mañana sin revisar el celular por la primera hora del día',
      '30 minutos en silencio real — sin música, sin podcast, sin pantalla',
      'Bajar la luz de tu entorno una hora antes de dormir y notar la diferencia',
    ],
    invitacion: '¿Cuándo fue la última vez que estuviste en silencio real — sin pantallas, sin música, sin ruido?',
  },
  SOC: {
    slug: 'descanso-social',
    titulo: 'No todas las personas en tu vida te están sumando.',
    tipo: 'Descanso Social',
    color: '#F5EFE6',
    acento: '#C9A96E',
    frase: 'Mi descanso pendiente es social. Hay personas que me cansan y necesito nombrarlo.',
    fortaleza: 'Capacidad de conexión y presencia con otros',
    debilidad: 'Energía social agotada por relaciones que drenan',
    interpretacion: 'Tu energía social está agotada porque cargas relaciones que no te llenan. Probablemente tienes vínculos con personas que demandan más de lo que dan.\n\nEl descanso social tiene dos caras: pasar más tiempo sola para recuperarte, y rodearte de personas que te energizan en lugar de drenarte.\n\nNo es egoísmo identificar quién te da y quién te quita. Es supervivencia emocional.',
    partida: 'Esta semana: haz una lista mental — ¿con quién te sientes más viva después de verla? ¿Con quién más vacía? Eso es información.',
    ejes: [
      { titulo: 'Tiempo genuinamente sola', desc: 'No soledad por obligación — soledad elegida para recuperar energía propia' },
      { titulo: 'Mapear relaciones por energía', desc: 'Identificar quién suma y quién resta, sin juicio — solo como información' },
      { titulo: 'Límites sociales sin culpa', desc: 'Decir que no a planes que drenan, sin necesitar justificarlo demasiado' },
    ],
    dias: [
      'Identificar con quién de tu entorno sales más cansada de lo que llegaste',
      'Una tarde o mañana sola — sin agenda, sin compromisos, sin estar disponible',
      'Decir que no a algo social que no te apetece esta semana — y no explicar demasiado',
    ],
    invitacion: '¿Hay alguien en tu vida con quien salgas y termines más cansada de lo que llegaste?',
  },
  CRE: {
    slug: 'descanso-creativo',
    titulo: 'Resuelves problemas todo el día pero no creas nada desde ti.',
    tipo: 'Descanso Creativo',
    color: '#EEEDFE',
    acento: '#534AB7',
    frase: 'Mi descanso pendiente es creativo. Hace tiempo que no hago algo solo por placer.',
    fortaleza: 'Capacidad de resolución y pensamiento estratégico',
    debilidad: 'Ausencia de creatividad sin propósito productivo',
    interpretacion: 'Tu cabeza está ocupada todo el día resolviendo. Tareas, problemas, decisiones. Pero ¿cuándo fue la última vez que hiciste algo creativo solo por gusto, sin que sirviera para nada?\n\nEl descanso creativo no es hacer manualidades obligadas. Es contacto con belleza, con asombro, con producción que no tiene propósito útil.\n\nTu cerebro necesita este tipo de experiencia para regenerarse — no como un lujo, sino como una necesidad cognitiva real.',
    partida: 'Esta semana: UNA cosa creativa sin propósito útil. 15 minutos. Dibujar, cocinar algo nuevo, escribir sin destino, escuchar música de verdad.',
    ejes: [
      { titulo: 'Crear sin propósito útil', desc: 'Hacer algo creativo que no sirva para nada — eso es exactamente el punto' },
      { titulo: 'Consumir belleza activamente', desc: 'Arte, música, naturaleza — no de fondo, sino como protagonista de un momento' },
      { titulo: 'Recuperar el juego', desc: 'Hacer algo como lo hacías de niña — por puro gusto, sin que nadie evalúe' },
    ],
    dias: [
      'Recordar qué hacías de niña solo porque te gustaba, sin que nadie te lo pidiera',
      '15 minutos haciendo algo creativo sin pensar en si quedó bien',
      'Consumir algo bello de forma activa — un cuadro, una canción, un atardecer — sin el celular',
    ],
    invitacion: '¿Qué hacías de niña solo porque te gustaba, sin que nadie te lo pidiera?',
  },
  ESP: {
    slug: 'descanso-espiritual',
    titulo: 'Tu vida tiene movimiento, pero te falta dirección.',
    tipo: 'Descanso Espiritual',
    color: '#F5EFE6',
    acento: '#C9A96E',
    frase: 'Mi descanso pendiente es espiritual. Hago mucho y conecto con poco.',
    fortaleza: 'Productividad y capacidad de acción',
    debilidad: 'Falta de conexión con el sentido de lo que haces',
    interpretacion: 'Estás cansada de un cansancio que nadie nombra: el de no saber para qué haces lo que haces. Tu vida funciona, hay logros, hay actividad, pero falta sentido.\n\nEl descanso espiritual no es religión. Es conectarte con algo más grande que tú: la naturaleza, una causa, tu propósito, tus valores más profundos.\n\nNo es depresión. Es el llamado a profundizar.',
    partida: 'Esta semana, quédate con UNA pregunta: ¿qué quiero que importe en mi vida los próximos 5 años? No la respondas. Solo vívela.',
    ejes: [
      { titulo: 'Conectar con el por qué', desc: 'Encontrar el hilo de sentido que conecta lo que haces con lo que te importa' },
      { titulo: 'Momentos de conexión profunda', desc: 'Naturaleza, silencio, práctica contemplativa — lo que te conecte con algo más grande' },
      { titulo: 'Claridad de propósito', desc: 'No como destino fijo, sino como brújula que orienta las decisiones cotidianas' },
    ],
    dias: [
      'Escribir tres cosas que haces y que sí se sienten significativas — aunque sean pequeñas',
      'Un momento en la naturaleza, sin celular, sin agenda — solo estar',
      'Una conversación con Clara sobre qué quieres que importe en tu vida',
    ],
    invitacion: '¿Hay algo que haces en tu vida que se siente significativo de verdad — no solo importante?',
  },
}

const PRIORIDAD = ['MEN', 'EMO', 'ESP', 'FIS', 'SEN', 'SOC', 'CRE']

function calcularResultado(respuestas) {
  const scores = { FIS: 0, MEN: 0, EMO: 0, SEN: 0, SOC: 0, CRE: 0, ESP: 0 }
  PREGUNTAS.forEach(p => { scores[p.tipo] += respuestas[p.id] || 0 })
  const ordenado = Object.entries(scores).sort((a, b) => b[1] - a[1] || PRIORIDAD.indexOf(a[0]) - PRIORIDAD.indexOf(b[0]))
  const top3 = ordenado.slice(0, 3).map(([tipo]) => tipo)
  const fortaleza = ordenado[ordenado.length - 1][0]
  return { scores, top3, fortaleza, principal: top3[0] }
}

export default function TestDescansoPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [fase, setFase] = useState('intro') // intro | test | calculando | resultado
  const [preguntaIdx, setPreguntaIdx] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/holaclara/auth')
      else setUsuario(user)
    })
  }, [])

  const responder = (valor) => {
    const pregunta = PREGUNTAS[preguntaIdx]
    const nuevasRespuestas = { ...respuestas, [pregunta.id]: valor }
    setRespuestas(nuevasRespuestas)
    if (preguntaIdx < PREGUNTAS.length - 1) {
      setPreguntaIdx(i => i + 1)
    } else {
      setFase('calculando')
      setTimeout(async () => {
        const res = calcularResultado(nuevasRespuestas)
        setResultado(res)
        if (usuario) {
          try {
            await supabase.from('tests_resultados_usuaria').upsert({
              user_id: usuario.id,
              test_slug: 'tipo-de-descanso',
              respuestas: nuevasRespuestas,
              resultado_slug: res.principal,
              scores: res.scores,
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

  // INTRO
  if (fase === 'intro') return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        {/* IMAGEN HERO */}
        <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
          <img src="/images/test_descanso_portada.png" alt="Test de descanso" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(250,250,247,1) 0%, rgba(250,250,247,0.2) 60%, rgba(250,250,247,0) 100%)' }} />
          <button onClick={() => router.back()} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: '#2A2520', cursor: 'pointer', fontFamily: 'inherit' }}>← volver</button>
        </div>
        <div style={s.container}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Test · 6 minutos · Gratis</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '30px', color: '#2A2520', marginBottom: '16px', lineHeight: 1.2 }}>¿Qué tipo de descanso necesitas?</div>
          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '24px' }}>
            Llevas tiempo cansada. Has dormido más, has tomado vacaciones, y aún así no descansas de verdad.
            <br /><br />
            Hay una razón. El descanso físico es solo uno de siete tipos posibles. Este test te muestra tus tres descansos pendientes y cuál es tu fortaleza.
          </div>
          <div style={{ background: '#F5EFE6', borderRadius: '14px', padding: '14px 16px', marginBottom: '32px', borderLeft: '3px solid #C9A96E' }}>
            <div style={{ fontSize: '12px', color: '#9A8F84', fontWeight: 700, marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>Metodología</div>
            <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>Basado en el trabajo de Saundra Dalton-Smith sobre los 7 tipos de descanso — con más de 30M de visualizaciones en TED.</div>
          </div>
          <button onClick={() => setFase('test')} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
            Empezar el test →
          </button>
          <button onClick={() => router.back()} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
            Volver
          </button>
        </div>
        <TabBar />
      </div>
    </>
  )

  // TEST
  if (fase === 'test') {
    const pregunta = PREGUNTAS[preguntaIdx]
    const progreso = ((preguntaIdx) / PREGUNTAS.length) * 100
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
        <div style={s.root}>
          <div style={{ padding: '16px 20px 0', maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#9A8F84', fontWeight: 700 }}>{preguntaIdx + 1} de {PREGUNTAS.length}</span>
              <span style={{ fontSize: '11px', color: '#9A8F84' }}>¿Qué tipo de descanso necesitas?</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(42,37,32,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#C9A96E', borderRadius: '2px', width: `${progreso}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
          <div style={s.container}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520', marginBottom: '32px', lineHeight: 1.4, marginTop: '24px' }}>
              {pregunta.texto}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {OPCIONES.map(op => (
                <button key={op.valor} onClick={() => responder(op.valor)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(42,37,32,0.12)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 600, color: '#2A2520', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {op.label}
                  <span style={{ fontSize: '12px', color: '#C9A96E', fontWeight: 700 }}>{op.valor}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  // CALCULANDO
  if (fase === 'calculando') return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #EDE8DF', borderTopColor: '#C9A96E', animation: 'spin 1s linear infinite', marginBottom: '24px' }} />
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '8px' }}>Clara está leyendo tus respuestas...</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E' }}>un momento</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </>
  )

  // RESULTADO
  if (fase === 'resultado' && resultado) {
    const perfilPrincipal = PERFILES[resultado.principal]
    const top3Perfiles = resultado.top3.map(t => PERFILES[t])
    const fortalezaPerfil = PERFILES[resultado.fortaleza]

    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
        <div style={s.root}>
          <div style={s.container}>

            {/* PERFIL PRINCIPAL */}
            <div style={{ background: perfilPrincipal.color, borderRadius: '20px', padding: '24px', marginBottom: '16px', borderLeft: `4px solid ${perfilPrincipal.acento}` }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: perfilPrincipal.acento, fontWeight: 700, marginBottom: '8px' }}>Tu descanso principal</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '10px', lineHeight: 1.2 }}>{perfilPrincipal.tipo}</div>
              <div style={{ fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>{perfilPrincipal.frase}</div>
            </div>

            {/* FORTALEZA / A TRABAJAR */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div style={{ flex: 1, background: '#EAF5EE', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#1D9E75', fontWeight: 700, marginBottom: '6px' }}>Tu fortaleza</div>
                <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.4 }}>{fortalezaPerfil.tipo}</div>
              </div>
              <div style={{ flex: 1, background: '#FAECE7', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#993C1D', fontWeight: 700, marginBottom: '6px' }}>A trabajar</div>
                <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.4 }}>{perfilPrincipal.debilidad}</div>
              </div>
            </div>

            {/* TOP 3 DESCANSOS */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '10px' }}>Tus 3 descansos pendientes</div>
              {top3Perfiles.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '12px 14px', background: i === 0 ? p.color : '#fff', borderRadius: '12px', marginBottom: '8px', border: i === 0 ? `2px solid ${p.acento}` : '0.5px solid rgba(42,37,32,0.1)' }}>
                  <div style={{ fontSize: '13px', color: p.acento, fontWeight: 700, minWidth: '20px' }}>{i + 1}</div>
                  <div style={{ fontSize: '14px', fontWeight: i === 0 ? 700 : 500, color: '#2A2520' }}>{p.tipo}</div>
                  {i === 0 && <div style={{ marginLeft: 'auto', fontSize: '11px', color: p.acento, fontWeight: 700 }}>Principal</div>}
                </div>
              ))}
            </div>

            {/* LO QUE ESTO REVELA */}
            <div style={{ background: '#2A2520', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '10px' }}>Lo que esto revela</div>
              {perfilPrincipal.interpretacion.split('\n\n').map((p, i) => (
                <div key={i} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: i < 1 ? '12px' : 0 }}>{p}</div>
              ))}
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', color: '#C9A96E', lineHeight: 1.6, fontStyle: 'italic' }}>{perfilPrincipal.partida}</div>
            </div>

            {/* LO QUE PUEDES DESARROLLAR */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>Lo que puedes desarrollar</div>
              {perfilPrincipal.ejes.map((eje, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: perfilPrincipal.acento, flexShrink: 0, marginTop: '6px' }} />
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
              {perfilPrincipal.dias.map((dia, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < perfilPrincipal.dias.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '12px', color: perfilPrincipal.acento, fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>{dia}</div>
                </div>
              ))}
            </div>

            {/* PREGUNTA CLARA */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '24px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '12px', color: '#fff' }}>c</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.6 }}>{perfilPrincipal.invitacion}</div>
              </div>
            </div>

            {/* CTAs */}
            <button onClick={() => router.push(`/holaclara/chat?msg=${encodeURIComponent(`Clara, acabo de hacer el test de descanso. Mi resultado principal es ${perfilPrincipal.tipo}. ${perfilPrincipal.invitacion}`)}`)} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
              Hablar con Clara sobre esto →
            </button>
            <button onClick={() => router.push('/holaclara/conocerme')} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
              Volver a Conocerme
            </button>
          </div>
          <TabBar />
        </div>
      </>
    )
  }

  return null
}
