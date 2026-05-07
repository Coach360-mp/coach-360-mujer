'use client'
import { useRouter } from 'next/navigation'

export default function PagoFallido() {
  const router = useRouter()

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { maxWidth: '360px', width: '100%', textAlign: 'center' },
    circulo: { width: '72px', height: '72px', borderRadius: '50%', background: '#FEF0EE', border: '2px solid #E57373', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
    titulo: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', marginBottom: '8px', lineHeight: 1.2 },
    sub: { fontSize: '14px', opacity: 0.5, marginBottom: '32px', lineHeight: 1.6 },
    btnPrimario: { width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' },
    btnSecundario: { width: '100%', padding: '14px', borderRadius: '12px', background: 'transparent', color: '#2A2520', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: '1px solid rgba(42,37,32,0.2)', cursor: 'pointer' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.card}>
          <div style={s.circulo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="5" y1="5" x2="19" y2="19" stroke="#E57373" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="19" y1="5" x2="5" y2="19" stroke="#E57373" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={s.titulo}>El pago no se completó.</div>
          <div style={s.sub}>Puede ser un problema con tu tarjeta o con la conexión. No se realizó ningún cobro.</div>
          <button style={s.btnPrimario} onClick={() => router.push('/holaclara/planes')}>Intentar de nuevo</button>
          <button style={s.btnSecundario} onClick={() => router.push('/holaclara/chat')}>Volver al chat</button>
        </div>
      </div>
    </>
  )
}
