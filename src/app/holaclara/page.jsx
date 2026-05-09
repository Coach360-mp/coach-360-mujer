'use client'
import { useRouter } from 'next/navigation'


export default function LandingHolaClara() {
  const router = useRouter()

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', overflowX: 'hidden' },
    container: { maxWidth: '420px', margin: '0 auto', padding: '0 20px' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400;1,600&family=Inter+Tight:wght@300;400;600;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>

        {/* NAV */}
        <nav style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(42,37,32,0.08)', maxWidth: '420px', margin: '0 auto' }}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1, color: '#2A2520' }}>Clara</div>
            <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
            <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700 }}>Para la que quiere más y necesita parar.</div>
          </div>
          <button onClick={() => router.push('/holaclara/auth')} style={{ padding: '8px 18px', borderRadius: '20px', border: '1px solid #2A2520', background: 'transparent', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520', WebkitAppearance: 'none' }}>
            Entrar
          </button>
        </nav>

        {/* HERO TEXTO */}
        <div style={{ ...s.container, paddingTop: '48px', paddingBottom: '0', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '52px', lineHeight: 1.1, marginBottom: '16px', color: '#2A2520' }}>
            Vuelve a ti.
          </div>
          <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, opacity: 0.5, marginBottom: '32px' }}>
            Sin agendar, sin culpa, en español.
          </div>
        </div>

        {/* IMAGEN HERO FULL WIDTH */}
        <div style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', marginBottom: '48px', overflow: 'hidden', marginTop: '-1px' }}>
          <img src="/images/hero_landing.png" alt="Clara" style={{ width: '100%', height: '100vw', maxHeight: '500px', objectFit: 'cover', objectPosition: '60% 15%', display: 'block' }} />
        </div>

        {/* 4 PUERTAS */}
        <div style={s.container}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>¿Por dónde entras tú?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '48px' }}>
            {[
              { icono: '◎', titulo: 'Conocerte', desc: 'Hay partes de ti que ni tú conoces todavía.', color: '#F5EFE6', acento: '#C9A96E' },
              { icono: '◈', titulo: 'Crecer', desc: 'Tu próxima versión te está esperando.', color: '#EAF5EE', acento: '#1D9E75' },
              { icono: '◇', titulo: 'Sentirte bien contigo', desc: 'Vuelve a gustarte.', color: '#EEEDFE', acento: '#534AB7' },
              { icono: '◉', titulo: 'Salir del piloto automático', desc: 'Vives ordenada por fuera, agotada por dentro.', color: '#FAECE7', acento: '#993C1D' },
            ].map((puerta, i) => (
              <div key={i} onClick={() => router.push('/holaclara/test')} style={{ background: puerta.color, borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer', borderLeft: `3px solid ${puerta.acento}` }}>
                <div style={{ fontSize: '22px', color: puerta.acento, flexShrink: 0 }}>{puerta.icono}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#2A2520', marginBottom: '3px' }}>{puerta.titulo}</div>
                  <div style={{ fontSize: '13px', color: '#6B6057', lineHeight: 1.4 }}>{puerta.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '18px', color: '#9A8F84' }}>›</div>
              </div>
            ))}
          </div>

          {/* CÓMO FUNCIONA */}
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>Cómo funciona</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '48px' }}>
            {[
              { num: '01', titulo: 'Descubres tu perfil', desc: 'Un test de 2 minutos que te dice qué te está frenando.' },
              { num: '02', titulo: 'Clara te conoce', desc: 'Conversación real. No respuestas genéricas. Clara recuerda lo que le cuentas.' },
              { num: '03', titulo: 'Empiezas a moverte', desc: 'Hábitos, rituales y herramientas hechas para ti — no para todas.' },
            ].map((paso, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: '#fff', borderRadius: '14px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
                <div style={{ fontSize: '13px', color: '#C9A96E', fontWeight: 700, minWidth: '28px' }}>{paso.num}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#2A2520', marginBottom: '4px' }}>{paso.titulo}</div>
                  <div style={{ fontSize: '13px', color: '#6B6057', lineHeight: 1.5 }}>{paso.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* DIFERENCIADORES */}
          <div style={{ background: '#2A2520', borderRadius: '20px', padding: '24px', marginBottom: '48px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '16px' }}>Por qué Clara es distinta</div>
            {[
              { icono: '🌙', texto: 'Memoria hormonal — Clara conoce tu ciclo y adapta el acompañamiento' },
              { icono: '💭', texto: 'Clara recuerda — cada conversación construye sobre la anterior' },
              { icono: '🇨🇱', texto: 'En español, hecho para mujeres LATAM' },
              { icono: '⚡', texto: 'Sin agendar, sin culpa, en tu bolsillo' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: i < 3 ? '12px' : 0 }}>
                <div style={{ fontSize: '16px', flexShrink: 0 }}>{item.icono}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item.texto}</div>
              </div>
            ))}
          </div>

          {/* TESTIMONIOS */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>Lo que dicen las que ya empezaron</div>
            {[
              { texto: '"La primera vez que Clara me preguntó algo, tuve que parar. No esperaba que fuera tan directo."', nombre: 'Valentina, 34', ciudad: 'Santiago' },
              { texto: '"Llevaba meses queriendo hacer algo por mí. Clara me dio el empujón sin juzgarme."', nombre: 'Camila, 29', ciudad: 'México DF' },
              { texto: '"No es una app más. Es como tener una coach disponible cuando la necesito."', nombre: 'Andrea, 38', ciudad: 'Buenos Aires' },
            ].map((t, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '10px', border: '0.5px solid rgba(42,37,32,0.08)' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.7, marginBottom: '12px' }}>{t.texto}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#C9A96E', fontWeight: 700 }}>{t.nombre[0]}</div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#2A2520' }}>{t.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#9A8F84' }}>{t.ciudad}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BETA */}
          <div style={{ background: '#F5EFE6', borderRadius: '14px', padding: '16px 20px', marginBottom: '32px', textAlign: 'center', border: '1px solid #E8D8BC' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: '6px' }}>Beta limitada</div>
            <div style={{ fontSize: '14px', color: '#2A2520', lineHeight: 1.5 }}>Solo 500 mujeres en esta primera etapa. Gratis para empezar.</div>
          </div>

          {/* CTA FINAL */}
          <button onClick={() => router.push('/holaclara/test')} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontSize: '15px', fontFamily: "'Inter Tight', sans-serif", fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.3px' }}>
            Descubrir mi perfil →
          </button>
          <button onClick={() => router.push('/holaclara/auth')} style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontSize: '13px', fontFamily: "'Inter Tight', sans-serif", border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
            Ya tengo cuenta — entrar
          </button>

          <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '20px', fontSize: '11px', color: '#C4BDB5' }}>
            Hola Clara · MPR Studio SpA · Chile
          </div>
        </div>
      </div>
    </>
  )
}
