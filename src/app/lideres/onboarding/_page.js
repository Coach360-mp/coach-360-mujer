'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sigil } from '@/components/design/icons'

const tamanioEquipo = [
  { id: 'pequeno',    label: '1 a 5 personas',     desc: 'Equipo chico, impacto directo' },
  { id: 'mediano',    label: '6 a 15 personas',    desc: 'Equipo mediano' },
  { id: 'grande',     label: '16 a 40 personas',   desc: 'Equipo grande o varios subequipos' },
  { id: 'muy_grande', label: 'Más de 40 personas', desc: 'Liderazgo de líderes' },
]

const aniosLiderando = [
  { id: 'nuevo',     label: 'Menos de 1 año', desc: 'Recién empezando' },
  { id: 'junior',    label: '1 a 3 años',     desc: 'Consolidando mi estilo' },
  { id: 'senior',    label: '3 a 7 años',     desc: 'Con experiencia' },
  { id: 'veterano',  label: 'Más de 7 años',  desc: 'Líder veterano' },
]

const desafios = [
  { id: 'feedback',       label: 'Dar feedback difícil sin herir' },
  { id: 'delegar',        label: 'Delegar sin perder el control' },
  { id: 'conflictos',     label: 'Manejar conflictos entre personas' },
  { id: 'decisiones',     label: 'Tomar decisiones difíciles bajo presión' },
  { id: 'motivacion',     label: 'Mantener al equipo motivado' },
  { id: 'bajo_desempeno', label: 'Gestionar bajo desempeño' },
  { id: 'tiempo',         label: 'No tengo tiempo para liderar, solo apago incendios' },
  { id: 'autoridad',      label: 'Que me tomen en serio como líder' },
  { id: 'reuniones',      label: 'Reuniones improductivas' },
  { id: 'estrategia',     label: 'Pensar estratégicamente, no solo operar' },
]

const industrias = [
  { id: 'tech',        label: 'Tecnología / Software' },
  { id: 'retail',      label: 'Retail / Consumo' },
  { id: 'servicios',   label: 'Servicios profesionales' },
  { id: 'salud',       label: 'Salud' },
  { id: 'educacion',   label: 'Educación' },
  { id: 'manufactura', label: 'Manufactura / Industria' },
  { id: 'finanzas',    label: 'Banca / Finanzas' },
  { id: 'publico',     label: 'Sector público' },
  { id: 'otro',        label: 'Otro' },
]

const stepsLabels = [
  { n: 1, label: 'Bienvenida' },
  { n: 2, label: 'Nombre' },
  { n: 3, label: 'Equipo' },
  { n: 4, label: 'Industria' },
  { n: 5, label: 'Trayectoria' },
  { n: 6, label: 'Desafíos' },
  { n: 7, label: 'Situación' },
]
const TOTAL = stepsLabels.length

export default function OnboardingLideres() {
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false)
  const [step, setStep] = useState(1)
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

    if (onboarding) { router.push('/lideres/dashboard'); return }

    const { data: profile } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single()
    if (profile?.nombre) setNombre(profile.nombre)
    else if (user.user_metadata?.full_name) setNombre(user.user_metadata.full_name.split(' ')[0])
  }

  const toggleDesafio = (id) =>
    setDesafiosSel(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id].slice(-3))

  const next = () => setStep(s => Math.min(TOTAL, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const canContinue = () => {
    switch (step) {
      case 2: return nombre.trim().length > 0
      case 3: return tamanio !== null
      case 4: return industria !== null
      case 5: return anios !== null
      case 6: return desafiosSel.length > 0
      default: return true
    }
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

      const contextos = [
        { key: 'tamanio_equipo',       value: tamanio },
        { key: 'industria',            value: industria },
        { key: 'anios_liderando',      value: anios },
        { key: 'desafios_principales', value: desafiosSel.join(', ') },
        { key: 'situacion_actual',     value: situacionActual },
      ].filter(c => c.value)
      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id, vertical: 'lideres',
            context_key: c.key, context_value: c.value, source_coach: 'onboarding',
          }))
        )
      }

      try {
        await fetch('/api/emails/bienvenida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, vertical: 'lideres' }),
        })
      } catch (e) { console.error('Error email bienvenida:', e) }

      router.push('/lideres/dashboard')
    } catch (err) {
      console.error('Error guardando onboarding:', err)
      setGuardando(false)
    }
  }

  // ── Gate de consentimiento ──
  if (!consentimientoAceptado) {
    return (
      <div className="dir-ritual" data-v="marco" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <Sigil s={20} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Coach 360</span>
        </div>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div className="eyebrow" style={{ marginBottom: 14, textAlign: 'center' }}>✦ Antes de empezar</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, textAlign: 'center' }}>
            Sobre tus datos
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20, textAlign: 'center' }}>
            Coach 360 recopila datos sobre tu bienestar emocional, estado de ánimo y resultados de tests. Estos son <strong style={{ color: 'var(--text)' }}>datos sensibles</strong> según la Ley N° 19.628 de Chile y requieren tu consentimiento explícito.
          </p>
          <div style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>
              Al continuar, autorizas a Coach 360 a recopilar y procesar tus datos personales y sensibles para personalizar tu experiencia de coaching. Tus datos no se venden a terceros. Puedes revocar este consentimiento en cualquier momento escribiendo a privacidad@micoach360.com.
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 24 }}>
            Lee nuestra <a href='/privacidad' target='_blank' style={{ color: 'var(--v-primary)', textDecoration: 'none' }}>Política de Privacidad completa</a>.
          </p>
          <button onClick={() => setConsentimientoAceptado(true)} style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none', background: 'var(--v-primary)', color: '#0a0c0e', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
            Acepto y quiero continuar ✦
          </button>
          <a href='/lideres' style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>No acepto — volver al inicio</a>
        </div>
      </div>
    )
  }

  return (
    <div className="dir-ritual" data-v="marco" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .of-top { padding: 20px 20px 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .of-steps-desktop { display: none; }
        .of-step-mobile { margin-left: auto; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); letter-spacing: .05em; }
        .of-progress-bar { display: flex; gap: 4px; padding: 12px 20px 0; }
        .of-content { flex: 1; padding: 32px 20px 48px; display: flex; flex-direction: column; gap: 32px; max-width: 560px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .of-h1 { font-family: var(--font-display); font-size: clamp(28px, 6vw, 44px); letter-spacing: -0.03em; font-weight: 400; line-height: 1.1; margin: 0; }
        .of-input { width: 100%; background: var(--ink-3); border: 1px solid var(--line-strong); border-radius: 12px; padding: 14px 16px; color: var(--text); font-size: 15px; font-family: var(--font-sans); outline: none; box-sizing: border-box; }
        .of-textarea { width: 100%; min-height: 140px; background: var(--ink-3); border: 1px solid var(--line-strong); border-radius: 12px; padding: 16px; color: var(--text); font-size: 15px; line-height: 1.6; font-family: var(--font-sans); resize: vertical; outline: none; box-sizing: border-box; }
        .of-option { background: var(--ink-2); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; color: var(--text); font-size: 14px; text-align: left; cursor: pointer; font-family: var(--font-sans); transition: all 200ms; display: flex; align-items: center; gap: 12px; }
        .of-option:hover { border-color: var(--line-strong); }
        .of-option.sel { background: var(--v-tint); border-color: var(--v-primary); }
        .of-check { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--text-dim); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .of-check.sel { border-color: var(--v-primary); background: var(--v-primary); color: #0a0c0e; font-size: 10px; font-weight: 700; }
        .of-chip { padding: 9px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--ink-2); color: var(--text); font-size: 13px; cursor: pointer; font-family: var(--font-sans); transition: all 200ms; }
        .of-chip.sel { background: var(--v-primary); color: #0a0c0e; border-color: var(--v-primary); font-weight: 600; }
        .of-nav { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .of-btn-prim { padding: 13px 22px; border-radius: 12px; border: none; background: var(--v-primary); color: #0a0c0e; font-weight: 600; font-size: 14px; cursor: pointer; font-family: var(--font-sans); flex: 1; min-width: 200px; }
        .of-btn-prim:disabled { opacity: .4; cursor: default; }
        .of-btn-sec { padding: 13px 22px; border-radius: 12px; border: 1px solid var(--line-strong); background: transparent; color: var(--text); font-size: 14px; cursor: pointer; font-family: var(--font-sans); }
        @media (min-width: 768px) {
          .of-top { padding: 28px 64px 0; flex-wrap: nowrap; }
          .of-steps-desktop { display: flex; align-items: center; gap: 14px; margin-left: auto; }
          .of-step-mobile { display: none; }
          .of-progress-bar { display: none; }
          .of-content { padding: 60px 80px; max-width: 720px; }
        }
      `}</style>

      <div className="of-top">
        <Sigil s={20} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Coach 360</span>

        <div className="of-steps-desktop">
          {stepsLabels.map((s) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s.n ? 'var(--v-primary)' : 'var(--ink-4)',
                color: step >= s.n ? '#0a0c0e' : 'var(--text-muted)',
                fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
              }}>{s.n}</div>
              <span style={{ fontSize: 11, color: step === s.n ? 'var(--text)' : 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="of-step-mobile">PASO {step} / {TOTAL}</div>
      </div>

      <div className="of-progress-bar">
        {stepsLabels.map((s) => (
          <div key={s.n} style={{ flex: 1, height: 3, borderRadius: 4, background: step >= s.n ? 'var(--v-primary)' : 'var(--ink-4)', transition: 'background 200ms' }} />
        ))}
      </div>

      <div className="of-content">
        <div className="eyebrow">Paso {step} de {TOTAL}</div>

        {step === 1 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 14 }}>
              Marco necesita <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>entender</em> a quién va a coachear.
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 460 }}>
              Antes de trabajar contigo necesita datos concretos: el tamaño de tu equipo, tu contexto y tus desafíos reales. Sin esto no puede ayudarte bien.
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cómo te llamas?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Marco te va a tratar por tu nombre.</p>
            <input
              type="text"
              className="of-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cuántas personas <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>lideras</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>El tamaño del equipo cambia todo.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tamanioEquipo.map(t => {
                const sel = tamanio === t.id
                return (
                  <button key={t.id} type="button" onClick={() => setTamanio(t.id)} className={`of-option ${sel ? 'sel' : ''}`} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em', marginLeft: 30 }}>{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿En qué <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>industria</em> trabajas?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Marco adapta sus ejemplos a tu contexto.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {industrias.map(i => {
                const sel = industria === i.id
                return (
                  <button key={i.id} type="button" onClick={() => setIndustria(i.id)} className={`of-chip ${sel ? 'sel' : ''}`}>
                    {sel && '✓ '}{i.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cuánto tiempo llevas <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>liderando</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Marco ajusta su nivel de profundidad según tu experiencia.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aniosLiderando.map(a => {
                const sel = anios === a.id
                return (
                  <button key={a.id} type="button" onClick={() => setAnios(a.id)} className={`of-option ${sel ? 'sel' : ''}`} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em', marginLeft: 30 }}>{a.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>Tus mayores <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>desafíos</em> como líder</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Elige hasta 3. Marco prioriza los que marcas primero.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {desafios.map(d => {
                const sel = desafiosSel.includes(d.id)
                return (
                  <button key={d.id} type="button" onClick={() => toggleDesafio(d.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Qué está pasando en tu equipo <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>ahora</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Una situación real que te esté pesando. Opcional pero recomendado.</p>
            <textarea
              className="of-textarea"
              value={situacionActual}
              onChange={(e) => setSituacionActual(e.target.value)}
              placeholder="Hay algo con mi equipo que..."
            />
          </div>
        )}

        <div className="of-nav">
          {step > 1 && (
            <button onClick={back} className="of-btn-sec">← Anterior</button>
          )}
          {step < TOTAL ? (
            <button onClick={next} disabled={!canContinue()} className="of-btn-prim">
              {step === 1 ? 'Empezar' : 'Siguiente'} →
            </button>
          ) : (
            <button onClick={completeOnboarding} disabled={guardando} className="of-btn-prim">
              {guardando ? 'Guardando…' : 'Conocer a Marco ✦'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
