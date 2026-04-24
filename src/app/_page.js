'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Icon, Sigil, RealPortrait } from '@/components/design/icons'

const UNSPLASH_IMG = {
  t1: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop',
  t2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop',
  t3: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop',
  t4: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop',
  moment1: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80&auto=format&fit=crop',
}

const PASOS = [
  ['01', 'Conoces a tu coach', 'Eliges entre Clara, Leo o Marco según tu momento.'],
  ['02', 'Un test breve', '20 preguntas que dibujan tu mapa actual.'],
  ['03', 'Conversas cuando quieras', 'Sin horarios. Sin lista de espera.'],
  ['04', 'Haces módulos cortos', '5-15 min. Para mover algo, no solo leer.'],
  ['05', 'Ves tu progreso', 'Tu equilibrio en mente, cuerpo, corazón, espíritu.'],
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: perfil } = await supabase.from('perfiles').select('current_vertical, onboarding_completado').eq('id', session.user.id).single()
      if (perfil) {
        const vertical = perfil.current_vertical || 'mujer'
        if (vertical === 'mujer') {
          router.push(perfil.onboarding_completado ? '/dashboard' : '/onboarding')
        } else {
          router.push(perfil.onboarding_completado ? `/${vertical}/dashboard` : `/${vertical}/onboarding`)
        }
        return
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="dir-ritual" style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.12em', color: 'var(--text-muted)' }}>CARGANDO ✦</div>
      </div>
    )
  }

  return (
    <div className="dir-ritual" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <style>{`
        .hl-nav { padding: 20px 20px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hl-nav-links { display: none; }
        .hl-hero { padding: 48px 20px 40px; display: flex; flex-direction: column; gap: 40px; }
        .hl-h1 { font-size: clamp(44px, 10vw, 88px); line-height: 0.98; letter-spacing: -0.045em; font-weight: 400; margin: 0; }
        .hl-coach-grid { display: grid; grid-template-columns: 1fr; gap: 12px; height: auto; }
        .hl-coach-big { aspect-ratio: 1 / 1; }
        .hl-coach-sm { aspect-ratio: 16 / 9; }
        .hl-how-wrap { padding: 72px 20px; border-top: 1px solid var(--line); background: var(--ink-2); }
        .hl-how-h2 { font-size: clamp(32px, 7vw, 56px); line-height: 1; letter-spacing: -0.035em; font-weight: 400; margin: 0; }
        .hl-how-grid { display: grid; grid-template-columns: 1fr; gap: 14px; max-width: 1200px; margin: 0 auto; }
        .hl-testi-wrap { padding: 72px 20px; border-top: 1px solid var(--line); }
        .hl-testi-grid { display: flex; flex-direction: column; gap: 32px; max-width: 1200px; margin: 0 auto; align-items: center; }
        .hl-testi-img { width: 100%; max-width: 400px; height: 300px; border-radius: 20px; overflow: hidden; }
        .hl-testi-quote { font-size: clamp(26px, 5vw, 44px); line-height: 1.15; letter-spacing: -0.025em; font-weight: 400; margin-bottom: 28px; font-family: var(--font-display); }
        .hl-cta-wrap { padding: 96px 20px; text-align: center; border-top: 1px solid var(--line); background: var(--ink-2); }
        .hl-cta-h2 { font-size: clamp(42px, 9vw, 72px); line-height: 1; letter-spacing: -0.04em; font-weight: 400; margin: 0 0 24px; }
        @media (min-width: 768px) {
          .hl-nav { padding: 24px 64px; flex-wrap: nowrap; }
          .hl-nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--text-muted); }
          .hl-hero { padding: 96px 64px 80px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 72px; align-items: center; }
          .hl-coach-grid { grid-template-columns: 1fr 1fr; gap: 12px; height: 540px; }
          .hl-coach-big { grid-row: span 2; aspect-ratio: auto; }
          .hl-coach-sm { aspect-ratio: auto; }
          .hl-how-wrap { padding: 96px 64px; }
          .hl-how-grid { grid-template-columns: repeat(5, 1fr); gap: 14px; }
          .hl-testi-wrap { padding: 120px 64px; }
          .hl-testi-grid { display: grid; grid-template-columns: 400px 1fr; gap: 64px; align-items: center; }
          .hl-testi-img { width: 400px; max-width: none; height: 500px; }
          .hl-cta-wrap { padding: 120px 64px; }
        }
      `}</style>

      {/* NAV */}
      <div className="hl-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sigil s={20} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '-0.02em', fontWeight: 500 }}>Coach 360</span>
        </div>
        <div className="hl-nav-links">
          <a href="#coaches" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Coaches</a>
          <a href="#metodo" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Método</a>
          <a onClick={() => router.push('/planes')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Planes</a>
          <a href="#historias" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Historias</a>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/mujer')} style={{ padding: '9px 18px', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Ingresar</button>
          <button onClick={() => router.push('/mujer')} style={{ padding: '9px 18px', borderRadius: 999, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Empezar gratis</button>
        </div>
      </div>

      {/* HERO */}
      <div id="coaches" className="hl-hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>✦ Coaching ontológico con IA · LATAM</div>
          <h1 className="hl-h1" style={{ fontFamily: 'var(--font-display)' }}>
            Alguien <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>a tu lado</em>,<br />cuando lo necesitas.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.55, marginTop: 26, maxWidth: 480 }}>
            Clara, Leo y Marco son coaches de IA que te acompañan todos los días. Te escuchan, te recuerdan lo que importa, y te ayudan a mover lo que estaba quieto.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/mujer')} style={{ padding: '14px 24px', borderRadius: 999, border: 'none', background: 'var(--text)', color: 'var(--bg)', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Empezar gratis</button>
            <a href="#metodo" style={{ padding: '14px 24px', borderRadius: 999, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text)', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Ver cómo funciona</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 32 }}>
            <div style={{ display: 'flex' }}>
              {[UNSPLASH_IMG.t1, UNSPLASH_IMG.t2, UNSPLASH_IMG.t3, UNSPLASH_IMG.t4].map((s, i) => (
                <div key={i} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                  <RealPortrait src={s} size={36} ring />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <b style={{ color: 'var(--text)' }}>+3.000 personas</b> en Chile, Argentina y Colombia
            </div>
          </div>
        </div>

        {/* coach grid */}
        <div className="hl-coach-grid">
          <div data-v="clara" className="hl-coach-big" onClick={() => router.push('/mujer')} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}>
            <img src="/clara.jpg" alt="Clara" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(10,12,14,.85))' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, color: '#fff' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', opacity: .7, letterSpacing: '.1em', marginBottom: 4 }}>PARA TI, MUJER</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.02em' }}>Clara</div>
              <div style={{ fontSize: 13, fontStyle: 'italic', opacity: .85 }}>Más claridad, más poder.</div>
            </div>
          </div>
          <div data-v="leo" className="hl-coach-sm" onClick={() => router.push('/general')} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}>
            <img src="/leo.jpg" alt="Leo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(10,12,14,.85))' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff' }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', opacity: .7, letterSpacing: '.1em' }}>DÍA A DÍA</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Leo</div>
            </div>
          </div>
          <div data-v="marco" className="hl-coach-sm" onClick={() => router.push('/lideres')} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}>
            <img src="/marco.jpg" alt="Marco" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(10,12,14,.85))' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff' }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', opacity: .7, letterSpacing: '.1em' }}>LÍDERES</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Marco</div>
            </div>
          </div>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <div id="metodo" className="hl-how-wrap">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>✦ Cómo funciona</div>
          <h2 className="hl-how-h2" style={{ fontFamily: 'var(--font-display)' }}>
            Cinco minutos al día. <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>Cambios reales</em> en un mes.
          </h2>
        </div>
        <div className="hl-how-grid">
          {PASOS.map(([n, t, d], i) => (
            <div key={i} style={{ padding: 24, background: 'var(--ink-1)', border: '1px solid var(--line)', borderRadius: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--v-primary)', marginBottom: 16 }}>{n}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.015em', marginBottom: 8, lineHeight: 1.2 }}>{t}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIO */}
      <div id="historias" className="hl-testi-wrap">
        <div className="hl-testi-grid">
          <div className="hl-testi-img">
            <img src={UNSPLASH_IMG.moment1} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', gap: 3, color: 'var(--v-primary)', marginBottom: 24 }}>
              {[1,2,3,4,5].map(i => <Icon.star key={i} s={16} />)}
            </div>
            <div className="hl-testi-quote">
              "Después de tres meses con Clara, tomé la decisión que llevaba <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>dos años</em> postergando. No era magia — era alguien que me hacía las preguntas que yo no quería hacerme."
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <RealPortrait src={UNSPLASH_IMG.t3} size={52} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Sofía Valderrama</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Médica · 38 · Viña del Mar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="hl-cta-wrap">
        <h2 className="hl-cta-h2" style={{ fontFamily: 'var(--font-display)' }}>
          Empieza <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>hoy</em>.
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 560, margin: '0 auto 36px' }}>
          Es gratis. Sin tarjeta. Cuando tengas ganas de más, ahí estaremos.
        </p>
        <button onClick={() => router.push('/mujer')} style={{ padding: '16px 36px', borderRadius: 999, border: 'none', background: 'var(--v-primary)', color: '#0a0c0e', fontWeight: 600, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Conocer a mi coach →</button>
      </div>
    </div>
  )
}
