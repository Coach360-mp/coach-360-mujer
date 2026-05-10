'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const PLANES = {
  esencial: {
    nombre: 'Esencial',
    mensual: 9990,
    anual: 99900,
    msgs: '400 mensajes / mes',
    features: ['Todo lo de Gratis', 'Memoria entre sesiones', 'Hábitos + Ciclo', '8 herramientas', 'Tests de profundidad'],
  },
  profundo: {
    nombre: 'Profundo',
    mensual: 19990,
    anual: 199900,
    msgs: '1.000 mensajes / mes',
    features: ['Todo lo de Esencial', '20+ herramientas', 'Tests profundos ilimitados', 'Programas multi-día'],
  },
}

export default function PlanesPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [billing, setBillingState] = useState('mensual')
  const [cargando, setCargando] = useState(false)
  const [planActual, setPlanActual] = useState('free')

  useEffect(() => {
    inicializar()
  }, [])

  async function inicializar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/holaclara/auth'); return }
    setUsuario(user)
    const { data: perfil } = await supabase.from('perfiles').select('plan_actual').eq('id', user.id).single()
    if (perfil?.plan_actual) setPlanActual(perfil.plan_actual)
  }

  async function suscribirse(plan) {
    if (!usuario) { router.push('/holaclara/auth'); return }
    if (planActual === plan) return
    setCargando(plan)
    try {
      const res = await fetch('/api/holaclara/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing, userId: usuario.id, email: usuario.email }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert('Error al crear el pago. Intenta de nuevo.')
      }
    } catch (e) {
      alert('Error de conexión. Intenta de nuevo.')
    }
    setCargando(false)
  }

  const setBilling = (tipo) => setBillingState(tipo)

  const precio = (plan) => billing === 'anual' ? PLANES[plan].anual : PLANES[plan].mensual
  const precioFmt = (plan) => `$${precio(plan).toLocaleString('es-CL')}`
  const periodoFmt = (plan) => billing === 'anual'
    ? `CLP / año · $${Math.round(precio(plan) / 12).toLocaleString('es-CL')}/mes`
    : 'CLP / mes'
  const antesFmt = (plan) => `$${PLANES[plan].mensual.toLocaleString('es-CL')} / mes`

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    container: { maxWidth: '420px', margin: '0 auto' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    navLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' },
    body: { padding: '24px 20px 48px' },
    eyebrow: { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '4px' },
    title: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', lineHeight: 1.1, marginBottom: '20px' },
    toggleWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' },
    toggleOpt: (act) => ({ fontSize: '12px', fontWeight: 700, opacity: act ? 1 : 0.35, cursor: 'pointer', transition: 'opacity 0.15s' }),
    toggleTrack: { width: '44px', height: '24px', borderRadius: '12px', background: '#2A2520', position: 'relative', cursor: 'pointer', flexShrink: 0 },
    toggleThumb: (anual) => ({ width: '18px', height: '18px', borderRadius: '50%', background: '#FAFAF7', position: 'absolute', top: '3px', left: '3px', transition: 'transform 0.2s', transform: anual ? 'translateX(20px)' : 'none' }),
    ahorroBadge: { background: '#C9A96E', color: '#FAFAF7', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.5px' },
    planFree: { background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '18px', padding: '20px', marginBottom: '10px' },
    planEsencial: { background: '#2A2520', borderRadius: '18px', padding: '20px', marginBottom: '10px', position: 'relative' },
    planProfundo: { background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '18px', padding: '20px', marginBottom: '10px' },
    popularBadge: { position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#C9A96E', color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '0 0 10px 10px' },
    planTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' },
    feat: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '5px' },
    chkLt: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(42,37,32,0.08)' },
    chkDk: { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)' },
    btnFree: { width: '100%', padding: '12px', borderRadius: '11px', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(42,37,32,0.2)', color: '#2A2520' },
    btnEsencial: { width: '100%', padding: '12px', borderRadius: '11px', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: '#C9A96E', border: 'none', color: '#ffffff' },
    btnProfundo: { width: '100%', padding: '12px', borderRadius: '11px', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: '#2A2520', border: 'none', color: '#FAFAF7' },
    garantia: { textAlign: 'center', marginTop: '12px', fontSize: '11px', opacity: 0.35, lineHeight: 1.6 },
  }

  const CheckLt = () => (
    <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
      <polyline points="1,4 3,6 7,2" stroke="#2A2520" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
  const CheckDk = () => (
    <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
      <polyline points="1,4 3,6 7,2" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )

  const anual = billing === 'anual'

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <nav style={s.nav}>
            <div>
              <div style={s.logoText}>Clara</div>
              <div style={s.goldLine} />
            </div>
            <div style={s.navLabel}>Planes</div>
            <button style={s.backBtn} onClick={() => router.push('/holaclara/chat')}>← volver</button>
          </nav>

          <div style={s.body}>
            <div style={s.eyebrow}>Elige tu plan</div>
            <div style={s.title}>Invierte en ti.</div>

            {/* TOGGLE */}
            <div style={s.toggleWrap}>
              <span style={s.toggleOpt(!anual)} onClick={() => setBilling('mensual')}>Mensual</span>
              <div style={s.toggleTrack} onClick={() => setBilling(anual ? 'mensual' : 'anual')}>
                <div style={s.toggleThumb(anual)} />
              </div>
              <span style={s.toggleOpt(anual)} onClick={() => setBilling('anual')}>Anual</span>
              {anual && <span style={s.ahorroBadge}>2 meses gratis</span>}
            </div>

            {/* GRATIS */}
            <div style={s.planFree}>
              <div style={s.planTop}>
                <div style={{ fontSize: '17px', fontWeight: 700 }}>Gratis</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '17px', fontWeight: 700 }}>$0</div>
                  <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '1px' }}>CLP / mes</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '12px' }}>30 mensajes / mes</div>
              <div style={{ marginBottom: '14px' }}>
                {['Chat con Clara', 'Test de entrada', 'Perfil personalizado'].map(f => (
                  <div key={f} style={s.feat}>
                    <div style={s.chkLt}><CheckLt /></div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button style={s.btnFree} onClick={() => router.push('/holaclara/chat')}>
                {planActual === 'free' ? 'Tu plan actual' : 'Empezar gratis'}
              </button>
            </div>

            {/* ESENCIAL */}
            <div style={s.planEsencial}>
              <div style={s.popularBadge}>más elegido</div>
              <div style={{ ...s.planTop, marginTop: '10px' }}>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>Esencial</div>
                <div style={{ textAlign: 'right' }}>
                  {anual && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginBottom: '1px' }}>{antesFmt('esencial')}</div>}
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#C9A96E' }}>{precioFmt('esencial')}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>{periodoFmt('esencial')}</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px' }}>{PLANES.esencial.msgs}</div>
              <div style={{ marginBottom: '14px' }}>
                {PLANES.esencial.features.map(f => (
                  <div key={f} style={{ ...s.feat, color: '#fff' }}>
                    <div style={s.chkDk}><CheckDk /></div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button
                style={{ ...s.btnEsencial, opacity: cargando === 'esencial' ? 0.7 : 1 }}
                onClick={() => suscribirse('esencial')}
                disabled={!!cargando || planActual === 'esencial'}
              >
                {planActual === 'esencial' ? 'Tu plan actual' : cargando === 'esencial' ? 'Redirigiendo...' : 'Suscribirme'}
              </button>
            </div>

            {/* PROFUNDO */}
            <div style={s.planProfundo}>
              <div style={s.planTop}>
                <div style={{ fontSize: '17px', fontWeight: 700 }}>Profundo</div>
                <div style={{ textAlign: 'right' }}>
                  {anual && <div style={{ fontSize: '10px', opacity: 0.35, textDecoration: 'line-through', marginBottom: '1px' }}>{antesFmt('profundo')}</div>}
                  <div style={{ fontSize: '17px', fontWeight: 700 }}>{precioFmt('profundo')}</div>
                  <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '1px' }}>{periodoFmt('profundo')}</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '12px' }}>{PLANES.profundo.msgs}</div>
              <div style={{ marginBottom: '14px' }}>
                {PLANES.profundo.features.map(f => (
                  <div key={f} style={s.feat}>
                    <div style={s.chkLt}><CheckLt /></div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button
                style={{ ...s.btnProfundo, opacity: cargando === 'profundo' ? 0.7 : 1 }}
                onClick={() => suscribirse('profundo')}
                disabled={!!cargando || planActual === 'profundo'}
              >
                {planActual === 'profundo' ? 'Tu plan actual' : cargando === 'profundo' ? 'Redirigiendo...' : 'Suscribirme'}
              </button>
            </div>

            <div style={s.garantia}>
              <p><span style={{ color: '#C9A96E' }}>7 días para saber si es para ti.</span><br />Si no cambia nada, te devolvemos todo sin preguntas.<br />Escríbenos a hola@holaclara.app</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
