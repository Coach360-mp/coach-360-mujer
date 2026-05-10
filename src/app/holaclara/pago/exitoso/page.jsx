'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const PLAN_NOMBRES = { esencial: 'Esencial', profundo: 'Profundo' }
const PLAN_FEATURES = {
  esencial: ['400 mensajes al mes con Clara', 'Memoria entre sesiones', 'Hábitos + Ciclo menstrual', 'Tests de profundidad'],
  profundo: ['1.000 mensajes al mes con Clara', '20+ herramientas desbloqueadas', 'Tests profundos ilimitados', 'Programas multi-día'],
}

export default function PagoExitoso() {
  const router = useRouter()
  const [plan, setPlan] = useState('esencial')
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const planParam = params.get('plan') || 'esencial'
    setPlan(planParam)
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('perfiles').select('plan_actual').eq('id', user.id).single()
        }
      } catch(e) {}
      setListo(true)
    }, 2500)
  }, [])

  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.esencial
  const planNombre = PLAN_NOMBRES[plan] || plan

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>

          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EAF5EE', border: '2px solid #1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="28" viewBox="0 0 32 28" fill="none">
              <polyline points="2,14 11,23 30,4" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.2 }}>
            Tu pago fue confirmado.
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '18px', color: '#1D9E75', marginBottom: '24px' }}>
            bienvenida al plan {planNombre}
          </div>

          <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '24px', background: '#fff', borderRadius: '16px', padding: '20px', border: '0.5px solid rgba(42,37,32,0.08)', textAlign: 'left' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>Lo que tienes ahora</div>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: i < features.length - 1 ? '8px' : 0, fontSize: '13px', color: '#2A2520' }}>
                <span style={{ color: '#1D9E75', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '28px', lineHeight: 1.6 }}>
            Tienes <span style={{ color: '#C9A96E', fontWeight: 700 }}>7 días de garantía</span>. Si no es para ti,<br />
            escríbenos a <span style={{ color: '#C9A96E' }}>hola@holaclara.app</span> y te devolvemos todo.
          </div>

          <button onClick={() => router.push('/holaclara/chat')} disabled={!listo}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: listo ? '#2A2520' : 'rgba(42,37,32,0.25)', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '15px', fontWeight: 700, border: 'none', cursor: listo ? 'pointer' : 'default', marginBottom: '10px', transition: 'background 0.3s' }}>
            {listo ? 'Hablar con Clara →' : 'Activando tu plan...'}
          </button>

          {!listo && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', animation: `bounce 1s ${i*0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>
        <style>{\`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }\`}</style>
      </div>
    </>
  )
}
