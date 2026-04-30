'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const COACHES_INFO = [
  { id: 'leo',   nombre: 'Leo',   role: 'Coach Estratégico · Ejecución', frase: '"Del saber al hacer."',          color: '#4db8a8', img: '/leo.jpg' },
  { id: 'clara', nombre: 'Clara', role: 'Coach Empática · Bienestar',    frase: '"Más claridad, más vos."',       color: '#d4a574', img: '/clara.jpg' },
  { id: 'marco', nombre: 'Marco', role: 'Coach Ejecutivo · Liderazgo',   frase: '"Liderar es decidir bien."',     color: '#7b68a8', img: '/marco.jpg' },
]

const PASOS = [
  ['1', 'Registrate en segundos',     'Crea tu cuenta con email. No requiere tarjeta para empezar gratis.'],
  ['2', 'Elegí tu coach',              'Leo, Clara o Marco — según lo que querés mover.'],
  ['3', 'Onboarding guiado',           'Respondes algunas preguntas y armamos tu mapa de inicio.'],
  ['4', 'Conversa cuando quieras',     'Chat sin horarios. Tu coach está cuando lo necesitás.'],
  ['5', 'Mira tu progreso',            'Métricas, hitos y reconocimientos en tiempo real.'],
]

const TESTIMONIOS = [
  { quote: 'Coach 360 cambió cómo veo mis desafíos. Leo me ayudó a entender por qué procrastinaba. Ahora soy mucho más productivo.',  name: 'Andrés Martínez', role: 'Emprendedor, México',   img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { quote: 'Llevo 3 meses con Clara y mi estrés bajó dramáticamente. Finalmente entiendo cómo cuidarme sin culpa.',                    name: 'Sofía García',    role: 'Ejecutiva, Argentina',  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { quote: 'Marco me ayudó a sacar lo mejor de mi equipo. Antes éramos caóticos, ahora tenemos dirección.',                            name: 'Carlos López',    role: 'Director, Colombia',    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
]

const FAQS = [
  ['¿Cuánto cuesta Coach 360?',           'Plan free con acceso limitado y planes pagos desde $9.990 CLP/mes. Cada plan incluye acceso a coaches y herramientas según tu nivel.'],
  ['¿Qué pasa si no me gusta mi coach?',  'Podés cambiar de coach cuando quieras desde Configuración. Sin penalidades.'],
  ['¿Es seguro compartir mi información?','Sí. Cumplimos con la Ley 19.628 de Chile. Tus datos no se venden.'],
  ['¿Los coaches son humanos o IA?',      'Los coaches son agentes de IA entrenados con metodologías profesionales. Las sesiones 1:1 con humanos son add-on premium.'],
  ['¿Hay garantía?',                       'Plan Esencial y Premium con cancelación cuando quieras, sin compromisos largos.'],
  ['¿Puedo usarlo desde el celu?',         'Sí. La app es 100% responsive — funciona desde cualquier dispositivo.'],
]

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)

  // Auth modal state
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authNombre, setAuthNombre] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: perfil } = await supabase
        .from('perfiles').select('onboarding_completado, current_vertical')
        .eq('id', session.user.id).maybeSingle()
      if (perfil) {
        if (perfil.onboarding_completado) {
          const tab = perfil.current_vertical === 'mujer' ? 'mujer'
                    : perfil.current_vertical === 'lideres' ? 'lideres'
                    : 'coach360'
          router.push(`/dashboard?tab=${tab}`)
        } else {
          router.push('/onboarding')
        }
        return
      }
    }
    setLoading(false)
  }

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthError('')
  }
  const closeAuth = () => {
    setAuthMode(null)
    setAuthEmail(''); setAuthPassword(''); setAuthNombre(''); setAuthError('')
  }
  const handleCTA = () => openAuth('signup')

  const handleGoogle = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) setAuthError(error.message)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setAuthLoading(true); setAuthError('')
    const { data, error } = await supabase.auth.signUp({
      email: authEmail.trim(), password: authPassword,
    })
    if (error) { setAuthError(error.message); setAuthLoading(false); return }

    // Si Supabase tiene "Confirm email" ON, data.session es null → usuario debe verificar email primero.
    if (!data.session) {
      setAuthLoading(false)
      setAuthError('Te enviamos un email a ' + authEmail.trim() + '. Confirmá tu cuenta y volvé a iniciar sesión.')
      return
    }

    if (data.user && authNombre.trim()) {
      try { await supabase.from('perfiles').update({ nombre: authNombre.trim() }).eq('id', data.user.id) } catch {}
    }
    setAuthLoading(false)
    router.push('/onboarding')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthLoading(true); setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail.trim(), password: authPassword,
    })
    if (error) { setAuthError(error.message); setAuthLoading(false); return }
    if (!data.session) {
      setAuthLoading(false)
      setAuthError('No pudimos iniciar sesión. Confirmá que el email esté verificado.')
      return
    }
    const { data: perfil } = await supabase
      .from('perfiles').select('onboarding_completado, current_vertical')
      .eq('id', data.user.id).maybeSingle()
    setAuthLoading(false)
    if (perfil?.onboarding_completado) {
      const tab = perfil.current_vertical === 'mujer' ? 'mujer'
                : perfil.current_vertical === 'lideres' ? 'lideres'
                : 'coach360'
      router.push(`/dashboard?tab=${tab}`)
    } else {
      router.push('/onboarding')
    }
  }

  if (loading) {
    return (
      <div className="cz-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, letterSpacing: '.12em', color: 'var(--text-muted)' }}>CARGANDO ✦</div>
        <style jsx global>{landingStyles}</style>
      </div>
    )
  }

  return (
    <div className="cz-page">
      <header className="cz-header">
        <nav className="cz-nav">
          <div className="cz-logo">
            <div className="cz-logo-sigil" />
            <span>Coach 360</span>
          </div>
          <ul className="cz-nav-links">
            <li><a href="#coaches">Coaches</a></li>
            <li><a href="#how">Cómo funciona</a></li>
            <li><a href="#testimonials">Testimonios</a></li>
            <li><a href="#faq">Preguntas</a></li>
          </ul>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="cz-nav-login" onClick={() => openAuth('login')}>Iniciar sesión</button>
            <button className="cz-nav-cta" onClick={handleCTA}>Comenzar</button>
          </div>
        </nav>
      </header>

      <section className="cz-hero">
        <div className="cz-eyebrow cz-eyebrow-hero">Transformación Personal Guiada</div>
        <h1 className="cz-hero-title">Alcanzá tus objetivos con coaching personalizado</h1>
        <p className="cz-hero-subtitle">Coaches expertos diseñados para tu crecimiento personal, profesional y emocional.</p>
        <div className="cz-cta-group">
          <button className="cz-btn-primary" onClick={handleCTA}>Comenzar hoy</button>
          <a href="#coaches" className="cz-btn-secondary">Conocer a los coaches</a>
        </div>
        <div className="cz-hero-image">
          <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80" alt="Coach 360" />
        </div>
      </section>

      <section className="cz-section" id="coaches">
        <div className="cz-section-header">
          <div className="cz-eyebrow cz-eyebrow-section">Nuestros Coaches</div>
          <h2 className="cz-section-title">Expertos en crecimiento personal</h2>
          <p className="cz-section-subtitle">Cada coach aporta su especialidad para guiarte hacia tu mejor versión.</p>
        </div>
        <div className="cz-coaches-grid">
          {COACHES_INFO.map((c) => (
            <div key={c.id} className="cz-coach-card">
              <div className="cz-coach-avatar" style={{ borderColor: c.color }}>
                <img src={c.img} alt={c.nombre} />
              </div>
              <div>
                <div className="cz-coach-name">{c.nombre}</div>
                <div className="cz-coach-role">{c.role}</div>
              </div>
              <div className="cz-coach-quote" style={{ borderTopColor: 'rgba(255,255,255,0.08)' }}>{c.frase}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cz-section" id="how">
        <div className="cz-section-header">
          <div className="cz-eyebrow cz-eyebrow-section">Proceso simple</div>
          <h2 className="cz-section-title">Cómo funciona Coach 360</h2>
          <p className="cz-section-subtitle">Empezá tu transformación en 5 pasos.</p>
        </div>
        <div className="cz-how-grid">
          <div className="cz-how-steps">
            {PASOS.map(([n, t, d]) => (
              <div key={n} className="cz-how-step">
                <div className="cz-step-number">{n}</div>
                <div>
                  <div className="cz-step-title">{t}</div>
                  <div className="cz-step-desc">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="cz-how-image">
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80" alt="Cómo funciona" />
          </div>
        </div>
      </section>

      <section className="cz-section" id="testimonials">
        <div className="cz-section-header">
          <div className="cz-eyebrow cz-eyebrow-section">Historias reales</div>
          <h2 className="cz-section-title">Transformaciones que inspiran</h2>
        </div>

        <div className="cz-stats">
          <div className="cz-stat-card"><div className="cz-stat-num">92%</div><div className="cz-stat-label">reportan transformación en 90 días</div></div>
          <div className="cz-stat-card"><div className="cz-stat-num">50k+</div><div className="cz-stat-label">usuarios activos</div></div>
          <div className="cz-stat-card"><div className="cz-stat-num">4.9★</div><div className="cz-stat-label">calificación promedio</div></div>
        </div>

        <div className="cz-testimonials-grid">
          {TESTIMONIOS.map((t, i) => (
            <div key={i} className="cz-testimonial-card">
              <p className="cz-testimonial-quote">"{t.quote}"</p>
              <div className="cz-testimonial-author">
                <div className="cz-testimonial-avatar">
                  <img src={t.img} alt={t.name} />
                </div>
                <div>
                  <div className="cz-testimonial-name">{t.name}</div>
                  <div className="cz-testimonial-role">{t.role}</div>
                </div>
              </div>
              <div className="cz-testimonial-stars">⭐⭐⭐⭐⭐ 5.0</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cz-cta-section">
        <div className="cz-cta-grid">
          <div className="cz-cta-image">
            <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80" alt="Empezá tu viaje" />
          </div>
          <div>
            <h2 className="cz-cta-title">Comenzá tu transformación hoy</h2>
            <p className="cz-cta-subtitle">No necesitás perfección, solo honestidad contigo. Miles ya dieron el primer paso.</p>
            <ul className="cz-cta-list">
              <li><span>✓</span> Plan Free disponible para siempre</li>
              <li><span>✓</span> Sin tarjeta de crédito requerida</li>
              <li><span>✓</span> Cambiar coach cuando quieras</li>
              <li><span>✓</span> Cumplimiento Ley 19.628 (Chile)</li>
            </ul>
            <button className="cz-btn-primary cz-btn-full" onClick={handleCTA}>Comenzar mi viaje ahora</button>
          </div>
        </div>
      </section>

      <section className="cz-section" id="faq">
        <div className="cz-section-header">
          <div className="cz-eyebrow cz-eyebrow-section">Preguntas frecuentes</div>
          <h2 className="cz-section-title">¿Qué necesitás saber?</h2>
        </div>
        <div className="cz-faq-grid">
          {FAQS.map(([q, a], i) => (
            <div key={i} className={`cz-faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="cz-faq-question">
                <span>{q}</span>
                <span className="cz-faq-icon">▼</span>
              </div>
              {openFaq === i && <div className="cz-faq-answer">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      <footer className="cz-footer">
        <div className="cz-footer-content">
          <div>
            <h3>Producto</h3>
            <a href="/planes">Planes</a>
            <a href="#coaches">Coaches</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h3>Empresa</h3>
            <a href="#">Sobre nosotros</a>
            <a href="#">Contacto</a>
          </div>
          <div>
            <h3>Legal</h3>
            <a href="/privacidad">Privacidad</a>
            <a href="#">Términos</a>
          </div>
          <div>
            <h3>Cuenta</h3>
            <a href="/onboarding">Empezar</a>
            <a href="/forgot-password">Recuperar contraseña</a>
          </div>
        </div>
        <div className="cz-footer-bottom">
          <span>© 2026 Coach 360. Todos los derechos reservados.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </footer>

      {/* Auth modal */}
      {authMode && (
        <div className="cz-modal-overlay" onClick={closeAuth}>
          <div className="cz-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cz-modal-close" onClick={closeAuth} aria-label="Cerrar">✕</button>
            <div className="cz-modal-tabs">
              <button
                className={`cz-modal-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => openAuth('signup')}
              >
                Crear cuenta
              </button>
              <button
                className={`cz-modal-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => openAuth('login')}
              >
                Iniciar sesión
              </button>
            </div>

            <form onSubmit={authMode === 'signup' ? handleSignup : handleLogin} className="cz-modal-form">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={authNombre}
                  onChange={(e) => setAuthNombre(e.target.value)}
                  className="cz-modal-input"
                  autoFocus
                />
              )}
              <input
                type="email"
                placeholder="tu@email.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="cz-modal-input"
                required
                autoFocus={authMode === 'login'}
              />
              <input
                type="password"
                placeholder="Contraseña (mín. 6 caracteres)"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="cz-modal-input"
                required
                minLength={6}
              />

              {authError && (
                <div className="cz-modal-error">{authError}</div>
              )}

              <button
                type="submit"
                className="cz-btn-primary cz-btn-full"
                disabled={authLoading}
              >
                {authLoading
                  ? '…'
                  : authMode === 'signup' ? 'Crear cuenta' : 'Entrar'}
              </button>

              <div className="cz-modal-divider"><span>o</span></div>

              <button
                type="button"
                onClick={handleGoogle}
                className="cz-modal-google"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z" fill="#4285F4"/>
                  <path d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H.8v2.3C2.3 15.9 5.4 18 9 18z" fill="#34A853"/>
                  <path d="M3.8 10.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V5H.8C.3 6.2 0 7.5 0 9s.3 2.8.8 4l3-2.3z" fill="#FBBC04"/>
                  <path d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.3 2.1.8 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </button>

              <p className="cz-modal-foot">
                {authMode === 'signup'
                  ? <>¿Ya tenés cuenta? <a onClick={() => openAuth('login')}>Iniciar sesión</a></>
                  : <>¿No tenés cuenta? <a onClick={() => openAuth('signup')}>Crear cuenta</a></>
                }
                {authMode === 'login' && <> · <a href="/forgot-password">Olvidé mi contraseña</a></>}
              </p>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{landingStyles}</style>
    </div>
  )
}

const landingStyles = `
.cz-page {
  --cz-accent: #4db8a8;
  --cz-bg: #0a0a0a;
  --cz-bg-2: #111111;
  --cz-text: #ffffff;
  --cz-muted: #a8a8a8;
  background: var(--cz-bg);
  color: var(--cz-text);
  font-family: var(--font-body), Inter, system-ui, sans-serif;
  line-height: 1.6;
  min-height: 100vh;
}

.cz-header {
  background: var(--cz-bg-2);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 16px 32px;
  position: sticky;
  top: 0;
  z-index: 100;
}
.cz-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}
.cz-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display), Fraunces, Georgia, serif;
  font-size: 16px;
  font-weight: 500;
}
.cz-logo-sigil {
  width: 16px;
  height: 16px;
  border: 1px solid var(--cz-accent);
  border-radius: 50%;
}
.cz-nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.cz-nav-links a {
  color: var(--cz-muted);
  text-decoration: none;
  font-size: 13px;
  transition: color 300ms;
}
.cz-nav-links a:hover { color: var(--cz-text); }
.cz-nav-cta {
  padding: 10px 20px;
  background: var(--cz-accent);
  color: var(--cz-bg);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: all 300ms;
}
.cz-nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(77,184,168,0.24);
}

.cz-hero {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 32px;
  text-align: center;
}
.cz-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
}
.cz-eyebrow-hero, .cz-eyebrow-section {
  color: var(--cz-accent);
  margin-bottom: 16px;
}
.cz-hero-title {
  font-family: var(--font-display), Fraunces, Georgia, serif;
  font-size: clamp(32px, 6vw, 56px);
  font-weight: 500;
  line-height: 1.2;
  margin: 0 auto 20px;
  max-width: 800px;
}
.cz-hero-subtitle {
  font-size: 18px;
  color: var(--cz-muted);
  max-width: 700px;
  margin: 0 auto 40px;
}
.cz-cta-group {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}
.cz-btn-primary {
  padding: 14px 32px;
  background: var(--cz-accent);
  color: var(--cz-bg);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: all 300ms;
}
.cz-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(77,184,168,0.32);
}
.cz-btn-full { width: 100%; padding: 16px; }
.cz-btn-secondary {
  padding: 14px 32px;
  background: transparent;
  color: var(--cz-text);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 300ms;
}
.cz-btn-secondary:hover {
  border-color: var(--cz-accent);
  background: rgba(77,184,168,0.05);
}
.cz-hero-image {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(77,184,168,0.2);
  aspect-ratio: 16/9;
  max-width: 1000px;
  margin: 0 auto;
}
.cz-hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

.cz-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 32px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.cz-section-header { text-align: center; margin-bottom: 60px; }
.cz-section-title {
  font-family: var(--font-display), Fraunces, Georgia, serif;
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 500;
  margin: 12px 0 16px;
}
.cz-section-subtitle {
  font-size: 16px;
  color: var(--cz-muted);
  max-width: 600px;
  margin: 0 auto;
}

.cz-coaches-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.cz-coach-card {
  background: var(--cz-bg-2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 300ms;
}
.cz-coach-card:hover {
  border-color: rgba(77,184,168,0.3);
  background: rgba(77,184,168,0.05);
  transform: translateY(-4px);
}
.cz-coach-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  overflow: hidden;
  border: 2px solid;
  background: rgba(255,255,255,0.05);
}
.cz-coach-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cz-coach-name {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--font-display), Fraunces, Georgia, serif;
}
.cz-coach-role { font-size: 13px; color: var(--cz-muted); margin-top: 4px; }
.cz-coach-quote {
  font-size: 12px;
  color: var(--cz-muted);
  border-top: 1px solid;
  padding-top: 16px;
  font-style: italic;
}

.cz-how-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.cz-how-steps { display: flex; flex-direction: column; gap: 32px; }
.cz-how-step { display: flex; gap: 20px; align-items: flex-start; }
.cz-step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(77,184,168,0.1);
  border: 1px solid rgba(77,184,168,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--cz-accent);
  font-size: 14px;
  flex-shrink: 0;
}
.cz-step-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.cz-step-desc { font-size: 12px; color: var(--cz-muted); line-height: 1.6; }
.cz-how-image {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(77,184,168,0.2);
  aspect-ratio: 4/5;
}
.cz-how-image img { width: 100%; height: 100%; object-fit: cover; display: block; }

.cz-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 60px;
}
.cz-stat-card {
  text-align: center;
  padding: 24px;
  background: rgba(77,184,168,0.05);
  border-radius: 12px;
  border: 1px solid rgba(77,184,168,0.1);
}
.cz-stat-num { font-size: 36px; font-weight: 600; color: var(--cz-accent); margin-bottom: 8px; }
.cz-stat-label { font-size: 12px; color: var(--cz-muted); }

.cz-testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.cz-testimonial-card {
  background: var(--cz-bg-2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 28px 24px;
}
.cz-testimonial-quote { font-size: 14px; line-height: 1.7; margin-bottom: 16px; font-style: italic; }
.cz-testimonial-author { display: flex; align-items: center; gap: 12px; }
.cz-testimonial-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
.cz-testimonial-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cz-testimonial-name { font-size: 13px; font-weight: 600; }
.cz-testimonial-role { font-size: 11px; color: var(--cz-muted); }
.cz-testimonial-stars { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: var(--cz-accent); }

.cz-cta-section {
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 80px 32px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.cz-cta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.cz-cta-image {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(77,184,168,0.2);
  aspect-ratio: 4/5;
}
.cz-cta-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cz-cta-title {
  font-family: var(--font-display), Fraunces, Georgia, serif;
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 500;
  margin-bottom: 16px;
}
.cz-cta-subtitle { font-size: 15px; color: var(--cz-muted); margin-bottom: 32px; line-height: 1.8; }
.cz-cta-list { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 12px; }
.cz-cta-list li { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.cz-cta-list li span { color: var(--cz-accent); }

.cz-faq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 40px;
}
.cz-faq-item {
  background: var(--cz-bg-2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 300ms;
}
.cz-faq-item:hover { border-color: rgba(77,184,168,0.3); background: rgba(77,184,168,0.05); }
.cz-faq-question { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-weight: 600; font-size: 14px; }
.cz-faq-icon { font-size: 12px; transition: transform 300ms; flex-shrink: 0; color: var(--cz-accent); }
.cz-faq-item.open .cz-faq-icon { transform: rotate(180deg); }
.cz-faq-answer { margin-top: 16px; font-size: 13px; color: var(--cz-muted); line-height: 1.6; }

.cz-footer {
  background: var(--cz-bg-2);
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 60px 32px;
  margin-top: 80px;
}
.cz-footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}
.cz-footer h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 16px; font-weight: 600; }
.cz-footer a { display: block; font-size: 13px; color: var(--cz-muted); text-decoration: none; margin-bottom: 10px; transition: color 300ms; }
.cz-footer a:hover { color: var(--cz-text); }
.cz-footer-bottom {
  max-width: 1400px;
  margin: 40px auto 0;
  padding-top: 40px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--cz-muted);
}

/* Auth login button in nav */
.cz-nav-login {
  padding: 10px 16px;
  background: transparent;
  color: var(--cz-text);
  border: none;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: color 200ms;
}
.cz-nav-login:hover { color: var(--cz-accent); }

/* Auth modal */
.cz-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,10,10,0.85);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.cz-modal {
  width: 100%;
  max-width: 440px;
  background: var(--cz-bg-2);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 32px 28px 28px;
  position: relative;
  max-height: 92vh;
  overflow-y: auto;
}
.cz-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--cz-muted);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}
.cz-modal-close:hover { color: var(--cz-text); border-color: rgba(255,255,255,0.2); }
.cz-modal-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 22px;
  background: rgba(255,255,255,0.04);
  padding: 4px;
  border-radius: 8px;
}
.cz-modal-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--cz-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  font-family: inherit;
  transition: all 200ms;
}
.cz-modal-tab.active {
  background: var(--cz-accent);
  color: var(--cz-bg);
  font-weight: 600;
}
.cz-modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cz-modal-input {
  width: 100%;
  padding: 13px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: var(--cz-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 200ms;
}
.cz-modal-input:focus { border-color: var(--cz-accent); background: rgba(255,255,255,0.06); }
.cz-modal-input::placeholder { color: rgba(168,168,168,0.5); }
.cz-modal-error {
  font-size: 12px;
  color: #f87171;
  padding: 8px 12px;
  background: rgba(248,113,113,0.08);
  border-radius: 6px;
  line-height: 1.4;
}
.cz-modal-divider {
  text-align: center;
  margin: 4px 0;
  position: relative;
  font-size: 11px;
  color: var(--cz-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.cz-modal-divider::before, .cz-modal-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 24px);
  height: 1px;
  background: rgba(255,255,255,0.08);
}
.cz-modal-divider::before { left: 0; }
.cz-modal-divider::after { right: 0; }
.cz-modal-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: var(--cz-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 200ms;
}
.cz-modal-google:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); }
.cz-modal-foot {
  margin-top: 4px;
  font-size: 12px;
  color: var(--cz-muted);
  text-align: center;
  line-height: 1.6;
}
.cz-modal-foot a {
  color: var(--cz-accent);
  cursor: pointer;
  text-decoration: none;
}
.cz-modal-foot a:hover { text-decoration: underline; }

@media (max-width: 1024px) {
  .cz-coaches-grid, .cz-stats, .cz-testimonials-grid, .cz-footer-content { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .cz-nav-links { display: none; }
  .cz-hero, .cz-section, .cz-cta-section { padding: 60px 16px; }
  .cz-coaches-grid, .cz-stats, .cz-testimonials-grid, .cz-faq-grid, .cz-footer-content { grid-template-columns: 1fr; }
  .cz-how-grid, .cz-cta-grid { grid-template-columns: 1fr; gap: 32px; }
  .cz-footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
}
`
