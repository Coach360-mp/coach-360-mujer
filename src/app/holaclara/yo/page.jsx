'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const FASES = {
  mens: { nombre: 'Menstrual', color: '#F0997B' },
  fol: { nombre: 'Folicular', color: '#5DCAA5' },
  ov: { nombre: 'Ovulación', color: '#C9A96E' },
  lut: { nombre: 'Lútea', color: '#7F77DD' },
}

export default function YoPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [completadosHoy, setCompletadosHoy] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    inicializar()
  }, [])

  async function inicializar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/holaclara/auth'); return }

    const hoy = new Date().toISOString().split('T')[0]

    const [{ data: p }, { data: h }, { data: c }] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', user.id).single(),
      supabase.from('habitos_usuario').select('*').eq('user_id', user.id).eq('activo', true),
      supabase.from('habitos_completados').select('habito_id').eq('user_id', user.id).eq('fecha', hoy),
    ])

    setPerfil(p)
    setHabitos(h || [])
    setCompletadosHoy((c || []).map(x => x.habito_id))
    setCargando(false)
  }

  const fase = FASES[perfil?.fase_ciclo_actual] || null
  const completados = completadosHoy.length
  const total = habitos.length

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    body: { padding: '24px 20px' },
    card: { background: '#fff', border: '0.5px solid rgba(42,37,32,0.12)', borderRadius: '18px', padding: '20px', marginBottom: '12px', cursor: 'pointer' },
    sectionTitle: { fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '6px' },
    bigTitle: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '4px' },
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <nav style={s.nav}>
          <div>
            <div style={s.logoText}>Clara</div>
            <div style={s.goldLine} />
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 }}>Yo</div>
        </nav>

        <div style={s.body}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Tu espacio</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#2A2520', marginBottom: '4px' }}>
            {perfil?.nombre ? `Hola, ${perfil.nombre.split(' ')[0]}.` : 'Tu seguimiento.'}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>

          {/* HÁBITOS */}
          <div style={s.card} onClick={() => router.push('/holaclara/habitos')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={s.sectionTitle}>Hábitos de hoy</div>
                <div style={s.bigTitle}>
                  {total === 0 ? 'Sin hábitos aún' : `${completados} de ${total} completados`}
                </div>
              </div>
              <div style={{ fontSize: '24px', fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: '#C9A96E', fontWeight: 700 }}>
                {total > 0 ? `${Math.round((completados / total) * 100)}%` : '—'}
              </div>
            </div>
            {total > 0 ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                {habitos.map(h => (
                  <div key={h.id} style={{ flex: 1, height: '4px', borderRadius: '2px', background: completadosHoy.includes(h.id) ? '#C9A96E' : 'rgba(42,37,32,0.1)' }} />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#C9A96E', fontWeight: 700 }}>Agregar primer hábito →</div>
            )}
          </div>

          {/* CICLO */}
          <div style={s.card} onClick={() => router.push('/holaclara/ciclo')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={s.sectionTitle}>Ciclo menstrual</div>
                <div style={s.bigTitle}>{fase ? fase.nombre : 'Sin registrar'}</div>
                {fase && <div style={{ fontSize: '12px', color: '#6B6057', marginTop: '2px' }}>Toca para registrar cómo estás hoy</div>}
                {!fase && <div style={{ fontSize: '12px', color: '#C9A96E', fontWeight: 700, marginTop: '4px' }}>Configurar ciclo →</div>}
              </div>
              {fase && (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${fase.color}20`, border: `2px solid ${fase.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: fase.color, opacity: 0.7 }} />
                </div>
              )}
            </div>
          </div>

          {/* MI PROGRESO - próximamente */}
          <div style={{ ...s.card, opacity: 0.5, cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={s.sectionTitle}>Mi progreso</div>
                <div style={s.bigTitle}>Próximamente</div>
                <div style={{ fontSize: '12px', color: '#6B6057', marginTop: '2px' }}>Gráficas y evolución en el tiempo</div>
              </div>
              <div style={{ fontSize: '10px', color: '#9A8F84', background: 'rgba(42,37,32,0.06)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>V1.1</div>
            </div>
          </div>
        </div>

        <TabBar />
      </div>
    </>
  )
}
