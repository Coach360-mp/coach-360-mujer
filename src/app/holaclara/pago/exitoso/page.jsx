'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PagoExitosoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get('plan') || 'esencial'

  useEffect(() => {
    const t = setTimeout(() => router.push('/holaclara/chat'), 4000)
    return () => clearTimeout(t)
  }, [])

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { maxWidth: '360px', width: '100%', textAlign: 'center' },
    circulo: { width: '72px', height: '72px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
    titulo: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', marginBottom: '8px', lineHeight: 1.2 },
    sub: { fontSize: '14px', opacity: 0.5, marginBottom: '32px', lineHeight: 1.6 },
    btn: { padding: '14px 32px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' },
  }

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.circulo}>
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <polyline points="2,12 10,20 26,4" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={s.titulo}>Ya eres parte, {plan === 'profundo' ? 'Profundo' : 'Esencial'}.</div>
        <div style={s.sub}>Tu plan está activo. Clara te espera adentro.<br />Redirigiendo en unos segundos...</div>
        <button style={s.btn} onClick={() => router.push('/holaclara/chat')}>Ir al chat →</button>
      </div>
    </div>
  )
}

export default function PagoExitoso() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
          cargando...
        </div>
      }>
        <PagoExitosoContent />
      </Suspense>
    </>
  )
}
