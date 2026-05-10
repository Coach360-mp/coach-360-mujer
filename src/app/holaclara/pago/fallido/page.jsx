'use client'
import { useRouter } from 'next/navigation'

export default function PagoFallido() {
  const router = useRouter()
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>

          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#FAECE7', border: '2px solid #993C1D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <line x1="6" y1="6" x2="22" y2="22" stroke="#993C1D" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="22" y1="6" x2="6" y2="22" stroke="#993C1D" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '12px', lineHeight: 1.2 }}>
            El pago no pudo procesarse.
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#9A8F84', marginBottom: '24px' }}>
            no te preocupes, no se cobró nada
          </div>

          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '32px' }}>
            Puede ser un problema temporal con tu banco o tarjeta. Puedes intentarlo de nuevo o escribirnos a{' '}
            <a href="mailto:hola@holaclara.app" style={{ color: '#C9A96E', textDecoration: 'none' }}>hola@holaclara.app</a>.
          </div>

          <button onClick={() => router.push('/holaclara/planes')}
            style={{ width: '100%', padding: '15px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '10px' }}>
            Intentar de nuevo
          </button>
          <button onClick={() => router.push('/holaclara/chat')}
            style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
            Volver al chat
          </button>
        </div>
      </div>
    </>
  )
}
