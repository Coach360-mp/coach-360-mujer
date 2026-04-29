'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sigil } from '@/components/design/icons'

// Sub-onboarding mujer: solo las preguntas gendered. Nombre/género/consent ya capturados en /onboarding.

const focos = [
  { id: 'estres',     label: 'Manejar mejor mi estrés y ansiedad' },
  { id: 'relaciones', label: 'Mejorar mis relaciones y vínculos' },
  { id: 'proposito',  label: 'Encontrar más propósito y sentido' },
  { id: 'confianza',  label: 'Fortalecer mi confianza y autoestima' },
  { id: 'cambio',     label: 'Navegar un cambio o transición' },
  { id: 'liderazgo',  label: 'Desarrollar mi liderazgo' },
]

const momentosVida = [
  { id: 'cambio',                 label: 'En un momento de cambio' },
  { id: 'crecimiento_personal',   label: 'En crecimiento personal' },
  { id: 'incertidumbre',          label: 'Navegando incertidumbre' },
  { id: 'construyendo',           label: 'Construyendo algo nuevo' },
  { id: 'transicion_profesional', label: 'En transición profesional' },
]

const identidades = [
  { id: 'mama',          label: 'Mamá' },
  { id: 'emprendedora',  label: 'Emprendedora' },
  { id: 'lidera',        label: 'Lidero equipos' },
  { id: 'independiente', label: 'Profesional independiente' },
  { id: 'busqueda',      label: 'En búsqueda laboral' },
]

const stepsLabels = [
  { n: 1, label: 'Foco' },
  { n: 2, label: 'Momento' },
  { n: 3, label: 'Identidad' },
]
const TOTAL = stepsLabels.length

export default function MujerOnboarding() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const [focoSel, setFocoSel] = useState(null)
  const [momentos, setMomentos] = useState([])
  const [identidadSel, setIdentidadSel] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/onboarding'); return }
    setUser(user)

    const { data: existente } = await supabase
      .from('onboarding_respuestas')
      .select('id')
      .eq('user_id', user.id)
      .eq('vertical', 'mujer')
      .maybeSingle()
    if (existente) { router.push('/dashboard?tab=mujer'); return }
  }

  const toggleMomento = (id) =>
    setMomentos(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id].slice(-2))
  const toggleIdentidad = (id) =>
    setIdentidadSel(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3))

  const next = () => setStep(s => Math.min(TOTAL, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))
  const canContinue = () => {
    switch (step) {
      case 1: return focoSel !== null
      case 2: return momentos.length > 0
      case 3: return identidadSel.length > 0
      default: return true
    }
  }

  const completeOnboarding = async () => {
    if (!user) return
    setGuardando(true)
    try {
      // Agregar 'mujer' a active_verticals manteniendo lo existente
      const { data: perfilActual } = await supabase
        .from('perfiles').select('active_verticals').eq('id', user.id).single()
      const verticales = perfilActual?.active_verticals || []
      const nuevas = verticales.includes('mujer') ? verticales : [...verticales, 'mujer']
      await supabase.from('perfiles').update({
        current_vertical: 'mujer',
        active_verticals: nuevas,
      }).eq('id', user.id)

      await supabase.from('onboarding_respuestas').upsert({
        user_id: user.id,
        vertical: 'mujer',
        momento_vida: momentos,
        identidad: identidadSel,
        foco_inicial: focoSel,
      }, { onConflict: 'user_id,vertical' })

      const contextos = [
        { key: 'momento_vida', value: momentos.join(', ') },
        { key: 'identidad',    value: identidadSel.join(', ') },
        { key: 'foco_inicial', value: focoSel },
      ].filter(c => c.value)
      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id, vertical: 'mujer',
            context_key: c.key, context_value: c.value, source_coach: 'onboarding',
          }))
        )
      }

      router.push('/dashboard?tab=mujer')
    } catch (err) {
      console.error('Error guardando onboarding mujer:', err)
      setGuardando(false)
    }
  }

  return (
    <div className="dir-ritual" data-v="clara" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .of-top { padding: 20px 20px 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .of-steps-desktop { display: none; }
        .of-step-mobile { margin-left: auto; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); letter-spacing: .05em; }
        .of-progress-bar { display: flex; gap: 4px; padding: 12px 20px 0; }
        .of-content { flex: 1; padding: 32px 20px 48px; display: flex; flex-direction: column; gap: 32px; max-width: 560px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .of-h1 { font-family: var(--font-display); font-size: clamp(28px, 6vw, 44px); letter-spacing: -0.03em; font-weight: 400; line-height: 1.1; margin: 0; }
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
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Coach 360 · Mujer</span>
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
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Qué quieres <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>trabajar</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Elige uno. Es por dónde empezamos.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {focos.map(f => {
                const sel = focoSel === f.id
                return (
                  <button key={f.id} type="button" onClick={() => setFocoSel(f.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cómo describirías tu <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>momento</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Hasta 2 que resuenen.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {momentosVida.map(m => {
                const sel = momentos.includes(m.id)
                return (
                  <button key={m.id} type="button" onClick={() => toggleMomento(m.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="of-h1" style={{ marginBottom: 10 }}>¿Cómo te <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>identificas</em>?</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Hasta 3. Esto nos ayuda a contextualizar.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {identidades.map(i => {
                const sel = identidadSel.includes(i.id)
                return (
                  <button key={i.id} type="button" onClick={() => toggleIdentidad(i.id)} className={`of-option ${sel ? 'sel' : ''}`}>
                    <div className={`of-check ${sel ? 'sel' : ''}`}>{sel && '✓'}</div>
                    {i.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="of-nav">
          {step > 1 && <button onClick={back} className="of-btn-sec">← Anterior</button>}
          {step < TOTAL ? (
            <button onClick={next} disabled={!canContinue()} className="of-btn-prim">Siguiente →</button>
          ) : (
            <button onClick={completeOnboarding} disabled={guardando || !canContinue()} className="of-btn-prim">
              {guardando ? 'Guardando…' : 'Empezar ✦'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
