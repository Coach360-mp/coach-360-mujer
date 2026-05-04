'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const preguntas = [
  {
    texto: "Cuando termina el día, ¿qué es lo que más te pesa?",
    opciones: [
      { texto: "Todo lo que quedó sin hacer o mal hecho", eje: "T" },
      { texto: "Haber dado tanto sin recibir nada a cambio", eje: "V" },
      { texto: "La sensación de que el día no fue realmente mío", eje: "I" },
      { texto: "El cuerpo: tensión, cansancio, algo que no encuentro cómo nombrar", eje: "C" }
    ]
  },
  {
    texto: "¿Cuándo fue la última vez que dijiste «no» sin sentirte mal después?",
    opciones: [
      { texto: "No recuerdo — siempre hay algo más urgente que atender", eje: "T" },
      { texto: "Casi nunca — me cuesta mucho decepcionar a alguien", eje: "V" },
      { texto: "No lo sé — a veces ni sé qué quiero para poder decirlo", eje: "I" },
      { texto: "Mi cuerpo me lo dice antes que yo — se tensa, se cansa, me avisa", eje: "C" }
    ]
  },
  {
    texto: "Si te dieran un sábado libre sin obligaciones, ¿qué haría tu mente?",
    opciones: [
      { texto: "Llenarlo de pendientes o sentirme culpable por no hacerlo", eje: "T" },
      { texto: "Pensar en lo que necesitan los demás antes que en mí", eje: "V" },
      { texto: "No saber qué quiero hacer — llevaría un rato recordarlo", eje: "I" },
      { texto: "Probablemente dormir o quedarme quieta — mi cuerpo lo pide", eje: "C" }
    ]
  },
  {
    texto: "¿Qué frase te suena más familiar?",
    opciones: [
      { texto: "«Descansaré cuando termine esto.» (Aunque nunca termina.)", eje: "T" },
      { texto: "«No quiero ser una carga para nadie.»", eje: "V" },
      { texto: "«¿Esto es realmente lo que quiero?»", eje: "I" },
      { texto: "«Algo en mi cuerpo no está bien, aunque los médicos no encuentran nada.»", eje: "C" }
    ]
  },
  {
    texto: "Cuando algo te sale bien, ¿qué pasa primero?",
    opciones: [
      { texto: "Ya pienso en lo que sigue o en lo que pudo salir mejor", eje: "T" },
      { texto: "Me pregunto si los demás están contentos con el resultado", eje: "V" },
      { texto: "Celebro por fuera, pero por dentro me pregunto si eso me hace feliz", eje: "I" },
      { texto: "Finalmente el cuerpo baja la guardia — noto el alivio físico", eje: "C" }
    ]
  },
  {
    texto: "¿Cuál de estas situaciones te genera más incomodidad?",
    opciones: [
      { texto: "No tener el control de un proyecto o resultado importante", eje: "T" },
      { texto: "Sentir que alguien está molesto conmigo sin decírmelo", eje: "V" },
      { texto: "Que me pregunten «¿y tú qué quieres?» y no saber qué responder", eje: "I" },
      { texto: "Ignorar señales de mi cuerpo y que después todo explote", eje: "C" }
    ]
  },
  {
    texto: "¿Cómo describirías tu relación con el descanso?",
    opciones: [
      { texto: "Lo postergo siempre — hay algo más importante primero", eje: "T" },
      { texto: "Me cuesta descansar si sé que alguien me necesita", eje: "V" },
      { texto: "Descanso, pero no me recargo — algo falta aunque no sepa qué", eje: "I" },
      { texto: "Mi cuerpo exige descanso que mi mente no quiere darle", eje: "C" }
    ]
  },
  {
    texto: "Si una persona cercana te describe, ¿qué diría probablemente?",
    opciones: [
      { texto: "«Siempre está ocupada, siempre produce, pero nunca para.»", eje: "T" },
      { texto: "«Siempre está para todos, pero nadie sabe cómo está ella.»", eje: "V" },
      { texto: "«Ha cambiado, pero no sé si es para bien o para mal.»", eje: "I" },
      { texto: "«Se queja del cansancio, pero no se cuida — o lo intenta y no funciona.»", eje: "C" }
    ]
  },
  {
    texto: "¿Por qué estás aquí hoy?",
    opciones: [
      { texto: "Necesito ordenar mis prioridades y dejar de sentirme al límite", eje: "T" },
      { texto: "Quiero aprender a cuidarme sin dejar de cuidar a los que quiero", eje: "V" },
      { texto: "Quiero reencontrarme — siento que me perdí en el camino", eje: "I" },
      { texto: "Quiero entender qué me está diciendo mi cuerpo y cómo responderle", eje: "C" }
    ]
  }
]

function calcularPerfil(respuestas) {
  const score = { T: 0, V: 0, I: 0, C: 0 }
  respuestas.forEach(r => { if (r) score[r]++ })
  const max = Math.max(...Object.values(score))
  const ganadores = Object.keys(score).filter(k => score[k] === max)
  const perfiles = {
    T: 'cumplidora_cansada',
    V: 'cuida_a_todos',
    I: 'no_se_reconoce',
    C: 'escucha_el_cuerpo'
  }
  if (ganadores.length === 1 && max >= 3) return { perfil: perfiles[ganadores[0]], puntajes: score }
  return { perfil: 'la_que_busca', puntajes: score }
}

export default function TestEntrada() {
  const router = useRouter()
  const [actual, setActual] = useState(0)
  const [respuestas, setRespuestas] = useState(new Array(9).fill(null))
  const [cargando, setCargando] = useState(false)

  const pct = Math.round(((actual + 1) / 9) * 100)

  function seleccionar(eje) {
    const nuevas = [...respuestas]
    nuevas[actual] = eje
    setRespuestas(nuevas);
    // auto-avance
    setTimeout(() => {
      if (actual < 8) setActual(a => a + 1)
      else {
        setCargando(true)
        localStorage.setItem('hc_resultado_test', JSON.stringify(calcularPerfil(nuevas)))
        setTimeout(() => router.push('/holaclara/resultado'), 2000)
      }
    }, 350)
  }

  function siguiente() {
    if (actual < 8) {
      setActual(actual + 1)
    } else {
      const resultado = calcularPerfil(respuestas)
      setCargando(true)
      localStorage.setItem('hc_resultado_test', JSON.stringify(resultado))
      setTimeout(() => {
        router.push('/holaclara/resultado')
      }, 2000)
    }
  }

  function anterior() {
    if (actual > 0) setActual(actual - 1)
  }

  const q = preguntas[actual]
  const seleccionada = respuestas[actual]

  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh', background: '#FAFAF7',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '2px solid #EDE8DF', borderTopColor: '#C9A96E',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '16px', color: '#2A2520' }}>
          Clara está leyendo tus respuestas.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: 'Jost, sans-serif' }}>
      {/* NAV */}
      <nav style={{
        padding: '14px 28px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '0.5px solid #F0EBE3'
      }}>
        <div>
          <div style={{ fontSize: '9px', color: '#9A8F84', letterSpacing: '0.05em' }}>Hola</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#2A2520', lineHeight: 1 }}>Clara</div>
          <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
          <div style={{ fontSize: '6px', letterSpacing: '0.1em', color: '#9A8F84', textTransform: 'uppercase' }}>
            Para la que quiere más y necesita parar.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: i <= actual ? '#C9A96E' : '#E8E4DC'
            }} />
          ))}
        </div>
      </nav>

      {/* PROGRESS */}
      <div style={{ padding: '20px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9A8F84', marginBottom: '8px' }}>
          <span>Pregunta {actual + 1} de 9</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: '2px', background: '#EDE8DF', borderRadius: '1px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: '#C9A96E', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* PREGUNTA */}
      <div style={{ padding: '28px 28px 20px' }}>
        <p style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic',
          fontSize: '20px', fontWeight: 300, color: '#2A2520',
          lineHeight: 1.45, marginBottom: '24px'
        }}>
          {q.texto}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {q.opciones.map((op, i) => (
            <button key={i} onClick={() => seleccionar(op.eje)} style={{
              padding: '13px 18px', borderRadius: '10px',
              border: seleccionada === op.eje ? '1.5px solid #C9A96E' : '0.5px solid #E8E4DC',
              background: seleccionada === op.eje ? '#FBF7F0' : '#fff',
              fontSize: '13px', color: '#2A2520', fontFamily: 'inherit',
              fontWeight: seleccionada === op.eje ? 400 : 300,
              cursor: 'pointer', textAlign: 'left', lineHeight: 1.45,
              transition: 'all 0.15s'
            }}>
              {op.texto}
            </button>
          ))}
        </div>

        {/* NAVEGACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button onClick={anterior} style={{
            background: 'transparent', border: 'none',
            fontSize: '12px', color: '#9A8F84', cursor: 'pointer',
            visibility: actual === 0 ? 'hidden' : 'visible'
          }}>
            ← Anterior
          </button>
          <button onClick={siguiente} disabled={!seleccionada} style={{
            padding: '12px 28px', borderRadius: '10px',
            background: seleccionada ? '#2A2520' : '#EDE8DF',
            color: seleccionada ? '#FAFAF7' : '#B4AFA9',
            fontSize: '13px', fontFamily: 'inherit', fontWeight: 500,
            border: 'none', cursor: seleccionada ? 'pointer' : 'default',
            transition: 'all 0.15s'
          }}>
            {actual === 8 ? 'Ver mi perfil →' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}
