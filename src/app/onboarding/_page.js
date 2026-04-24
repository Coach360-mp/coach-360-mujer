'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Sigil } from '@/components/design/icons'

// ─── Datos (híbrido: diseño Fase 5 OnboardingFlow + campos reales del proyecto) ───

const focos = [
  { id: 'estres',     label: 'Manejar mejor mi estrés y ansiedad',   sym: '✦' },
  { id: 'relaciones', label: 'Mejorar mis relaciones y vínculos',     sym: '·' },
  { id: 'proposito',  label: 'Encontrar más propósito y sentido',     sym: '→' },
  { id: 'confianza',  label: 'Fortalecer mi confianza y autoestima',  sym: '○' },
  { id: 'cambio',     label: 'Navegar un cambio o transición',        sym: '—' },
  { id: 'liderazgo',  label: 'Desarrollar mi liderazgo',              sym: '◇' },
]

const moods = ['difícil', 'regular', 'bien', 'muy bien', 'increíble']

// Paso 4 (nuevo, agregado para preservar captura de momento_vida)
const momentosVida = [
  { id: 'cambio',                  label: 'En un momento de cambio' },
  { id: 'crecimiento_personal',    label: 'En crecimiento personal' },
  { id: 'incertidumbre',           label: 'Navegando incertidumbre' },
  { id: 'construyendo',            label: 'Construyendo algo nuevo' },
  { id: 'transicion_profesional',  label: 'En transición profesional' },
]

// Paso 5 (nuevo, agregado para preservar captura de identidad)
const identidades = [
  { id: 'mama',           label: 'Mamá / Papá' },
  { id: 'emprendedora',   label: 'Emprendedor/a' },
  { id: 'lidera',         label: 'Lidero equipos' },
  { id: 'independiente',  label: 'Profesional independiente' },
  { id: 'busqueda',       label: 'En búsqueda laboral' },
]

const stepsLabels = [
  { n: 1, label: 'Bienvenida' },
  { n: 2, label: 'Objetivos' },
  { n: 3, label: 'Check-in' },
  { n: 4, label: 'Momento' },
  { n: 5, label: 'Identidad' },
  { n: 6, label: 'Primer test' },
  { n: 7, label: 'Tour' },
  { n: 8, label: 'Plan' },
]

export default function Onboarding() {
  const router = useRouter()
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false)
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [step, setStep] = useState(1)
  const [focoSel, setFocoSel] = useState(null)
  const [mood, setMood] = useState(null)
  const [notaCheckin, setNotaCheckin] = useState('')
  const [momentos, setMomentos] = useState([])
  const [identidadSel, setIdentidadSel] = useState([])
  const [respuestaLibre, setRespuestaLibre] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    const { data: profile } = await supabase.from('perfiles').select('onboarding_completado, nombre').eq('id', user.id).single()
    if (profile?.onboarding_completado) { router.push('/dashboard'); return }
    if (profile?.nombre) setNombre(profile.nombre)
    else if (user.user_metadata?.full_name) setNombre(user.user_metadata.full_name.split(' ')[0])
  }

  const toggleMomento = (id) =>
    setMomentos(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id].slice(-2))
  const toggleIdentidad = (id) =>
    setIdentidadSel(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-3))

  const canContinue = () => {
    switch (step) {
      case 2: return focoSel !== null
      case 3: return mood !== null
      case 4: return momentos.length > 0
      case 5: return identidadSel.length > 0
      default: return true
    }
  }

  const next = () => setStep(s => Math.min(8, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

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

      const bienestar_inicial = { mood: mood != null ? moods[mood] : null, nota: notaCheckin || null }

      await supabase.from('onboarding_respuestas').upsert({
        user_id: user.id,
        vertical: 'mujer',
        momento_vida: momentos,
        identidad: identidadSel,
        foco_inicial: focoSel,
        bienestar_inicial,
        respuesta_libre: respuestaLibre,
      }, { onConflict: 'user_id,vertical' })

      const contextos = [
        { key: 'momento_vida', value: momentos.join(', ') },
        { key: 'identidad',    value: identidadSel.join(', ') },
        { key: 'foco_inicial', value: focoSel },
        { key: 'respuesta_libre', value: respuestaLibre },
      ].filter(c => c.value)
      if (contextos.length > 0) {
        await supabase.from('user_context').insert(
          contextos.map(c => ({
            user_id: user.id, vertical: 'mujer',
            context_key: c.key, context_value: c.value, source_coach: 'onboarding',
          }))
        )
      }

      try {
        await fetch('/api/emails/bienvenida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, vertical: 'mujer' }),
        })
      } catch (e) { console.error('Error email bienvenida:', e) }

      router.push('/dashboard')
    } catch (err) {
      console.error('Error guardando onboarding:', err)
      setGuardando(false)
    }
  }

  // ── GATE: Consentimiento (estilo ritual dark consistente) ──
  if (!consentimientoAceptado) {
    return (
      <div className="dir-ritual" data-v="clara" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
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
    <div className="dir-ritual" data-v="clara" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .of-top { padding: 20px 20px 0; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .of-steps-desktop { display: none; }
        .of-step-mobile { margin-left: auto; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); letter-spacing: .05em; }
        .of-progress-bar { display: flex; gap: 4px; padding: 12px 20px 0; }
        .of-content { flex: 1; padding: 32px 20px 48px; display: flex; flex-direction: column; gap: 32px; }
        .of-right { display: none; }
        .of-h1-xl { font-size: clamp(36px, 8vw, 60px); }
        .of-h1-lg { font-size: clamp(30px, 6vw, 52px); }
        .of-h1-md { font-size: clamp(28px, 5.5vw, 48px); }
        .of-nav { display: flex; gap: 10px; margin-top: 40px; flex-wrap: wrap; }
        @media (min-width: 768px) {
          .of-top { padding: 28px 64px 0; flex-wrap: nowrap; }
          .of-steps-desktop { display: flex; align-items: center; gap: 14px; margin-left: auto; }
          .of-step-mobile { display: none; }
          .of-progress-bar { display: none; }
          .of-content { padding: 60px 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
          .of-right { display: block; position: relative; height: 520px; border-radius: 20px; overflow: hidden; border: 1px solid var(--line); }
        }
      `}</style>

      {/* Top bar con logo + steps */}
      <div className="of-top">
        <Sigil s={20} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Coach 360</span>

        {/* Desktop: steps horizontales */}
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

        {/* Mobile: solo contador */}
        <div className="of-step-mobile">PASO {step} / 8</div>
      </div>

      {/* Mobile: progress bar */}
      <div className="of-progress-bar">
        {stepsLabels.map((s) => (
          <div key={s.n} style={{ flex: 1, height: 3, borderRadius: 4, background: step >= s.n ? 'var(--v-primary)' : 'var(--ink-4)', transition: 'background var(--d-med) var(--ease-out)' }} />
        ))}
      </div>

      {/* Content */}
      <div className="of-content">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Paso {step} de 8</div>

          {/* ── PASO 1 — Bienvenida ── */}
          {step === 1 && (
            <>
              <h1 className="of-h1-xl" style={{ fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.035em', fontWeight: 400, margin: 0 }}>
                Hola, soy <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>Clara</em>.
              </h1>
              <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 20, maxWidth: 440 }}>
                {nombre ? `Gusto en conocerte, ${nombre}. ` : ''}Voy a acompañarte en los próximos días. Antes de empezar, necesito conocerte un poco. No hay respuestas correctas — solo las tuyas.
              </p>
            </>
          )}

          {/* ── PASO 2 — Objetivos (foco_inicial) ── */}
          {step === 2 && (
            <>
              <h1 className="of-h1-md" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                ¿Qué te trae aquí <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>hoy</em>?
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 24 }}>
                Elige el foco que más resuene. Podemos cambiarlo cuando quieras.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {focos.map((f) => {
                  const selected = focoSel === f.id
                  return (
                    <button key={f.id} onClick={() => setFocoSel(f.id)} style={{
                      padding: '14px 18px',
                      border: `1px solid ${selected ? 'var(--v-primary)' : 'var(--line)'}`,
                      background: selected ? 'var(--v-tint)' : 'var(--ink-2)',
                      borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', color: 'var(--text)', fontSize: 14, textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                    }}>
                      <span style={{ color: 'var(--v-primary)', fontSize: 18, fontFamily: 'var(--font-display)', width: 20 }}>{f.sym}</span>
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ── PASO 3 — Check-in (bienestar_inicial) ── */}
          {step === 3 && (
            <>
              <h1 className="of-h1-lg" style={{ fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                ¿Cómo llegas <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>hoy</em>?
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 24 }}>
                Una palabra basta. Esto me ayuda a empezar desde donde estás.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
                {moods.map((m, i) => {
                  const selected = mood === i
                  return (
                    <button key={m} onClick={() => setMood(i)} style={{
                      padding: '16px 4px',
                      border: `1px solid ${selected ? 'var(--v-primary)' : 'var(--line)'}`,
                      background: selected ? 'var(--v-primary)' : 'transparent',
                      color: selected ? '#0a0c0e' : 'var(--text)',
                      borderRadius: 12, cursor: 'pointer', fontSize: 12,
                      fontWeight: selected ? 600 : 400, textTransform: 'capitalize',
                      fontFamily: 'var(--font-body)',
                    }}>{m}</button>
                  )
                })}
              </div>
              <textarea
                value={notaCheckin}
                onChange={(e) => setNotaCheckin(e.target.value)}
                placeholder="Una frase sobre cómo estás... (opcional)"
                style={{
                  width: '100%', padding: 16, minHeight: 90, background: 'var(--ink-2)',
                  border: '1px solid var(--line)', borderRadius: 12, color: 'var(--text)',
                  fontSize: 14, resize: 'none', fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </>
          )}

          {/* ── PASO 4 — Momento de vida (NUEVO — preserva captura real) ── */}
          {step === 4 && (
            <>
              <h1 className="of-h1-md" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                ¿En qué momento <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>estás</em>?
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 24 }}>
                Puedes elegir más de uno — máximo 2.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {momentosVida.map((m) => {
                  const selected = momentos.includes(m.id)
                  return (
                    <button key={m.id} onClick={() => toggleMomento(m.id)} style={{
                      padding: '14px 18px',
                      border: `1px solid ${selected ? 'var(--v-primary)' : 'var(--line)'}`,
                      background: selected ? 'var(--v-tint)' : 'var(--ink-2)',
                      borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', color: 'var(--text)', fontSize: 14, textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${selected ? 'var(--v-primary)' : 'var(--line-strong)'}`,
                        background: selected ? 'var(--v-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#0a0c0e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>
                        )}
                      </span>
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ── PASO 5 — Identidad + visión 90 días (NUEVO) ── */}
          {step === 5 && (
            <>
              <h1 className="of-h1-md" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                Cuéntame un poco <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>de ti</em>.
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 24 }}>
                Elige las identidades que te describan (máximo 3).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {identidades.map((idt) => {
                  const selected = identidadSel.includes(idt.id)
                  return (
                    <button key={idt.id} onClick={() => toggleIdentidad(idt.id)} style={{
                      padding: '14px 18px',
                      border: `1px solid ${selected ? 'var(--v-primary)' : 'var(--line)'}`,
                      background: selected ? 'var(--v-tint)' : 'var(--ink-2)',
                      borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer', color: 'var(--text)', fontSize: 14, textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${selected ? 'var(--v-primary)' : 'var(--line-strong)'}`,
                        background: selected ? 'var(--v-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#0a0c0e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>
                        )}
                      </span>
                      {idt.label}
                    </button>
                  )
                })}
              </div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>¿Qué quieres que sea diferente en 90 días?</div>
              <textarea
                value={respuestaLibre}
                onChange={(e) => setRespuestaLibre(e.target.value)}
                placeholder="Comparte lo que quieras trabajar..."
                style={{
                  width: '100%', padding: 16, minHeight: 110, background: 'var(--ink-2)',
                  border: '1px solid var(--line)', borderRadius: 12, color: 'var(--text)',
                  fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-body)', outline: 'none', lineHeight: 1.5,
                }}
              />
            </>
          )}

          {/* ── PASO 6 — Primer test ── */}
          {step === 6 && (
            <>
              <h1 className="of-h1-md" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                Un test <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>breve</em> para partir.
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 24, maxWidth: 440 }}>
                20 preguntas sobre cómo funcionas. Al terminar te voy a dar una foto de tu momento actual — algo más preciso que intuiciones.
              </p>
              <div style={{ padding: 20, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--v-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--v-primary)', flexShrink: 0 }}>✦</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Radar ontológico</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>20 preguntas · 8 min</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 999, background: 'var(--v-primary)', color: '#0a0c0e', fontWeight: 600, flexShrink: 0 }}>RECOMENDADO</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>— o saltar por ahora, lo haces cuando quieras.</div>
            </>
          )}

          {/* ── PASO 7 — Tour ── */}
          {step === 7 && (
            <>
              <h1 className="of-h1-lg" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                Esto es lo que <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>tienes</em>.
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 20, maxWidth: 420 }}>
                Un tour rápido en 4 lugares.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Conversación', 'Hablar con Clara cuando quieras.'],
                  ['Módulos', 'Micro-cursos de 5-15 min.'],
                  ['Tests', 'Auto-conocimiento con evidencia.'],
                  ['Equilibrio', 'Cómo vas en las 4 dimensiones.'],
                ].map(([t, d], i) => (
                  <div key={i} style={{ padding: 16, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── PASO 8 — Plan ── */}
          {step === 8 && (
            <>
              <h1 className="of-h1-md" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 400, margin: 0 }}>
                Empieza <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>gratis</em>.
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 16, marginBottom: 20, maxWidth: 460 }}>
                Sin tarjeta. Sin compromiso. Cuando sientas que te hace falta más, está ahí.
              </p>
              <div style={{ padding: 22, background: 'var(--v-tint)', border: '1px solid color-mix(in oklab, var(--v-primary) 30%, transparent)', borderRadius: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Gratis</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>$0</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>1 vertical · 5 mensajes al día · tests básicos · módulos introductorios.</div>
              </div>
              <button onClick={completeOnboarding} disabled={guardando} style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--v-primary)', color: '#0a0c0e', fontWeight: 600, fontSize: 15,
                cursor: guardando ? 'default' : 'pointer', marginBottom: 10, opacity: guardando ? 0.6 : 1,
                fontFamily: 'var(--font-body)',
              }}>
                {guardando ? 'Guardando...' : 'Continuar gratis'}
              </button>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
                o <a onClick={() => router.push('/planes')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>ver planes</a>
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div className="of-nav">
            <button onClick={back} disabled={step === 1} style={{
              padding: '12px 22px', borderRadius: 12, border: '1px solid var(--line-strong)',
              background: 'transparent', color: 'var(--text-muted)', fontSize: 14,
              cursor: step === 1 ? 'default' : 'pointer', opacity: step === 1 ? .3 : 1,
              fontFamily: 'var(--font-body)',
            }}>← Atrás</button>
            {step < 8 && (
              <button onClick={next} disabled={!canContinue()} style={{
                padding: '12px 22px', borderRadius: 12, border: 'none',
                background: canContinue() ? 'var(--text)' : 'var(--ink-4)',
                color: canContinue() ? 'var(--bg)' : 'var(--text-dim)',
                fontWeight: 600, fontSize: 14, cursor: canContinue() ? 'pointer' : 'default',
                fontFamily: 'var(--font-body)',
              }}>Continuar →</button>
            )}
          </div>
        </div>

        {/* Right visual — coach portrait (solo desktop) */}
        <div className="of-right">
          <img src="/clara.jpg" alt="Clara" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(10,12,14,.85))' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28, color: '#fff' }}>
            <div className="eyebrow" style={{ color: 'color-mix(in oklab, var(--v-primary) 80%, white)', marginBottom: 8 }}>✦ Tu coach</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em', marginBottom: 6 }}>Clara</div>
            <div style={{ fontSize: 14, opacity: .8, fontStyle: 'italic' }}>"Más claridad, más poder. Más tú."</div>
          </div>
        </div>
      </div>
    </div>
  )
}
