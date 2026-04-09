'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const areasVida = [
  { id: 'salud', label: 'Salud y energía física' },
  { id: 'carrera', label: 'Carrera y crecimiento profesional' },
  { id: 'finanzas', label: 'Finanzas y libertad económica' },
  { id: 'relaciones', label: 'Relaciones y vínculos' },
  { id: 'mental', label: 'Claridad mental y enfoque' },
  { id: 'proposito', label: 'Propósito y sentido' },
  { id: 'tiempo', label: 'Gestión del tiempo' },
  { id: 'habitos', label: 'Construir hábitos sólidos' },
]

const estiloActual = [
  { id: 'disciplinado', label: 'Soy disciplinado pero estancado' },
  { id: 'disperso', label: 'Me cuesta enfocarme' },
  { id: 'ambicioso', label: 'Tengo muchas metas pero pocos resultados' },
  { id: 'agotado', label: 'Estoy agotado, necesito reset' },
  { id: 'empezando', label: 'Estoy empezando algo nuevo' },
  { id: 'cambio', label: 'Quiero un cambio profundo' },
]

const compromiso = [
  { id: 'bajo', label: '10 minutos al día', desc: 'Mínimo viable' },
  { id: 'medio', label: '20-30 minutos al día', desc: 'Ritmo constante' },
  { id: 'alto', label: '1 hora al día o más', desc: 'Transformación acelerada' },
]

export default function OnboardingGeneral() {
  const [step, setStep] = useState(0)
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [areasSel, setAreasSel] = useState([])
  const [estilo, setEstilo] = useState(null)
  const [nivelCompromiso, setNivelCompromiso] = useState(null)
  const [objetivo90, setObjetivo90] = useState('')
  const [obstaculo, setObstaculo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/general'); return }
    setUser(user)

    const { data: onboarding } = await supabase
      .from('onboarding_respuestas')
      .select('id')
      .eq('user_id', user.id)
      .eq('vertical', 'general')
      .maybeSingle()

    if (onboarding) {
      router.push('/general/dashboard')
      return
    }

    const { data: profile } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single()
    if (profile?.nombre) {
      setNombre(profile.nombre)
    } else if (user.user_metadata?.full_name) {
      setNombre(user.user_metadata.full_name.split(' ')[0])
    }
  }

  const toggleArea = (id) => {
    setAreasSel(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id].slice(-3))
  }

  const completeOnboarding = async () => {
    if (!user) return
    setGuardando(true)
    try {
      // Actualizar perfil: agregar general a las verticales activas
      const { data: perfilActual } = await supabase.from('perfiles').select('active_verticals').eq('id', user.id).single()
      const verticalesActuales = perfilActual?.active_verticals || []
      const nuevasVerticales = verticalesActuales.includes('general') ? verticalesActuales : [...verticalesActuales, 'general']

      await supabase.from('perfiles').update({
        nombre: nombre || user.user_metadata?.full_name || '',
        onboarding_completado: true,
        current_vertical: 'general',
        active_verticals: nuevasVerticales,
      }).eq('id', user.id)

      await supabase.from('onboarding_respuestas').upsert({
        user_id: user.id,
        vertical: 'general',
        momento_vida: [estilo],
        identidad: areasSel,
        foco_inicial: nivelCompromiso,
        bienestar_inicial: { compromiso: nivelCompromiso },
        respuesta_libre: `Objetivo: ${objetivo90}. Obstáculo: ${obstaculo}`,
      }, { onConflict: 'user_id,vertical' })

      // Guardar contexto para que Leo lo use
      const contextos = [
        { key: 'areas_vida', value: areasSel.join(', ') },
        { key: 'estilo_actual', value: estilo },
        { key: 'compromiso_diario', value: nivelCompromiso },
        { key: 'objetivo_90_dias', value: objetivo90 },
        { key: 'obstaculo_principal', value: obstaculo },
      ].filter(c => c.value)

      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id,
            vertical: 'general',
            context_key: c.key,
            context_value: c.value,
            source_coach: 'onboarding',
          }))
        )
      }

      router.push('/general/dashboard')
    } catch (err) {
      console.error('Error guardando onboarding:', err)
      setGuardando(false)
    }
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(0, s - 1))

  const totalSteps = 7
  const canContinue = () => {
    switch (step) {
      case 1: return nombre.trim().length > 0
      case 2: return areasSel.length > 0
      case 3: return estilo !== null
      case 4: return nivelCompromiso !== null
      case 5: return objetivo90.trim().length > 0
      default: return true
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #042f2e 0%, #0a0a0a 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
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
              background: i <= step ? '#14b8a6' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

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

        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 24, color: '#14b8a6' }}>✦</div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
              Coach 360
            </div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 40,
              fontWeight: 300,
              lineHeight: 1.2,
              marginBottom: 20,
            }}>
              Antes de empezar,<br /><span style={{ fontStyle: 'italic', color: '#14b8a6' }}>hablemos claro.</span>
            </h1>
            <p style={{ fontSize: 16, color: '#c8c8c8', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 40px' }}>
              Leo no da vueltas. Antes de trabajar juntos necesita saber qué quieres lograr, qué te está frenando y cuánto estás dispuesto a comprometerte.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Empecemos
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', marginBottom: 40 }}>
              Leo te va a tratar por tu nombre
            </p>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(20, 184, 166, 0.06)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
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

        {step === 2 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 1 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué áreas de tu vida quieres trabajar?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Elige hasta 3. Leo se enfoca en pocas cosas, bien hechas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {areasVida.map(a => {
                const selected = areasSel.includes(a.id)
                return (
                  <button key={a.id} onClick={() => toggleArea(a.id)} style={{
                    background: selected ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#14b8a6' : 'rgba(255,255,255,0.1)'}`,
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
                      border: `2px solid ${selected ? '#14b8a6' : 'rgba(255,255,255,0.3)'}`,
                      background: selected ? '#14b8a6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0a0a0a', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{selected && '✓'}</div>
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 2 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo describirías tu momento actual?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Sé honesto — Leo trabaja mejor con la verdad
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {estiloActual.map(e => {
                const selected = estilo === e.id
                return (
                  <button key={e.id} onClick={() => setEstilo(e.id)} style={{
                    background: selected ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#14b8a6' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '16px 18px',
                    color: '#fff',
                    fontSize: 14,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}>
                    {e.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 3 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cuánto tiempo puedes dedicarle?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Leo adapta su ritmo al tuyo. Mejor prometer poco y cumplir.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {compromiso.map(c => {
                const selected = nivelCompromiso === c.id
                return (
                  <button key={c.id} onClick={() => setNivelCompromiso(c.id)} style={{
                    background: selected ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#14b8a6' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: '#a8a8a8' }}>{c.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 4 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué quieres lograr en 90 días?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Sé concreto. "Estar mejor" no cuenta. "Correr 5km sin parar" sí.
            </p>
            <textarea
              value={objetivo90}
              onChange={(e) => setObjetivo90(e.target.value)}
              placeholder="En 90 días quiero..."
              style={{
                width: '100%',
                minHeight: 140,
                background: 'rgba(20, 184, 166, 0.06)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
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

        {step === 6 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#14b8a6', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 5 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué te ha frenado hasta ahora?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Leo necesita saber cuál es tu mayor obstáculo real. (Opcional)
            </p>
            <textarea
              value={obstaculo}
              onChange={(e) => setObstaculo(e.target.value)}
              placeholder="Lo que me ha frenado es..."
              style={{
                width: '100%',
                minHeight: 140,
                background: 'rgba(20, 184, 166, 0.06)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
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

      </div>

      <div style={{ padding: '0 24px 32px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        {step < totalSteps - 1 ? (
          <button
            onClick={next}
            disabled={!canContinue()}
            style={{
              width: '100%',
              background: canContinue() ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'rgba(20, 184, 166, 0.2)',
              color: canContinue() ? '#fff' : '#a8a8a8',
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
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: '#fff',
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
            {guardando ? 'Guardando...' : 'Conocer a Leo ✦'}
          </button>
        )}
      </div>
    </div>
  )
}
