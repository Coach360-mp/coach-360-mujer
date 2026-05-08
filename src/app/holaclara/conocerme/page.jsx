'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const SECCIONES = [
  {
    id: 'rituales',
    titulo: 'Rituales cortos',
    desc: 'Micro-momentos para volver a ti. 1 a 5 minutos.',
    plan: 'free',
    path: '/holaclara/rituales',
    color: '#F5EFE6',
    iconColor: '#C9A96E',
    items: ['3 respiraciones', 'Check-in 1 minuto', '5-4-3-2-1 sensorial', '+ 7 rituales más'],
  },
  {
    id: 'journaling',
    titulo: 'Journaling guiado',
    desc: 'Escribe para descubrir lo que ya sabes.',
    plan: 'free',
    path: '/holaclara/journaling',
    color: '#E1F5EE',
    iconColor: '#1D9E75',
    items: ['Volcado mental', '3 cosas hoy', 'Mi semana en 5 frases'],
  },
  {
    id: 'pausas',
    titulo: 'Pausas guiadas',
    desc: 'Audio con la voz de Clara para momentos difíciles.',
    plan: 'esencial',
    path: '/holaclara/pausas',
    color: '#EEEDFE',
    iconColor: '#534AB7',
    items: ['Cuando no puedo parar de pensar', 'Antes de dormir, soltar el día', 'Pausa de mediodía', '+ 7 pausas más'],
  },
  {
    id: 'programas',
    titulo: 'Programas multi-día',
    desc: 'Acompañamiento profundo durante 3 a 7 días.',
    plan: 'esencial',
    path: '/holaclara/programas',
    color: '#FAECE7',
    iconColor: '#993C1D',
    items: ['3 días para soltar la culpa', '7 días para volver a ti', '5 días para reconectar con tu cuerpo'],
  },
]

const PLAN_LABEL = { free: 'Gratis', esencial: 'Esencial', profundo: 'Profundo' }
const PLAN_ORDER = { free: 0, esencial: 1, profundo: 2 }

export default function ConocermePage() {
  const router = useRouter()
  const [planActual, setPlanActual] = useState('free')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/holaclara/auth'); return }
      const { data: perfil } = await supabase.from('perfiles').select('plan_actual').eq('id', user.id).single()
      if (perfil?.plan_actual) setPlanActual(perfil.plan_actual)
    })
  }, [])

  const tieneAcceso = (planRequerido) => PLAN_ORDER[planActual] >= PLAN_ORDER[planRequerido]

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    body: { padding: '24px 20px' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <nav style={s.nav}>
          <div>
            <div style={s.logoText}>Clara</div>
            <div style={s.goldLine} />
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 }}>Conocerme</div>
        </nav>

        <div style={s.body}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Tu espacio</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '4px' }}>Explora y descubre</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>a tu ritmo, sin presión</div>

          {SECCIONES.map(sec => {
            const acceso = tieneAcceso(sec.plan)
            return (
              <div key={sec.id} onClick={() => acceso ? router.push(sec.path) : router.push('/holaclara/planes')}
                style={{ background: '#fff', border: '0.5px solid rgba(42,37,32,0.12)', borderRadius: '18px', padding: '20px', marginBottom: '12px', cursor: 'pointer', opacity: 1, position: 'relative', overflow: 'hidden' }}>

                {/* Badge plan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: sec.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sec.id === 'rituales' && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={sec.iconColor} strokeWidth="1.5"/><circle cx="10" cy="10" r="3" fill={sec.iconColor} opacity="0.6"/></svg>}
                    {sec.id === 'journaling' && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke={sec.iconColor} strokeWidth="1.5"/><line x1="7" y1="8" x2="13" y2="8" stroke={sec.iconColor} strokeWidth="1.2" strokeLinecap="round"/><line x1="7" y1="11" x2="11" y2="11" stroke={sec.iconColor} strokeWidth="1.2" strokeLinecap="round"/></svg>}
                    {sec.id === 'pausas' && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={sec.iconColor} strokeWidth="1.5"/><path d="M8 7 L8 13 M12 7 L12 13" stroke={sec.iconColor} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    {sec.id === 'programas' && <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10 L7 14 L17 6" stroke={sec.iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', padding: '3px 10px', borderRadius: '20px', background: acceso ? '#F5EFE6' : 'rgba(42,37,32,0.06)', color: acceso ? '#C9A96E' : '#9A8F84' }}>
                    {acceso ? PLAN_LABEL[sec.plan] : `🔒 ${PLAN_LABEL[sec.plan]}`}
                  </div>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: '#2A2520', marginBottom: '4px' }}>{sec.titulo}</div>
                <div style={{ fontSize: '12px', color: '#6B6057', lineHeight: 1.5, marginBottom: '12px' }}>{sec.desc}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sec.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: acceso ? '#2A2520' : '#9A8F84' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: acceso ? sec.iconColor : '#C4BDB5', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>

                {!acceso && (
                  <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(42,37,32,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#6B6057' }}>Disponible en plan {PLAN_LABEL[sec.plan]}</span>
                    <span style={{ fontSize: '12px', color: '#C9A96E', fontWeight: 700 }}>Ver planes →</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <TabBar />
      </div>
    </>
  )
}
