'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const PERFILES = {
  cumplidora_cansada: {
    nombre: 'Cumplidora Cansada',
    frase: 'Eres de las que cumple. Y eso es una fortaleza — hasta que olvidas cumplir contigo.',
    secreto: 'Hay una versión tuya que no corre, no carga, no resuelve todo. Que simplemente está. Y está más cerca de lo que crees.',
    ejes: [
      { titulo: 'Conocerte mejor', desc: 'Descubrir por qué cumplir se convirtió en tu forma de existir' },
      { titulo: 'Crecer en tus términos', desc: 'Hábitos que no dependan de la voluntad — sino de lo que de verdad importa' },
      { titulo: 'Volver a ti', desc: 'Aprender a estar sin estar haciendo algo' },
    ],
    dias: [
      'Tu primera conversación honesta contigo misma',
      'Tres hábitos que no te cuesten energía extra',
      'Una pausa que no se sienta como perder el tiempo',
    ],
    clara: '¿Cuándo fue la última vez que paraste de verdad? No para descansar antes de volver. Para parar.',
    color: '#F5EFE6',
    acento: '#C9A96E',
  },
  cuida_a_todos: {
    nombre: 'La que Cuida a Todos',
    frase: 'Das mucho. La pregunta es cuánto de lo que das también va hacia ti.',
    secreto: 'No tienes que dejar de cuidar a los demás para cuidarte a ti. Puedes hacer las dos cosas — cuando sabes cómo.',
    ejes: [
      { titulo: 'Conocerte mejor', desc: 'Entender qué hay detrás de esa necesidad de que todos estén bien' },
      { titulo: 'Crecer en tus términos', desc: 'Construir límites que no se sientan como abandono' },
      { titulo: 'Volver a ti', desc: 'Reconectar con lo que tú quieres — más allá de lo que necesitan los demás' },
    ],
    dias: [
      'Identificar una cosa que haces por los demás pero que en realidad es para ti',
      'Una conversación donde digas lo que realmente necesitas',
      'Un espacio en tu semana que sea solo tuyo',
    ],
    clara: '¿Qué quisiste tú esta semana? No lo que diste. Lo que quisiste.',
    color: '#EAF5EE',
    acento: '#1D9E75',
  },
  no_se_reconoce: {
    nombre: 'La que No se Reconoce',
    frase: 'Algo en ti sabe que hay más. No sabes exactamente qué — pero lo sientes.',
    secreto: 'No estás perdida. Estás en el momento exacto en que algo en ti quiere cambiar. Ese momento tiene nombre: es el inicio.',
    ejes: [
      { titulo: 'Conocerte mejor', desc: 'Descubrir quién eres cuando nadie te está mirando' },
      { titulo: 'Crecer en tus términos', desc: 'Construir desde lo que tú valoras — no desde lo que se espera de ti' },
      { titulo: 'Volver a ti', desc: 'Reconocer tu voz entre todo el ruido' },
    ],
    dias: [
      'Una pregunta que lleva tiempo sin respuesta — y empezar a responderla',
      'Claridad sobre una cosa que sí sabes de ti misma',
      'Una decisión pequeña tomada desde lo que tú quieres',
    ],
    clara: '¿Cuándo empezaste a sentir que algo no encajaba? ¿Qué estaba pasando en ese momento?',
    color: '#EEEDFE',
    acento: '#534AB7',
  },
  escucha_el_cuerpo: {
    nombre: 'La que Escucha el Cuerpo',
    frase: 'Tu cuerpo lleva un tiempo diciéndote algo. Y tú llevas un tiempo ignorándolo.',
    secreto: 'Lo que sientes no es ansiedad ni exageración. Es información. Y cuando aprendes a leerla, todo cambia.',
    ejes: [
      { titulo: 'Conocerte mejor', desc: 'Aprender a leer lo que tu cuerpo dice antes de que grite' },
      { titulo: 'Crecer en tus términos', desc: 'Hábitos que respeten tu ciclo y tu energía real' },
      { titulo: 'Volver a ti', desc: 'Recuperar la confianza en lo que sientes' },
    ],
    dias: [
      'Identificar una señal corporal que has estado ignorando',
      'Una práctica de 5 minutos que cambia cómo llega tu cuerpo al día',
      'Una conversación con Clara sobre lo que tu cuerpo intenta decirte',
    ],
    clara: 'El cuerpo no miente. ¿Qué crees que está intentando decirte el tuyo?',
    color: '#FAECE7',
    acento: '#993C1D',
  },
  la_que_busca: {
    nombre: 'La que Busca',
    frase: 'Ya sabes que quieres más. Ahora falta definir exactamente qué.',
    secreto: 'No estás buscando arreglarte — estás buscando crecer. Y hay una diferencia enorme entre las dos cosas.',
    ejes: [
      { titulo: 'Conocerte mejor', desc: 'Claridad sobre qué es lo que de verdad estás buscando' },
      { titulo: 'Crecer en tus términos', desc: 'Pasar de la pregunta abierta a la acción concreta' },
      { titulo: 'Volver a ti', desc: 'Construir desde lo que ya eres — no desde lo que te falta' },
    ],
    dias: [
      'Nombrar la pregunta que más te mueve ahora mismo',
      'Una claridad que llevas tiempo buscando',
      'Un primer paso concreto hacia lo que quieres construir',
    ],
    clara: 'Estás en un lugar interesante. No hay urgencia, pero sí una pregunta que no para. ¿Cuál es la tuya?',
    color: '#F5EFE6',
    acento: '#C9A96E',
  },
}

export default function Resultado() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [perfilKey, setPerfilKey] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('hc_resultado_test')
    if (!data) { router.push('/holaclara/test'); return }
    const { perfil: key } = JSON.parse(data)
    setPerfilKey(key)
    setPerfil(PERFILES[key] || PERFILES['la_que_busca'])
  }, [])

  if (!perfil) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #EDE8DF', borderTopColor: '#C9A96E', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Inter+Tight:wght@300;400;600;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', padding: '0 20px 60px' }}>

          {/* HEADER */}
          <div style={{ padding: '24px 0 32px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', lineHeight: 1 }}>Clara</div>
            <div style={{ height: '1px', background: '#C9A96E', margin: '4px auto', width: '40px' }} />
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginTop: '6px' }}>Tu resultado</div>
          </div>

          {/* PERFIL */}
          <div style={{ background: perfil.color, borderRadius: '20px', padding: '24px', marginBottom: '20px', borderLeft: `4px solid ${perfil.acento}` }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: perfil.acento, fontWeight: 700, marginBottom: '8px' }}>Tu perfil</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '12px', lineHeight: 1.2 }}>{perfil.nombre}</div>
            <div style={{ fontSize: '15px', color: '#2A2520', lineHeight: 1.7, fontWeight: 400 }}>{perfil.frase}</div>
          </div>

          {/* CLARA HABLA */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '0.5px solid rgba(42,37,32,0.1)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '14px', color: '#fff' }}>c</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>"{perfil.clara}"</div>
            </div>
          </div>

          {/* EL SECRETO */}
          <div style={{ background: '#2A2520', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '10px' }}>Lo que pocos saben</div>
            <div style={{ fontSize: '15px', color: '#FAFAF7', lineHeight: 1.7 }}>{perfil.secreto}</div>
          </div>

          {/* TU CAMINO */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '14px' }}>Tu camino con Clara</div>
            {perfil.ejes.map((eje, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: perfil.acento, flexShrink: 0, marginTop: '7px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{eje.titulo}</div>
                  <div style={{ fontSize: '12px', color: '#6B6057', lineHeight: 1.5 }}>{eje.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* EN 7 DÍAS */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '32px', border: '0.5px solid rgba(42,37,32,0.1)' }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '14px' }}>En 7 días puedes tener</div>
            {perfil.dias.map((dia, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < perfil.dias.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '13px', color: perfil.acento, fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</div>
                <div style={{ fontSize: '13px', color: '#2A2520', lineHeight: 1.5 }}>{dia}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button onClick={() => router.push('/holaclara/auth')} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontSize: '15px', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px', letterSpacing: '0.3px' }}>
            Empezar mi camino →
          </button>
          <button onClick={() => router.push('/holaclara/auth?modo=login')} style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontSize: '13px', fontFamily: "'Inter Tight', sans-serif", border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
            Ya tengo cuenta — entrar
          </button>

        </div>
      </div>
    </>
  )
}
