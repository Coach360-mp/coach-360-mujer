'use client'
import { useRouter } from 'next/navigation'

export default function PagoPendiente() {
  const router = useRouter()
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>

          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="11" stroke="#C9A96E" strokeWidth="1.5" />
              <line x1="16" y1="10" x2="16" y2="17" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="21" r="1.2" fill="#C9A96E" />
            </svg>
          </div>

          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '12px', lineHeight: 1.2 }}>
            Tu pago est\u00e1 en proceso.
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>
            te avisaremos cuando se confirme
          </div>

          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '16px', background: '#F5EFE6', borderRadius: '14px', padding: '16px 20px', borderLeft: '3px solid #C9A96E', textAlign: 'left' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#C9A96E', fontWeight: 700, marginBottom: '8px' }}>\u00bfQu\u00e9 pasa ahora?</div>
            Algunos medios de pago demoran unas horas en confirmar. Cuando se apruebe, recibirás un correo y tu plan se activará automáticamente.
          </div>

          <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '28px', lineHeight: 1.6 }}>
            \u00bfTienes dudas? Escríbenos a{' '}
            <a href="mailto:hola@holaclara.app" style={{ color: '#C9A96E', textDecoration: 'none' }}>hola@holaclara.app</a>
          </div>

          <button onClick={() => router.push('/holaclara/chat')}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Volver al chat
          </button>
        </div>
      </div>
    </>
  )
}
