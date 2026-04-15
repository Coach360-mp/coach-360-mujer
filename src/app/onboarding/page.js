'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const momentosVida = [
  { id: 'transicion', label: 'Estoy en un momento de cambio o transición' },
  { id: 'crecimiento', label: 'Quiero crecer profesionalmente' },
  { id: 'equilibrio', label: 'Busco más equilibrio y bienestar' },
  { id: 'relaciones', label: 'Estoy trabajando en mis relaciones' },
  { id: 'reconexion', label: 'Quiero reconectarme conmigo misma' },
  { id: 'empezar', label: 'Estoy empezando algo nuevo' },
]

const identidades = [
  { id: 'mama', label: 'Soy mamá' },
  { id: 'emprendedora', label: 'Soy emprendedora' },
  { id: 'corporativa', label: 'Trabajo en un entorno corporativo' },
  { id: 'lidera', label: 'Lidero equipos' },
  { id: 'minoria', label: 'Soy minoría en mi industria' },
  { id: 'proposito', label: 'Busco propósito' },
  { id: 'transicion_rel', label: 'Saliendo de una relación o etapa' },
  { id: 'ninguna', label: 'Ninguna en particular' },
]

const focos = [
  { id: 'estres', label: 'Manejar mejor mi estrés y ansiedad' },
  { id: 'relaciones', label: 'Mejorar mis relaciones y vínculos' },
  { id: 'proposito', label: 'Encontrar más propósito y sentido' },
  { id: 'confianza', label: 'Fortalecer mi confianza y autoestima' },
  { id: 'cambio', label: 'Navegar un cambio o transición' },
  { id: 'liderazgo', label: 'Desarrollar mi liderazgo' },
]

const dimensionesIniciales = [
  { key: 'mente', label: 'Mente', desc: 'Claridad y enfoque', color: '#6366f1' },
  { key: 'cuerpo', label: 'Cuerpo', desc: 'Energía y vitalidad', color: '#10b981' },
  { key: 'corazon', label: 'Corazón', desc: 'Emociones y vínculos', color: '#f59e0b' },
  { key: 'espiritu', label: 'Espíritu', desc: 'Sentido y calma', color: '#8b5cf6' },
]

const coaches = [
  { name: 'Clara', photo: '/clara.jpg', credential: 'Coach certificada' },
  { name: 'Sofía', photo: '/sofia.jpg', credential: 'Especialista en autodesarrollo' },
  { name: 'Victoria', photo: '/victoria.jpg', credential: 'Neurobiología + Mentora' },
]

export default function Onboarding() {
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false)
  const [step, setStep] = useState(0)
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [momentos, setMomentos] = useState([])
  const [identidadSel, setIdentidadSel] = useState([])
  const [focoSel, setFocoSel] = useState(null)
  const [bienestar, setBienestar] = useState({ mente: 5, cuerpo: 5, corazon: 5, espiritu: 5 })
  const [respuestaLibre, setRespuestaLibre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)

    const { data: profile } = await supabase.from('perfiles').select('onboarding_completado, nombre').eq('id', user.id).single()
    if (profile?.onboarding_completado) {
      router.push('/dashboard')
      return
    }
    if (profile?.nombre) {
      setNombre(profile.nombre)
    } else if (user.user_metadata?.full_name) {
      setNombre(user.user_metadata.full_name.split(' ')[0])
    }
  }

  const toggleMomento = (id) => {
    setMomentos(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id].slice(-2))
  }

  const toggleIdentidad = (id) => {
    setIdentidadSel(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3))
  }

  const completeOnboarding = async () => {
    if (!user) return
    setGuardando(true)
    try {
      await supabase.from('perfiles').update({
        nombre: nombre || user.user_metadata?.full_name || '',
        onboarding_completado: true,
        current_vertical: 'mujer',
        active_verticals: ['mujer'],
      }).eq('id', user.id)

      await supabase.from('onboarding_respuestas').upsert({
        user_id: user.id,
        vertical: 'mujer',
        momento_vida: momentos,
        identidad: identidadSel,
        foco_inicial: focoSel,
        bienestar_inicial: bienestar,
        respuesta_libre: respuestaLibre,
      }, { onConflict: 'user_id,vertical' })

      // Guardar contexto para que Clara lo use
      const contextos = [
        { key: 'momento_vida', value: momentos.join(', ') },
        { key: 'identidad', value: identidadSel.join(', ') },
        { key: 'foco_inicial', value: focoSel },
        { key: 'respuesta_libre', value: respuestaLibre },
      ].filter(c => c.value)

      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id,
            vertical: 'mujer',
            context_key: c.key,
            context_value: c.value,
            source_coach: 'onboarding',
          }))
        )
      }

      // Enviar email de bienvenida Clara
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (u) await fetch('/api/emails/bienvenida', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id, vertical: 'mujer' }) })
      } catch (e) { console.error('Error email bienvenida:', e) }
      router.push('/dashboard')
    } catch (err) {
      console.error('Error guardando onboarding:', err)
      setGuardando(false)
    }
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(0, s - 1))

  const totalSteps = 8
  const canContinue = () => {
    switch (step) {
      case 1: return nombre.trim().length > 0
      case 2: return momentos.length > 0
      case 3: return identidadSel.length > 0
      case 4: return focoSel !== null
      default: return true
    }
  }

  if (!consentimientoAceptado) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', color: '#fff', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 32, color: '#d4af37', marginBottom: 16 }}>✦</div>
      <div style={{ fontSize: 11, letterSpacing: 4, color: '#d4af37', textTransform: 'uppercase', marginBottom: 32, fontWeight: 600 }}>Coach 360</div>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, marginBottom: 16, textAlign: 'center' }}>Antes de empezar</h1>
        <p style={{ fontSize: 14, color: '#c8c8c8', lineHeight: 1.7, marginBottom: 24, textAlign: 'center' }}>Coach 360 recopila datos sobre tu bienestar emocional, estado de ánimo y resultados de tests de autoconocimiento. Estos son <strong style={{ color: '#d4af37' }}>datos sensibles</strong> según la Ley N° 19.628 de Chile y requieren tu consentimiento explícito.</p>
        <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#c8c8c8', lineHeight: 1.8, margin: 0 }}>Al continuar, autorizas a Coach 360 a recopilar y procesar tus datos personales y sensibles para personalizar tu experiencia de coaching. Tus datos no se venden a terceros. Puedes revocar este consentimiento en cualquier momento escribiendo a privacidad@micoach360.com.</p>
        </div>
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 28 }}>Lee nuestra <a href='/privacidad' target='_blank' style={{ color: '#d4af37', textDecoration: 'none' }}>Política de Privacidad completa</a> para más detalles.</p>
        <button onClick={() => setConsentimientoAceptado(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f5c842)', color: '#0a0a0a', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>Acepto y quiero continuar ✦</button>
        <a href='/' style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#888', textDecoration: 'none' }}>No acepto — volver al inicio</a>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header con progreso */}
      <div style={{ padding: '24px 20px 0' }}>
        {step > 0 && (
          <button onClick={back} style={{
            background: 'transparent', border: 'none', color: '#a8a8a8',
            fontSize: 14, cursor: 'pointer', marginBottom: 16,
          }}>← Anterior</button>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 4,
              background: i <= step ? '#d4af37' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '20px 24px 40px',
        maxWidth: 560,
        margin: '0 auto',
        width: '100%',
      }}>

        {/* Paso 0: Bienvenida */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 24, color: '#d4af37' }}>✦</div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#d4af37', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
              Coach 360 Mujer
            </div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 42,
              fontWeight: 300,
              lineHeight: 1.2,
              marginBottom: 20,
            }}>
              Más claridad.<br />Más poder.<br /><span style={{ fontStyle: 'italic', color: '#d4af37' }}>Más tú.</span>
            </h1>
            <p style={{ fontSize: 16, color: '#c8c8c8', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 40px' }}>
              Antes de empezar, queremos conocerte. Son pocas preguntas y todas importan — porque tu experiencia se personaliza según tus respuestas.
            </p>
          </div>
        )}

        {/* Paso 1: Nombre */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Empecemos
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', marginBottom: 40 }}>
              Tu coach te va a tratar por tu nombre
            </p>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 14,
                padding: '18px 20px',
                color: '#fff',
                fontSize: 18,
                textAlign: 'center',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Paso 2: Momento de vida */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 1 de 4
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿En qué momento de tu vida estás?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Elige hasta 2 opciones
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {momentosVida.map(m => {
                const selected = momentos.includes(m.id)
                return (
                  <button key={m.id} onClick={() => toggleMomento(m.id)} style={{
                    background: selected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '16px 18px',
                    color: '#fff',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${selected ? '#d4af37' : 'rgba(255,255,255,0.3)'}`,
                      background: selected ? '#d4af37' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0a0a0a', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{selected && '✓'}</div>
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Paso 3: Identidad */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 2 de 4
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué te identifica más?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Elige hasta 3 opciones
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {identidades.map(i => {
                const selected = identidadSel.includes(i.id)
                return (
                  <button key={i.id} onClick={() => toggleIdentidad(i.id)} style={{
                    background: selected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 20,
                    padding: '12px 18px',
                    color: '#fff',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    fontWeight: selected ? 600 : 400,
                  }}>
                    {selected && '✓ '}{i.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Paso 4: Foco */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 3 de 4
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué te gustaría trabajar primero?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Elige una opción
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {focos.map(f => {
                const selected = focoSel === f.id
                return (
                  <button key={f.id} onClick={() => setFocoSel(f.id)} style={{
                    background: selected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '16px 18px',
                    color: '#fff',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}>
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Paso 5: Bienestar inicial */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 4 de 4
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo estás hoy en cada dimensión?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 32 }}>
              Esta es tu línea base. La vas a ver evolucionar.
            </p>
            {dimensionesIniciales.map(d => (
              <div key={d.key} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{d.label}</span>
                    <span style={{ fontSize: 12, color: '#a8a8a8', marginLeft: 8 }}>{d.desc}</span>
                  </div>
                  <span style={{ fontSize: 18, color: d.color, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{bienestar[d.key]}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={bienestar[d.key]}
                  onChange={(e) => setBienestar(prev => ({ ...prev, [d.key]: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    accentColor: d.color,
                    height: 6,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Paso 6: Respuesta libre */}
        {step === 6 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Una última cosa
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué te gustaría que fuera diferente en tu vida dentro de 90 días?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              No necesitas la respuesta perfecta — solo la honesta. (Opcional)
            </p>
            <textarea
              value={respuestaLibre}
              onChange={(e) => setRespuestaLibre(e.target.value)}
              placeholder="Escribe lo primero que sientas..."
              style={{
                width: '100%',
                minHeight: 160,
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 14,
                padding: 18,
                color: '#fff',
                fontSize: 15,
                lineHeight: 1.6,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Paso 7: Cierre */}
        {step === 7 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 24, color: '#d4af37' }}>✦</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 34, fontWeight: 300, lineHeight: 1.3, marginBottom: 16 }}>
              Todo listo, {nombre || 'bienvenida'}
            </h2>
            <p style={{ fontSize: 16, color: '#c8c8c8', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 32px' }}>
              Tu coach ya sabe quién eres y qué buscas. Cuando entres a conversar, va a tratarte como alguien que ya conoce.
            </p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 32 }}>
              {coaches.map(c => (
                <div key={c.name} style={{ textAlign: 'center' }}>
                  <img src={c.photo} alt={c.name} style={{
                    width: 60, height: 60, borderRadius: '50%', objectFit: 'cover',
                    border: '2px solid rgba(212, 175, 55, 0.4)',
                  }} />
                  <p style={{ fontSize: 12, color: '#d4af37', marginTop: 8, fontWeight: 600 }}>{c.name}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, maxWidth: 360, margin: '0 auto' }}>
              Empiezas con Clara. Puedes subir a Sofía o Victoria cuando quieras desde tu perfil.
            </p>
          </div>
        )}

      </div>

      {/* Botón inferior */}
      <div style={{ padding: '0 24px 32px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        {step < totalSteps - 1 ? (
          <button
            onClick={next}
            disabled={!canContinue()}
            style={{
              width: '100%',
              background: canContinue() ? 'linear-gradient(135deg, #d4af37, #f5c842)' : 'rgba(212, 175, 55, 0.2)',
              color: canContinue() ? '#0a0a0a' : '#a8a8a8',
              border: 'none',
              padding: '18px 24px',
              borderRadius: 30,
              fontSize: 15,
              fontWeight: 600,
              cursor: canContinue() ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {step === 0 ? 'Empezar ✦' : 'Siguiente →'}
          </button>
        ) : (
          <button
            onClick={completeOnboarding}
            disabled={guardando}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #d4af37, #f5c842)',
              color: '#0a0a0a',
              border: 'none',
              padding: '18px 24px',
              borderRadius: 30,
              fontSize: 15,
              fontWeight: 600,
              cursor: guardando ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: guardando ? 0.6 : 1,
            }}
          >
            {guardando ? 'Guardando...' : 'Comenzar mi viaje ✦'}
          </button>
        )}
      </div>
    </div>
  )
}
