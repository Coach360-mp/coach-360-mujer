'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const tamanioEquipo = [
  { id: 'pequeno', label: '1 a 5 personas', desc: 'Equipo chico, impacto directo' },
  { id: 'mediano', label: '6 a 15 personas', desc: 'Equipo mediano' },
  { id: 'grande', label: '16 a 40 personas', desc: 'Equipo grande o varios subequipos' },
  { id: 'muy_grande', label: 'Más de 40 personas', desc: 'Liderazgo de líderes' },
]

const aniosLiderando = [
  { id: 'nuevo', label: 'Menos de 1 año', desc: 'Recién empezando' },
  { id: 'junior', label: '1 a 3 años', desc: 'Consolidando mi estilo' },
  { id: 'senior', label: '3 a 7 años', desc: 'Con experiencia' },
  { id: 'veterano', label: 'Más de 7 años', desc: 'Líder veterano' },
]

const desafios = [
  { id: 'feedback', label: 'Dar feedback difícil sin herir' },
  { id: 'delegar', label: 'Delegar sin perder el control' },
  { id: 'conflictos', label: 'Manejar conflictos entre personas' },
  { id: 'decisiones', label: 'Tomar decisiones difíciles bajo presión' },
  { id: 'motivacion', label: 'Mantener al equipo motivado' },
  { id: 'bajo_desempeno', label: 'Gestionar bajo desempeño' },
  { id: 'tiempo', label: 'No tengo tiempo para liderar, solo apago incendios' },
  { id: 'autoridad', label: 'Que me tomen en serio como líder' },
  { id: 'reuniones', label: 'Reuniones improductivas' },
  { id: 'estrategia', label: 'Pensar estratégicamente, no solo operar' },
]

const industrias = [
  { id: 'tech', label: 'Tecnología / Software' },
  { id: 'retail', label: 'Retail / Consumo' },
  { id: 'servicios', label: 'Servicios profesionales' },
  { id: 'salud', label: 'Salud' },
  { id: 'educacion', label: 'Educación' },
  { id: 'manufactura', label: 'Manufactura / Industria' },
  { id: 'finanzas', label: 'Banca / Finanzas' },
  { id: 'publico', label: 'Sector público' },
  { id: 'otro', label: 'Otro' },
]

export default function OnboardingLideres() {
  const [step, setStep] = useState(0)
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [tamanio, setTamanio] = useState(null)
  const [industria, setIndustria] = useState(null)
  const [anios, setAnios] = useState(null)
  const [desafiosSel, setDesafiosSel] = useState([])
  const [situacionActual, setSituacionActual] = useState('')
  const [guardando, setGuardando] = useState(false)
  const router = useRouter()

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/lideres'); return }
    setUser(user)

    const { data: onboarding } = await supabase
      .from('onboarding_respuestas')
      .select('id')
      .eq('user_id', user.id)
      .eq('vertical', 'lideres')
      .maybeSingle()

    if (onboarding) {
      router.push('/lideres/dashboard')
      return
    }

    const { data: profile } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single()
    if (profile?.nombre) {
      setNombre(profile.nombre)
    } else if (user.user_metadata?.full_name) {
      setNombre(user.user_metadata.full_name.split(' ')[0])
    }
  }

  const toggleDesafio = (id) => {
    setDesafiosSel(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id].slice(-3))
  }

  const completeOnboarding = async () => {
    if (!user) return
    setGuardando(true)
    try {
      const { data: perfilActual } = await supabase.from('perfiles').select('active_verticals').eq('id', user.id).single()
      const verticalesActuales = perfilActual?.active_verticals || []
      const nuevasVerticales = verticalesActuales.includes('lideres') ? verticalesActuales : [...verticalesActuales, 'lideres']

      await supabase.from('perfiles').update({
        nombre: nombre || user.user_metadata?.full_name || '',
        onboarding_completado: true,
        current_vertical: 'lideres',
        active_verticals: nuevasVerticales,
      }).eq('id', user.id)

      await supabase.from('onboarding_respuestas').upsert({
        user_id: user.id,
        vertical: 'lideres',
        momento_vida: [anios],
        identidad: [tamanio, industria].filter(Boolean),
        foco_inicial: desafiosSel[0] || null,
        bienestar_inicial: { desafios: desafiosSel },
        respuesta_libre: situacionActual,
      }, { onConflict: 'user_id,vertical' })

      // Guardar contexto para Marco
      const contextos = [
        { key: 'tamanio_equipo', value: tamanio },
        { key: 'industria', value: industria },
        { key: 'anios_liderando', value: anios },
        { key: 'desafios_principales', value: desafiosSel.join(', ') },
        { key: 'situacion_actual', value: situacionActual },
      ].filter(c => c.value)

      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id,
            vertical: 'lideres',
            context_key: c.key,
            context_value: c.value,
            source_coach: 'onboarding',
          }))
        )
      }

      router.push('/lideres/dashboard')
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
      case 2: return tamanio !== null
      case 3: return industria !== null
      case 4: return anios !== null
      case 5: return desafiosSel.length > 0
      default: return true
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1e1b4b 0%, #0a0a0a 100%)',
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
              background: i <= step ? '#818cf8' : 'rgba(255,255,255,0.1)',
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
            <div style={{ fontSize: 48, marginBottom: 24, color: '#818cf8' }}>✦</div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: '#818cf8', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
              Coach 360 Líderes
            </div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 38,
              fontWeight: 300,
              lineHeight: 1.2,
              marginBottom: 20,
            }}>
              Marco necesita <span style={{ fontStyle: 'italic', color: '#818cf8' }}>entender</span><br />a quién va a coachear.
            </h1>
            <p style={{ fontSize: 16, color: '#c8c8c8', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 40px' }}>
              Antes de trabajar juntos, Marco necesita datos concretos: el tamaño de tu equipo, tu contexto y tus desafíos reales. Sin esto no puede ayudarte bien.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Empecemos
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', marginBottom: 40 }}>
              Marco te va a tratar por tu nombre
            </p>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
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
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 1 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cuántas personas lideras directamente?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              El tamaño del equipo cambia todo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tamanioEquipo.map(t => {
                const selected = tamanio === t.id
                return (
                  <button key={t.id} onClick={() => setTamanio(t.id)} style={{
                    background: selected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: '#a8a8a8' }}>{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 2 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿En qué industria trabajas?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Marco adapta sus ejemplos a tu contexto
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {industrias.map(i => {
                const selected = industria === i.id
                return (
                  <button key={i.id} onClick={() => setIndustria(i.id)} style={{
                    background: selected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
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

        {step === 4 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 3 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cuánto tiempo llevas liderando?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Marco ajusta su nivel de profundidad según tu experiencia
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aniosLiderando.map(a => {
                const selected = anios === a.id
                return (
                  <button key={a.id} onClick={() => setAnios(a.id)} style={{
                    background: selected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: '#a8a8a8' }}>{a.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 4 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cuáles son tus mayores desafíos como líder?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Elige hasta 3. Marco prioriza los que marcas primero.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {desafios.map(d => {
                const selected = desafiosSel.includes(d.id)
                return (
                  <button key={d.id} onClick={() => toggleDesafio(d.id)} style={{
                    background: selected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14,
                    padding: '14px 18px',
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
                      border: `2px solid ${selected ? '#818cf8' : 'rgba(255,255,255,0.3)'}`,
                      background: selected ? '#818cf8' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{selected && '✓'}</div>
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Paso 5 de 5
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Qué está pasando en tu equipo ahora?
            </h2>
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Dale contexto a Marco. Una situación real que te esté pesando. (Opcional pero recomendado)
            </p>
            <textarea
              value={situacionActual}
              onChange={(e) => setSituacionActual(e.target.value)}
              placeholder="Hay algo con mi equipo que..."
              style={{
                width: '100%',
                minHeight: 140,
                background: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
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
              background: canContinue() ? 'linear-gradient(135deg, #818cf8, #6366f1)' : 'rgba(99, 102, 241, 0.2)',
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
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
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
            {guardando ? 'Guardando...' : 'Conocer a Marco ✦'}
          </button>
        )}
      </div>
    </div>
  )
}
