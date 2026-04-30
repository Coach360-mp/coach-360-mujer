'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sigil } from '@/components/design/icons'
import { recomendarCoach } from '@/lib/recomendarCoach'
import { canSelectCoach } from '@/lib/access/getCoachAccess'

// Onboarding universal Coach 360. Captura nombre, género y data ontológica genérica.
// Si la usuaria luego entra a /mujer o /lideres, hará el sub-onboarding específico.

const generos = [
  { id: 'mujer',                 label: 'Mujer' },
  { id: 'hombre',                label: 'Hombre' },
  { id: 'prefiero_no_responder', label: 'Prefiero no responder' },
]

const areasVida = [
  { id: 'salud',      label: 'Salud y energía física' },
  { id: 'carrera',    label: 'Carrera y crecimiento profesional' },
  { id: 'finanzas',   label: 'Finanzas y libertad económica' },
  { id: 'relaciones', label: 'Relaciones y vínculos' },
  { id: 'mental',     label: 'Claridad mental y enfoque' },
  { id: 'proposito',  label: 'Propósito y sentido' },
  { id: 'tiempo',     label: 'Gestión del tiempo' },
  { id: 'habitos',    label: 'Construir hábitos sólidos' },
]

const estiloActual = [
  { id: 'disciplinado', label: 'Soy disciplinado/a pero estancado/a' },
  { id: 'disperso',     label: 'Me cuesta enfocarme' },
  { id: 'ambicioso',    label: 'Tengo muchas metas pero pocos resultados' },
  { id: 'agotado',      label: 'Estoy agotado/a, necesito reset' },
  { id: 'empezando',    label: 'Estoy empezando algo nuevo' },
  { id: 'cambio',       label: 'Quiero un cambio profundo' },
]

const compromiso = [
  { id: 'bajo',  label: '10 minutos al día',    desc: 'Mínimo viable' },
  { id: 'medio', label: '20-30 minutos al día', desc: 'Ritmo constante' },
  { id: 'alto',  label: '1 hora al día o más',   desc: 'Transformación acelerada' },
]

const stepsLabels = [
  { n: 1, label: 'Nombre' },
  { n: 2, label: 'Género' },
  { n: 3, label: 'Áreas' },
  { n: 4, label: 'Momento' },
  { n: 5, label: 'Compromiso' },
  { n: 6, label: 'Objetivo' },
  { n: 7, label: 'Obstáculo' },
  { n: 8, label: 'Tu coach' },
]
const TOTAL = stepsLabels.length

const COACH_INFO = {
  leo:   { nombre: 'Leo',   img: '/leo.jpg',   tag: 'Estratégico · práctico', desc: 'Te ayuda a EJECUTAR' },
  clara: { nombre: 'Clara', img: '/clara.jpg', tag: 'Empática · exploratoria', desc: 'Te ayuda a TRANSFORMAR' },
  marco: { nombre: 'Marco', img: '/marco.jpg', tag: 'Ejecutivo · desafiante', desc: 'Te ayuda a LIDERAR' },
}

export default function Onboarding() {
  const router = useRouter()
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false)
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const [nombre, setNombre] = useState('')
  const [genero, setGenero] = useState(null)
  const [areasSel, setAreasSel] = useState([])
  const [estilo, setEstilo] = useState(null)
  const [nivelCompromiso, setNivelCompromiso] = useState(null)
  const [objetivo90, setObjetivo90] = useState('')
  const [obstaculo, setObstaculo] = useState('')
  const [coachElegido, setCoachElegido] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Recomendación derivada al entrar al paso 8 (Tu coach)
  const recomendacion = recomendarCoach({
    areas: areasSel,
    momento: estilo,
    identidad: [],
    genero,
  })

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    const { data: profile } = await supabase
      .from('perfiles').select('onboarding_completado, nombre').eq('id', user.id).maybeSingle()
    if (profile?.onboarding_completado) { router.push('/dashboard?tab=coach360'); return }
    if (profile?.nombre) setNombre(profile.nombre)
    else if (user.user_metadata?.full_name) setNombre(user.user_metadata.full_name.split(' ')[0])
  }

  const toggleArea = (id) =>
    setAreasSel(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id].slice(-3))

  const next = () => setStep(s => Math.min(TOTAL, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const canContinue = () => {
    switch (step) {
      case 1: return nombre.trim().length > 0
      case 2: return genero !== null
      case 3: return areasSel.length > 0
      case 4: return estilo !== null
      case 5: return nivelCompromiso !== null
      case 6: return objetivo90.trim().length > 0
      case 8: return coachElegido !== null
      default: return true
    }
  }

  const completeOnboarding = async () => {
    if (!user) return
    setGuardando(true)
    try {
      // 1. Guardar nombre + género + coach en user_preferences (vía API)
      // El coach efectivo: el elegido si tiene acceso por plan, sino default Leo (free).
      const coachEfectivo = coachElegido && canSelectCoach(coachElegido, 'free')
        ? coachElegido
        : (coachElegido === 'leo' ? 'leo' : 'leo')
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          nombre: nombre.trim(),
          genero,
          coach_actual: coachEfectivo,
          coach_recomendado: recomendacion.coach,
          coach_elegido_inicial: coachElegido,
          acepto_recomendacion: coachElegido === recomendacion.coach,
          areas_interes: areasSel,
        }),
      })

      // 2. Marcar onboarding completado en perfiles + setear vertical inicial
      await supabase.from('perfiles').upsert({
        id: user.id,
        nombre: nombre.trim(),
        onboarding_completado: true,
        current_vertical: 'general',
        active_verticals: ['general'],
      }, { onConflict: 'id' })

      // 3. Guardar respuestas en onboarding_respuestas (compat con tablas existentes)
      await supabase.from('onboarding_respuestas').upsert({
        user_id: user.id,
        vertical: 'general',
        momento_vida: [estilo],
        identidad: areasSel,
        foco_inicial: nivelCompromiso,
        bienestar_inicial: { compromiso: nivelCompromiso, genero },
        respuesta_libre: `Objetivo: ${objetivo90}. Obstáculo: ${obstaculo}`,
      }, { onConflict: 'user_id,vertical' })

      // 4. user_context para que el coach lo use
      const contextos = [
        { key: 'genero',              value: genero },
        { key: 'areas_vida',          value: areasSel.join(', ') },
        { key: 'estilo_actual',       value: estilo },
        { key: 'compromiso_diario',   value: nivelCompromiso },
        { key: 'objetivo_90_dias',    value: objetivo90 },
        { key: 'obstaculo_principal', value: obstaculo },
      ].filter(c => c.value)
      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id, vertical: 'general',
            context_key: c.key, context_value: c.value, source_coach: 'onboarding',
          }))
        )
      }

      // 5. Email bienvenida (no bloqueante)
      try {
        fetch('/api/emails/bienvenida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, vertical: 'general' }),
        })
      } catch (e) { console.error('Error email bienvenida:', e) }

      router.push('/dashboard?tab=coach360')
    } catch (err) {
      console.error('Error guardando onboarding:', err)
      setGuardando(false)
    }
  }

  // ── Gate consentimiento ──
  if (!consentimientoAceptado) {
    return (
      <div className="dir-ritual" data-v="leo" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
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
          <a href='/' style={{ display: 'block', textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>No acepto — volver al inicio</a>
        </div>
      </div>
    )
  }

  return (
    <div className="dir-ritual" data-v="leo" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cómo te llamas?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Para tratarte por tu nombre.</p>
            <input type="text" className="of-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" autoFocus />
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cómo te <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>identificas</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Esto define qué herramientas adicionales te aparecen.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {generos.map(g => {
                const sel = genero === g.id
                return (
                  <button key={g.id} type="button" onClick={() => setGenero(g.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {g.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Qué <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>áreas</em> quieres trabajar?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Elige hasta 3. Es por dónde empezamos.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {areasVida.map(a => {
                const sel = areasSel.includes(a.id)
                return (
                  <button key={a.id} type="button" onClick={() => toggleArea(a.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {a.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cómo describirías tu <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>momento actual</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Sé honesto/a — funcionamos mejor con la verdad.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {estiloActual.map(e => {
                const sel = estilo === e.id
                return (
                  <button key={e.id} type="button" onClick={() => setEstilo(e.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {e.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cuánto tiempo puedes <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>dedicarle</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Mejor prometer poco y cumplir.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {compromiso.map(c => {
                const sel = nivelCompromiso === c.id
                return (
                  <button key={c.id} type="button" onClick={() => setNivelCompromiso(c.id)} className={`of-option ${sel ? 'sel' : ''}`} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em', marginLeft: 30 }}>{c.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Qué quieres lograr en <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>90 días</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Sé concreto/a. "Estar mejor" no cuenta.</p>
            <textarea className="of-textarea" value={objetivo90} onChange={(e) => setObjetivo90(e.target.value)} placeholder="En 90 días quiero..." autoFocus />
          </div>
        )}

        {step === 7 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Qué te ha <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>frenado</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Tu mayor obstáculo real. Opcional.</p>
            <textarea className="of-textarea" value={obstaculo} onChange={(e) => setObstaculo(e.target.value)} placeholder="Lo que me ha frenado es..." />
          </div>
        )}

        {step === 8 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>
              Te recomendamos <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>{COACH_INFO[recomendacion.coach].nombre}</em>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              {recomendacion.motivo}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>
              ELEGÍ TU COACH:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['leo', 'clara', 'marco'].map((c) => {
                const sel = coachElegido === c
                const recomendado = c === recomendacion.coach
                const requierePago = c !== 'leo'
                const info = COACH_INFO[c]
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoachElegido(c)}
                    className={`of-option ${sel ? 'sel' : ''}`}
                    style={{ alignItems: 'flex-start', padding: '14px 16px', gap: 14 }}
                  >
                    <img src={info.img} alt={info.nombre} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{info.nombre}</span>
                        {recomendado && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: 'var(--v-primary)', color: '#0a0c0e', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', fontWeight: 700 }}>RECOMENDADO</span>}
                        {requierePago && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: 'var(--ink-3)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>PLAN ESENCIAL+</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{info.desc}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em', marginTop: 4 }}>{info.tag}</div>
                    </div>
                    <div className={`of-check ${sel ? 'sel' : ''}`} style={{ marginTop: 12 }}>{sel && '✓'}</div>
                  </button>
                )
              })}
            </div>
            {coachElegido && coachElegido !== 'leo' && (
              <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.55, padding: '10px 14px', background: 'var(--ink-3)', borderRadius: 10, border: '1px solid var(--line)' }}>
                ✦ {COACH_INFO[coachElegido].nombre} requiere plan Esencial. Vas a empezar con Leo y podés cambiar cuando subas de plan.
              </p>
            )}
          </div>
        )}

        <div className="of-nav">
          {step > 1 && <button onClick={back} className="of-btn-sec">← Anterior</button>}
          {step < TOTAL ? (
            <button onClick={next} disabled={!canContinue()} className="of-btn-prim">
              Siguiente →
            </button>
          ) : (
            <button onClick={completeOnboarding} disabled={guardando} className="of-btn-prim">
              {guardando ? 'Guardando…' : 'Empezar mi Coach 360 ✦'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
