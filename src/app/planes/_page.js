'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── Iconos SVG — copia literal del const Icon de Fase 5 (líneas 906-958) ───
// Duplicado inline con el dashboard/_page.js (cleanup a helper compartido en commit aparte).
const Icon = {
  sparkle: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3 3l2 2M11 11l2 2M3 13l2-2M11 5l2-2"/>
    </svg>
  ),
  arrow: ({ s = 14, dir = 'right' }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'up' ? 'rotate(-90deg)' : dir === 'down' ? 'rotate(90deg)' : 'none' }}>
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  star: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 1.5l1.8 4 4.2.4-3.2 2.9.9 4.2L8 10.8l-3.7 2.2.9-4.2L2 5.9l4.2-.4z"/></svg>
  ),
}

function Sigil({ s = 18 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5.5" opacity=".55" />
      <path d="M12 2v20M2 12h20" opacity=".22" />
    </svg>
  )
}

function RealPortrait({ src, size = 40, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? '0 0 0 3px var(--bg), 0 0 0 4px color-mix(in oklab, var(--v-primary) 50%, transparent)' : 'none',
      background: 'var(--ink-3)',
    }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

// ─── Data — copia literal de PLANS/ADDONS de Fase 5 (líneas 968-1013) ───
const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    priceMonthly: 0,
    blurb: 'Para empezar a conocer a tu coach.',
    features: ['1 vertical', 'Chat limitado (5 msjs/día)', 'Tests básicos', 'Módulos introductorios'],
    cta: 'Empezar gratis',
  },
  {
    id: 'esencial',
    name: 'Esencial',
    priceMonthly: 9990,
    featured: true,
    blurb: 'Todo lo que necesitas con tu coach elegido.',
    features: [
      '1 vertical completa',
      'Chat con coach (límite generoso)',
      'Todos los tests y módulos',
      'Seguimiento de hábitos',
      'Historial completo',
    ],
    cta: 'Suscribirse',
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 19990,
    blurb: 'Tus tres coaches trabajan juntos.',
    features: [
      'Acceso a Clara + Leo + Marco',
      'Memoria cruzada entre coaches',
      'Reportes mensuales personalizados',
      'Certificados para LinkedIn',
      'Chat con mayor límite',
    ],
    cta: 'Ir a Premium',
  },
]

const ADDONS = [
  { id: 'sesion_personal_1', name: 'Sesión Personal 1:1', priceMonthly: 59990, coach: 'Clara · Leo' },
  { id: 'sesion_ejecutiva_1', name: 'Sesión Ejecutiva 1:1', priceMonthly: 89990, coach: 'Marco' },
]

const TESTIMONIOS = [
  { q: 'Dejé de postergar la conversación difícil con mi jefe. Tres meses después, me promovieron.', name: 'Valentina R.', role: 'Product manager · 31', city: 'Santiago', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop' },
  { q: 'Leo me acompañó cada mañana de mi peor mes. Hoy vuelvo a correr.', name: 'Tomás A.', role: 'Ingeniero · 28', city: 'Buenos Aires', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop' },
  { q: 'Con Marco aprendí a decir no sin culpa. Mi equipo agradece más que yo.', name: 'Camila F.', role: 'Directora de operaciones · 42', city: 'Bogotá', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop' },
]

const UNSPLASH_IMG = {
  t1: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop',
  t2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop',
  t3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop',
  t4: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop',
  moment2: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=1200&q=80&auto=format&fit=crop',
}

// ─── RitualPlanCard — port literal de Fase 5 (líneas 1515-1563) ───
function RitualPlanCard({ plan, annual, monthlyReal, annualReal, fmt, onClick }) {
  const price = annual ? annualReal / 12 : monthlyReal
  const featured = plan.featured
  return (
    <div style={{
      padding: '36px 30px 30px',
      borderRadius: 'var(--r-xl)',
      background: featured ? 'radial-gradient(120% 80% at 50% 0%, var(--v-tint), var(--ink-2) 70%)' : 'var(--ink-2)',
      border: featured ? '1px solid color-mix(in oklab, var(--v-primary) 50%, transparent)' : '1px solid var(--line)',
      position: 'relative',
      boxShadow: featured ? '0 20px 60px color-mix(in oklab, var(--v-primary) 10%, transparent)' : 'none',
      minHeight: 520,
    }}>
      {featured && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--v-primary)', color: '#0a0c0e', padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
          ✦ Más popular
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.02em', fontWeight: 500, marginBottom: 4 }}>{plan.name}</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 28, minHeight: 44 }}>{plan.blurb}</div>

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, letterSpacing: '-0.035em', fontWeight: 400, lineHeight: 1 }}>
          {price === 0 ? fmt(0) : fmt(Math.round(price))}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 6 }}>/ mes</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 26, fontFamily: 'var(--font-mono)' }}>
        {annual && monthlyReal > 0 ? `${fmt(annualReal)} anual` : 'facturado mensual'}
      </div>

      <button onClick={onClick} style={{
        width: '100%', padding: '13px 16px', borderRadius: 'var(--r-pill)', border: 'none', cursor: 'pointer',
        background: featured ? 'var(--v-primary)' : 'var(--ink-12)',
        color: '#0a0c0e',
        fontWeight: 600, fontSize: 14, marginBottom: 28, letterSpacing: '-0.005em', fontFamily: 'var(--font-body)',
      }}>{plan.cta}</button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)', paddingTop: i === 0 ? 14 : 0, borderTop: i === 0 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ color: featured ? 'var(--v-primary)' : 'var(--text)', marginTop: 3 }}>✦</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PlanesPage() {
  const router = useRouter()
  const [annual, setAnnual] = useState(true)
  const [pricing, setPricing] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null)).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    const url = user?.id ? `/api/pricing?userId=${user.id}` : '/api/pricing'
    fetch(url).then(r => r.json()).then(d => { if (d && !d.error) setPricing(d) }).catch(() => {})
  }, [user?.id])

  const fmt = (n) => {
    if (n === 0) return 'Gratis'
    const locale = pricing?.pais_codigo === 'AR' ? 'es-AR' : pricing?.pais_codigo === 'CO' ? 'es-CO' : 'es-CL'
    const currency = pricing?.moneda || 'CLP'
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  }

  const precioReal = (id, fallback) => {
    const fromApi = pricing?.precios?.[id]?.precio
    return fromApi != null ? fromApi : fallback
  }

  const getPlanPrices = (plan) => {
    const monthly = plan.id === 'free' ? 0 : precioReal(plan.id, plan.priceMonthly)
    const annualValue = monthly === 0 ? 0 : Math.round(monthly * 12 * 0.8)
    return { monthly, annual: annualValue }
  }

  const handleCheckout = async (planId) => {
    if (planId === 'free' || !user) { router.push('/mujer'); return }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.id, userEmail: user.email, vertical: 'mujer' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) { console.error('[planes] checkout error:', err) }
  }

  return (
    <div className="dir-ritual" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <style>{`
        .hp-nav { padding: 20px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); gap: 10px; flex-wrap: wrap; }
        .hp-nav-links { display: none; }
        .hp-hero { padding: 40px 20px; display: flex; flex-direction: column; gap: 40px; }
        .hp-h1 { font-size: clamp(44px, 9vw, 72px); }
        .hp-coach-stack > div:nth-child(even) { transform: translateX(0); }
        .hp-toggle-wrap { text-align: center; padding: 20px; }
        .hp-plans { padding: 0 20px 48px; display: flex; flex-direction: column; gap: 20px; max-width: 1150px; margin: 0 auto; }
        .hp-testi-band { padding: 48px 20px 40px; border-top: 1px solid var(--line); background: var(--ink-2); }
        .hp-testi-grid { display: flex; flex-direction: column; gap: 20px; max-width: 1150px; margin: 0 auto; }
        .hp-testi-h2 { font-size: clamp(28px, 5vw, 44px); }
        .hp-human-wrap { padding: 48px 20px; border-top: 1px solid var(--line); }
        .hp-human-grid { display: flex; flex-direction: column; gap: 32px; max-width: 1150px; margin: 0 auto; }
        .hp-human-img { height: 260px; position: relative; border-radius: 20px; overflow: hidden; }
        .hp-human-h2 { font-size: clamp(32px, 6vw, 48px); }
        .hp-addons { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 26px; }
        @media (min-width: 768px) {
          .hp-nav { padding: 24px 64px; flex-wrap: nowrap; }
          .hp-nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--text-muted); }
          .hp-hero { padding: 72px 64px 40px; display: grid; grid-template-columns: 1fr 380px; gap: 56px; align-items: center; }
          .hp-coach-stack > div:nth-child(even) { transform: translateX(16px); }
          .hp-plans { padding: 0 64px 64px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .hp-testi-band { padding: 64px 64px 40px; }
          .hp-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .hp-human-wrap { padding: 72px 64px; }
          .hp-human-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: center; }
          .hp-human-img { height: 380px; }
          .hp-addons { display: flex; gap: 12px; }
        }
      `}</style>

      {/* NAV */}
      <div className="hp-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sigil s={20} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '-0.02em', fontWeight: 500 }}>Coach 360</span>
        </div>
        <div className="hp-nav-links">
          <span>Coaches</span><span>Método</span><span style={{ color: 'var(--text)' }}>Planes</span><span>Historias</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/mujer')} style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Ingresar</button>
          <button onClick={() => router.push('/mujer')} style={{ padding: '9px 18px', borderRadius: 999, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Empezar</button>
        </div>
      </div>

      {/* HERO */}
      <div className="hp-hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>✦ Más de 3.000 personas en LATAM</div>
          <h1 className="hp-h1" style={{ fontFamily: 'var(--font-display)', lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 400, margin: 0 }}>
            No estás <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>solo</em> en esto.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--text-muted)', marginTop: 20, maxWidth: 480 }}>
            Clara, Leo y Marco te acompañan cuando lo necesites — y detrás de ellos, un equipo de coaches humanos para cuando el asunto es más serio.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28 }}>
            <div style={{ display: 'flex' }}>
              {[UNSPLASH_IMG.t1, UNSPLASH_IMG.t2, UNSPLASH_IMG.t3, UNSPLASH_IMG.t4].map((s, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                  <RealPortrait src={s} size={40} ring />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: 2, color: 'var(--v-primary)', marginBottom: 2 }}>
                {[1,2,3,4,5].map(i => <Icon.star key={i} s={11} />)}
              </div>
              <span><b style={{ color: 'var(--text)' }}>4.9 / 5</b> en 840 reseñas</span>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div className="hp-coach-stack" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { c: 'clara', src: '/clara.jpg', name: 'Clara', blurb: 'para ti, mujer', caption: 'Más claridad, más poder.' },
              { c: 'leo', src: '/leo.jpg', name: 'Leo', blurb: 'para tu día a día', caption: 'Hábitos y propósito.' },
              { c: 'marco', src: '/marco.jpg', name: 'Marco', blurb: 'para líderes', caption: 'Decisiones con evidencia.' },
            ].map((p) => (
              <div key={p.c} data-v={p.c} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 14 }}>
                <RealPortrait src={p.src} size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '-0.02em' }}>
                    {p.name} <span className="eyebrow" style={{ marginLeft: 6 }}>{p.blurb}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{p.caption}</div>
                </div>
                <span style={{ color: 'var(--v-primary)', display: 'flex' }}><Icon.arrow /></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOGGLE */}
      <div className="hp-toggle-wrap">
        <div style={{ display: 'inline-flex', padding: 5, background: 'var(--ink-3)', borderRadius: 999, border: '1px solid var(--line)' }}>
          {[false, true].map(v => (
            <button key={v ? 'y' : 'm'} onClick={() => setAnnual(v)} style={{
              padding: '10px 22px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: annual === v ? 'var(--ink-5)' : 'transparent',
              color: annual === v ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
            }}>
              {v ? (<>Anual <span style={{ color: 'var(--v-primary)', fontSize: 11, marginLeft: 6, letterSpacing: '.1em' }}>AHORRA 20%</span></>) : 'Mensual'}
            </button>
          ))}
        </div>
      </div>

      {/* PLANES */}
      <div className="hp-plans">
        {PLANS.map(p => {
          const prices = getPlanPrices(p)
          return <RitualPlanCard key={p.id} plan={p} annual={annual} monthlyReal={prices.monthly} annualReal={prices.annual} fmt={fmt} onClick={() => handleCheckout(p.id)} />
        })}
      </div>

      {/* TESTIMONIALES */}
      <div className="hp-testi-band">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>✦ Historias reales</div>
          <h2 className="hp-testi-h2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', fontWeight: 400, margin: 0, lineHeight: 1.05 }}>
            Lo que <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>cambia</em> cuando tienes un coach.
          </h2>
        </div>
        <div className="hp-testi-grid">
          {TESTIMONIOS.map((t, i) => (
            <div key={i} style={{ padding: 26, background: 'var(--ink-1)', border: '1px solid var(--line)', borderRadius: 18 }}>
              <div style={{ display: 'flex', gap: 2, color: 'var(--v-primary)', marginBottom: 14 }}>
                {[1,2,3,4,5].map(j => <Icon.star key={j} s={12} />)}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.25, letterSpacing: '-0.015em', marginBottom: 22 }}>
                "{t.q}"
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <RealPortrait src={t.img} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role} · {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HUMAN COACHES CTA */}
      <div className="hp-human-wrap">
        <div className="hp-human-grid">
          <div className="hp-human-img">
            <img src={UNSPLASH_IMG.moment2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(10,12,14,.7))' }} />
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <RealPortrait src={UNSPLASH_IMG.t2} size={44} ring />
              <div style={{ color: '#fff' }}>
                <div style={{ fontSize: 12, opacity: .8, fontFamily: 'var(--font-mono)' }}>COACH HUMANO · MARCO</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '-0.02em' }}>Sofía Meléndez, PCC</div>
              </div>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>✦ Addons · sesiones 1:1</div>
            <h2 className="hp-human-h2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', fontWeight: 400, lineHeight: 1.05, margin: 0 }}>
              Cuando necesitas una <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>persona</em>, no una IA.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 18 }}>
              Coaches certificados (ICF / PCC) disponibles por videollamada. Para los momentos donde una conversación real marca la diferencia.
            </p>
            <div className="hp-addons">
              {ADDONS.map((a) => {
                const monthly = precioReal(a.id, a.priceMonthly)
                return (
                  <div key={a.id} onClick={() => handleCheckout(a.id)} style={{ flex: 1, padding: 18, border: '1px solid var(--line)', borderRadius: 14, background: 'var(--ink-2)', cursor: 'pointer' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.name}</div>
                    <div className="eyebrow" style={{ marginBottom: 14 }}>{a.coach}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.02em' }}>{fmt(monthly)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>por sesión</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
