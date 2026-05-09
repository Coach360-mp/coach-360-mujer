'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const PLAN_NOMBRES = { free: 'Gratis', esencial: 'Esencial', profundo: 'Profundo' }
const PLAN_MSGS = { free: 30, esencial: 400, profundo: 1000 }

export default function CuentaPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/holaclara/auth'); return }
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
      setPerfil({ ...p, email: user.email })
      setCargando(false)
    })
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/holaclara')
  }

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    body: { padding: '24px 20px' },
    card: { background: '#fff', border: '0.5px solid rgba(42,37,32,0.12)', borderRadius: '18px', padding: '20px', marginBottom: '12px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid rgba(42,37,32,0.06)', cursor: 'pointer' },
    rowLabel: { fontSize: '14px', color: '#2A2520', fontWeight: 500 },
    rowValue: { fontSize: '13px', color: '#9A8F84' },
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  const planActual = perfil?.plan_actual || 'free'
  const msgsUsados = perfil?.mensajes_usados_mes || 0
  const msgsTotal = PLAN_MSGS[planActual]

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <nav style={s.nav}>
          <div>
            <div style={s.logoText}>Clara</div>
            <div style={s.goldLine} />
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 }}>Cuenta</div>
        </nav>

        <div style={s.body}>

          {/* AVATAR */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '28px', fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: '#C9A96E' }}>
              {perfil?.nombre ? perfil.nombre[0].toUpperCase() : '?'}
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520', marginBottom: '2px' }}>
              {perfil?.nombre || 'Sin nombre'}
            </div>
            <div style={{ fontSize: '12px', color: '#9A8F84' }}>{perfil?.email}</div>
          </div>

          {/* PLAN ACTUAL */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Tu plan</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520' }}>
                  {PLAN_NOMBRES[planActual]}
                </div>
              </div>
              {planActual === 'free' && (
                <button onClick={() => router.push('/holaclara/planes')} style={{ padding: '8px 16px', borderRadius: '20px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Mejorar →
                </button>
              )}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: '#6B6057' }}>Mensajes este mes</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: msgsUsados >= msgsTotal ? '#E57373' : '#2A2520' }}>{msgsUsados} / {msgsTotal}</span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(42,37,32,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '2px', background: msgsUsados >= msgsTotal ? '#E57373' : '#C9A96E', width: `${Math.min((msgsUsados / msgsTotal) * 100, 100)}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>

          {/* MEMORIA VISIBLE */}
          {perfil && (
            <div style={{ ...s.card, marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>Lo que Clara recuerda de ti</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {perfil.perfil_test_entrada && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#F5EFE6', borderRadius: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, marginTop: '5px' }} />
                    <div style={{ fontSize: '13px', color: '#2A2520' }}>Tu perfil de entrada: <strong>{perfil.perfil_test_entrada.replace(/_/g, ' ')}</strong></div>
                  </div>
                )}
                {perfil.fase_ciclo_actual && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#F5EFE6', borderRadius: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, marginTop: '5px' }} />
                    <div style={{ fontSize: '13px', color: '#2A2520' }}>Tu fase actual: <strong>{{mens:'Menstrual',fol:'Folicular',ov:'Ovulación',lut:'Lútea'}[perfil.fase_ciclo_actual] || perfil.fase_ciclo_actual}</strong></div>
                  </div>
                )}
                {perfil.nombre && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#F5EFE6', borderRadius: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0, marginTop: '5px' }} />
                    <div style={{ fontSize: '13px', color: '#2A2520' }}>Tu nombre: <strong>{perfil.nombre}</strong></div>
                  </div>
                )}
                {!perfil.perfil_test_entrada && !perfil.fase_ciclo_actual && (
                  <div style={{ fontSize: '13px', color: '#9A8F84', fontStyle: 'italic' }}>Clara todavía está conociéndote. Sigue conversando.</div>
                )}
              </div>
            </div>
          )}

          {/* OPCIONES */}
          <div style={s.card}>
            <div style={s.row} onClick={() => router.push('/holaclara/planes')}>
              <span style={s.rowLabel}>Ver planes</span>
              <span style={s.rowValue}>›</span>
            </div>
            <div style={s.row} onClick={() => router.push('/holaclara/habitos')}>
              <span style={s.rowLabel}>Mis hábitos</span>
              <span style={s.rowValue}>›</span>
            </div>
            <div style={s.row} onClick={() => router.push('/holaclara/ciclo')}>
              <span style={s.rowLabel}>Mi ciclo</span>
              <span style={s.rowValue}>›</span>
            </div>
            <div style={{ ...s.row, borderBottom: 'none' }} onClick={() => window.open('mailto:hola@holaclara.app')}>
              <span style={s.rowLabel}>Contacto</span>
              <span style={s.rowValue}>hola@holaclara.app</span>
            </div>
          </div>

          {/* CERRAR SESIÓN */}
          <button onClick={cerrarSesion} style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: '1px solid rgba(42,37,32,0.12)', cursor: 'pointer', marginTop: '8px' }}>
            Cerrar sesión
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: '#C4BDB5' }}>
            Hola Clara · MPR Studio SpA · v1.0
          </div>
        </div>

        <TabBar />
      </div>
    </>
  )
}
