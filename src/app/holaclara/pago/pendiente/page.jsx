'use client'
import { useRouter } from 'next/navigation'

export default function PagoPendiente() {
  const router = useRouter()

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { maxWidth: '360px', width: '100%', textAlign: 'center' },
    circulo: { width: '72px', height: '72px', borderRadius: '50%', background: '#FBF5EC', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
    titulo: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', marginBottom: '8px', lineHeight: 1.2 },
    sub: { fontSize: '14px', opacity: 0.5, marginBottom: '12px', lineHeight: 1.6 },
    info: { fontSize: '12px', opacity: 0.35, marginBottom: '32px', lineHeight: 1.6, padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(42,37,32,0.08)' },
    btnPrimario: { width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' },
    btnSecundario: { width: '100%', padding: '14px', borderRadius: '12px', background: 'transparent', color: '#2A2520', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: '1px solid rgba(42,37,32,0.2)', cursor: 'pointer' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.card}>
          <div style={s.circulo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="10" stroke="#C9A96E" strokeWidth="2" />
              <line x1="14" y1="9" x2="14" y2="15" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
              <circle cx="14" cy="19" r="1" fill="#C9A96E" />
            </svg>
          </div>
          <div style={s.titulo}>Tu pago está en proceso.</div>
          <div style={s.sub}>Estamos esperando la confirmación. Esto puede tomar unos minutos.</div>
          <div style={s.info}>
            Cuando el pago sea confirmado recibirás un correo y tu plan se activará automáticamente. Puedes usar Clara de forma gratuita mientras tanto.
          </div>
          <button style={s.btnPrimario} onClick={() => router.push('/holaclara/chat')}>Ir al chat</button>
          <button style={s.btnSecundario} onClick={() => router.push('/holaclara/planes')}>Ver mis planes</button>
        </div>
      </div>
    </>
  )
}
