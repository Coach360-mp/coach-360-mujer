'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const perfiles = {
  cumplidora_cansada: {
    nombre: "La Cumplidora Cansada",
    titulo: "Llevas mucho tiempo siendo la que resuelve.",
    desc: "Tu energía se fue en cumplir — con el trabajo, con las expectativas, con la imagen de tenerlo todo bajo control. Por fuera todo funciona. Por dentro hay un agotamiento que no tiene razón de estar.",
    clara: "Antes de hablar de productividad o de prioridades — ¿cuándo fue la última vez que paraste de verdad? No para descansar antes de volver. Para parar.",
    tags: ["Trabajo y exigencia", "Límites", "Descanso sin culpa", "Presencia"]
  },
  cuida_a_todos: {
    nombre: "La que Cuida a Todos",
    titulo: "Sabes perfectamente lo que necesitan los demás.",
    desc: "La pregunta es cuándo fue la última vez que alguien te preguntó qué necesitas tú — y lo dijiste de verdad. Tu energía ha estado en función de los vínculos.",
    clara: "Antes de hablar de los demás — ¿qué quisiste tú esta semana? No lo que diste. Lo que quisiste.",
    tags: ["Vínculos", "Límites relacionales", "Autocuidado", "Reciprocidad"]
  },
  no_se_reconoce: {
    nombre: "La que No se Reconoce",
    titulo: "Algo en ti sabe que hay más.",
    desc: "No estás rota ni perdida. Estás en el momento en que una mujer empieza a preguntarse quién es cuando nadie la está mirando.",
    clara: "Esa sensación de extrañeza no es señal de que algo salió mal. Es señal de que algo quiere cambiar. ¿Cuándo empezaste a sentirla?",
    tags: ["Identidad", "Autoconocimiento", "Propósito", "Presencia"]
  },
  escucha_el_cuerpo: {
    nombre: "La que Escucha el Cuerpo",
    titulo: "Tu cuerpo lleva un tiempo diciéndote algo.",
    desc: "No es ansiedad, no es exageración, no es que debas acostumbrarte. Es información. Cansancio que no se va, tensión que vuelve — el cuerpo siempre sabe antes que la mente.",
    clara: "El cuerpo no miente. Antes de buscar qué está mal, te propongo una pregunta distinta: ¿qué está intentando decirte?",
    tags: ["Cuerpo", "Ciclo hormonal", "Energía", "Escucha interna"]
  },
  la_que_busca: {
    nombre: "La que Busca",
    titulo: "Ya sabes que quieres más. Ahora toca definir qué.",
    desc: "No estás buscando arreglarte. Estás buscando crecer. Ya hiciste el trabajo superficial. Lo que buscas ahora es pasar de la pregunta abierta a la claridad concreta.",
    clara: "Estás en un lugar interesante — no hay urgencia, pero sí una pregunta que no para. Esa pregunta es la más valiosa que existe. ¿Cuál es la tuya?",
    tags: ["Crecimiento", "Claridad", "Propósito", "Construcción"]
  }
}

export default function Resultado() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    const data = localStorage.getItem('hc_resultado_test')
    if (!data) { router.push('/holaclara/test'); return }
    const { perfil } = JSON.parse(data)
    setPerfil(perfiles[perfil] || perfiles['la_que_busca'])
  }, [])

  if (!perfil) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #EDE8DF', borderTopColor: '#C9A96E', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: 'Jost, sans-serif' }}>
      <nav style={{ padding: '14px 28px', borderBottom: '0.5px solid #F0EBE3' }}>
        <div>
          <div style={{ fontSize: '9px', color: '#9A8F84', letterSpacing: '0.05em' }}>Hola</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#2A2520', lineHeight: 1 }}>Clara</div>
          <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
          <div style={{ fontSize: '6px', letterSpacing: '0.1em', color: '#9A8F84', textTransform: 'uppercase' }}>Para la que quiere más y necesita parar.</div>
        </div>
      </nav>

      <div style={{ padding: '32px 28px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A8F84', marginBottom: '10px' }}>
          Tu perfil · Hola Clara
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: '#2A2520', lineHeight: 1.2, marginBottom: '12px' }}>
          {perfil.nombre}
        </h1>
        <p style={{ fontSize: '13px', color: '#6B6057', fontWeight: 300, lineHeight: 1.65, marginBottom: '24px' }}>
          {perfil.titulo} {perfil.desc}
        </p>

        <div style={{ background: '#F5EFE6', borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#fff' }}>c</div>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', fontWeight: 300, color: '#2A2520', lineHeight: 1.6, margin: 0 }}>
            "{perfil.clara}"
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {perfil.tags.map(t => (
            <span key={t} style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '0.5px solid #E8D8BC', background: '#fff', color: '#6B6057' }}>{t}</span>
          ))}
        </div>

        <button onClick={() => router.push('/holaclara/auth')} style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          background: '#2A2520', color: '#FAFAF7', fontSize: '13px',
          fontFamily: 'inherit', fontWeight: 500, border: 'none', cursor: 'pointer',
          marginBottom: '8px'
        }}>
          Empezar con Clara →
        </button>
        <button style={{
          width: '100%', padding: '12px', borderRadius: '10px',
          background: 'transparent', color: '#9A8F84', fontSize: '12px',
          fontFamily: 'inherit', border: '0.5px solid #E8E4DC', cursor: 'pointer'
        }}>
          Ya tengo cuenta — iniciar sesión
        </button>
      </div>
    </div>
  )
}
