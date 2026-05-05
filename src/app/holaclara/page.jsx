'use client'
import { useRouter } from 'next/navigation'

export default function HolaClaraLanding() {
  const router = useRouter()

  const styles = {
    root: {
      minHeight: '100vh',
      background: '#FAFAF7',
      fontFamily: "'Lora', serif",
      color: '#2A2520',
      overflowX: 'hidden',
    },
    container: {
      maxWidth: '420px',
      margin: '0 auto',
      padding: '0 20px',
    },
  }

  return (
    <div style={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@700&family=Lora:wght@400;500&family=Caveat:wght@500&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', lineHeight: 1 }}>Clara</div>
          <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
          <div style={{ fontSize: '7px', letterSpacing: '0.1em', color: '#9A8F84', textTransform: 'uppercase' }}>Para la que quiere más y necesita parar.</div>
        </div>
        <button onClick={() => router.push('/holaclara/auth')} style={{ padding: '8px 18px', borderRadius: '20px', border: '1px solid #2A2520', background: 'transparent', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Entrar
        </button>
      </nav>

      {/* HERO */}
      <div style={{ ...styles.container, paddingTop: '48px', paddingBottom: '60px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '52px', lineHeight: 1.1, marginBottom: '16px' }}>
          Vuelve a ti.
        </div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.6, marginBottom: '40px' }}>
          Sin agendar, sin culpa, en español.
        </div>
        <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto 32px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 12px 48px rgba(245,201,168,0.3)', background: '#F5EFE6', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E', opacity: 0.6 }}>Clara</div>
        </div>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#C9A96E' }}>conoce a Clara, tu coach IA</p>
      </div>

      {/* RECONOCIMIENTO */}
      <div style={{ ...styles.container, paddingBottom: '60px' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '24px', textAlign: 'center', opacity: 0.5 }}>
          Si te suena algo de esto
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            'Tienes la vida que se supone deberías querer y aún así llegas agotada al jueves.',
            'Sospechas que estás cumpliendo expectativas que ya no son tuyas, pero no sabes cuándo dejaron de serlo.',
            'Probaste terapia, apps en inglés, podcasts. Quieres algo que te hable a ti.'
          ].map((texto, i) => (
            <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(42,37,32,0.08)' }}>
              <p style={{ fontSize: '16px', lineHeight: 1.6 }}>{texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: '1px', height: '60px', background: 'rgba(42,37,32,0.12)', margin: '0 auto' }} />

      {/* CÓMO FUNCIONA */}
      <div style={{ ...styles.container, paddingBottom: '60px', paddingTop: '40px' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '32px', textAlign: 'center', opacity: 0.5 }}>
          Cómo funciona
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            { num: '01', titulo: 'Clara te conoce', desc: 'Conversaciones sin horario fijo. Clara recuerda lo que importa.' },
            { num: '02', titulo: 'Pregunta antes de aconsejar', desc: 'No te dice qué hacer. Te ayuda a descubrir qué quieres.' },
            { num: '03', titulo: 'Te acompaña en tu ritmo', desc: 'Sin módulos ni lecciones. Solo conversaciones cuando las necesites.' },
          ].map(({ num, titulo, desc }) => (
            <div key={num} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: '#C9A96E', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, minWidth: '28px', paddingTop: '2px' }}>{num}</div>
              <div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>{titulo}</div>
                <p style={{ fontSize: '15px', lineHeight: 1.6, opacity: 0.75 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ width: '1px', height: '60px', background: 'rgba(42,37,32,0.12)', margin: '0 auto' }} />

      {/* 30 DÍAS */}
      <div style={{ ...styles.container, paddingBottom: '60px', paddingTop: '40px' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px', textAlign: 'center', opacity: 0.5 }}>
          En 30 días
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '32px', lineHeight: 1.2, marginBottom: '32px', textAlign: 'center' }}>
          Tres cosas van a cambiar
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { num: '01', texto: 'Vas a saber qué te agota de verdad', gold: true },
            { num: '02', texto: 'Vas a tener tres conversaciones contigo que te dejen distinta', gold: false },
            { num: '03', texto: 'Vas a tomar una decisión que llevabas postergando', gold: false },
          ].map(({ num, texto, gold }) => (
            <div key={num} style={{ background: gold ? 'linear-gradient(135deg, rgba(245,201,168,0.2), rgba(212,181,217,0.2))' : '#fff', padding: '28px', borderRadius: '16px', border: gold ? 'none' : '1px solid rgba(42,37,32,0.08)', borderLeft: gold ? '4px solid #C9A96E' : undefined }}>
              <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', opacity: 0.5 }}>{num}</div>
              <p style={{ fontSize: '18px', lineHeight: 1.5, fontWeight: 500 }}>{texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div style={{ ...styles.container, paddingBottom: '60px' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px', textAlign: 'center', opacity: 0.5 }}>
          Planes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { nombre: 'Gratis', precio: '$0', msgs: '30 mensajes / mes', features: ['Chat con Clara', 'Test de entrada', 'Perfil personalizado'] },
            { nombre: 'Esencial', precio: '$9.990', msgs: '400 mensajes / mes', features: ['Todo lo de Gratis', 'Memoria entre sesiones', '8 herramientas', 'Registro de ciclo'], destacado: true },
            { nombre: 'Profundo', precio: '$19.990', msgs: '1.000 mensajes / mes', features: ['Todo lo de Esencial', '20+ herramientas', 'Tests profundos ilimitados'] },
          ].map(({ nombre, precio, msgs, features, destacado }) => (
            <div key={nombre} style={{ background: destacado ? '#2A2520' : '#fff', color: destacado ? '#FAFAF7' : '#2A2520', padding: '24px', borderRadius: '16px', border: destacado ? 'none' : '1px solid rgba(42,37,32,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '18px' }}>{nombre}</div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, fontSize: '16px', color: destacado ? '#C9A96E' : '#2A2520' }}>{precio} <span style={{ fontSize: '11px', opacity: 0.5 }}>CLP/mes</span></div>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.5, marginBottom: '14px' }}>{msgs}</div>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', fontSize: '13px', opacity: 0.85 }}>
                  <span style={{ color: '#C9A96E' }}>✓</span> {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ ...styles.container, paddingBottom: '80px', textAlign: 'center' }}>
        <button onClick={() => router.push('/holaclara/test')} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontSize: '15px', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.5px' }}>
          Empezar mi test gratuito
        </button>
        <p style={{ fontSize: '13px', opacity: 0.5 }}>3 minutos · sin tarjeta</p>
      </div>
    </div>
  )
}
