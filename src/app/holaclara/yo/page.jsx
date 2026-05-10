'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const TEST_META = {
  'descanso': { nombre: 'Tipo de descanso', color: '#F5EFE6', acento: '#C9A96E', path: '/holaclara/tests/descanso' },
  'tipo-de-descanso': { nombre: 'Tipo de descanso', color: '#F5EFE6', acento: '#C9A96E', path: '/holaclara/tests/descanso' },
  'autocuidado': { nombre: 'Cómo me hablo', color: '#FAECE7', acento: '#993C1D', path: '/holaclara/tests/autocuidado' },
  'apego': { nombre: 'Estilo de apego', color: '#EEEDFE', acento: '#534AB7', path: '/holaclara/tests/apego' },
  'valores': { nombre: 'Mis valores reales', color: '#EAF5EE', acento: '#1D9E75', path: '/holaclara/tests/valores' },
}

const NIVELES = [
  { nivel: 1, nombre: 'Semilla', ptsMin: 0, ptsMax: 100, desc: 'Todo comienza aquí. Estás llegando.', img: '/images/nivel_semilla.png' },
  { nivel: 2, nombre: 'Brote', ptsMin: 100, ptsMax: 300, desc: 'Estás creciendo. Cada conversación cuenta.', img: '/images/nivel_brote.png' },
  { nivel: 3, nombre: 'Flor', ptsMin: 300, ptsMax: 700, desc: 'Te estás abriendo. Algo en ti ya cambió.', img: '/images/nivel_flor.png' },
  { nivel: 4, nombre: 'Fruto', ptsMin: 700, ptsMax: 1500, desc: 'Lo que sembraste está dando frutos.', img: '/images/nivel_fruto.png' },
  { nivel: 5, nombre: 'Raíz', ptsMin: 1500, ptsMax: 9999, desc: 'Eres tu propio suelo. Ya eres.', img: '/images/nivel_raiz.png' },
]

const FASES = {
  mens: { nombre: 'Menstrual', color: '#F0997B' },
  fol: { nombre: 'Folicular', color: '#5DCAA5' },
  ov: { nombre: 'Ovulación', color: '#C9A96E' },
  lut: { nombre: 'Lútea', color: '#7F77DD' },
}

function calcularNivel(pts) {
  for (let i = NIVELES.length - 1; i >= 0; i--) {
    if (pts >= NIVELES[i].ptsMin) return NIVELES[i]
  }
  return NIVELES[0]
}

function formatFecha(dateStr) {
  const d = new Date(dateStr)
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)
  if (d.toDateString() === hoy.toDateString()) return `hoy ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
  if (d.toDateString() === ayer.toDateString()) return 'ayer'
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

function ActividadIcon({ tipo }) {
  const icons = {
    ritual: { bg: '#F5EFE6', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="#C9A96E" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" fill="#C9A96E" opacity="0.6"/></svg> },
    journaling: { bg: '#E1F5EE', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="2" stroke="#1D9E75" strokeWidth="1.2"/><line x1="5" y1="6" x2="11" y2="6" stroke="#1D9E75" strokeWidth="1" strokeLinecap="round"/><line x1="5" y1="9" x2="9" y2="9" stroke="#1D9E75" strokeWidth="1" strokeLinecap="round"/></svg> },
    chat: { bg: '#F5EFE6', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3 C2 2.5 2.5 2 3 2 L13 2 C13.5 2 14 2.5 14 3 L14 9 C14 9.5 13.5 10 13 10 L9.5 10 L7 13 L7 10 L3 10 C2.5 10 2 9.5 2 9 Z" stroke="#C9A96E" strokeWidth="1.2" fill="rgba(201,169,110,0.1)"/></svg> },
    habito: { bg: '#E1F5EE', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8 L5.5 11.5 L14 4" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    test: { bg: '#EEEDFE', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="#534AB7" strokeWidth="1.2" strokeDasharray="3 2"/><circle cx="8" cy="8" r="2" stroke="#534AB7" strokeWidth="1.2"/></svg> },
  }
  const { bg, icon } = icons[tipo] || icons.chat
  return (
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
  )
}

export default function YoPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [completadosHoy, setCompletadosHoy] = useState([])
  const [puntos, setPuntos] = useState(0)
  const [actividad, setActividad] = useState([])
  const [tests, setTests] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { inicializar() }, [])

  async function inicializar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/holaclara/auth'); return }

    const hoy = new Date().toISOString().split('T')[0]

    const [{ data: p }, { data: h }, { data: c }, { data: rituales }, { data: journal }, { data: habitosHist }, { data: testsHist }] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', user.id).single(),
      supabase.from('habitos_usuario').select('*').eq('user_id', user.id).eq('activo', true),
      supabase.from('habitos_completados').select('habito_id').eq('user_id', user.id).eq('fecha', hoy),
      supabase.from('rituales_completados').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('journaling_entradas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('habitos_completados').select('*').eq('user_id', user.id).not('nombre', 'is', null).order('created_at', { ascending: false }).limit(20),
      supabase.from('tests_resultados_usuaria').select('test_slug, resultado_slug, completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }),
    ])

    setPerfil({ ...p, email: user.email })
    setHabitos(h || [])
    setCompletadosHoy((c || []).map(x => x.habito_id))

    // Calcular puntos totales
    const ptsRituales = (rituales?.length || 0) * 5
    const ptsJournal = (journal?.length || 0) * 10
    const ptsHabitosTotal = (habitosHist?.length || 0) * 3
    const ptsTest = p?.perfil_test_entrada ? 20 : 0
    const totalPts = ptsRituales + ptsJournal + ptsHabitosTotal + ptsTest
    setPuntos(totalPts)

    // Construir historial unificado
    const items = [
      ...(rituales || []).map(r => ({
        tipo: 'ritual',
        nombre: r.ritual_id.replace(/_/g, ' '),
        pts: 5,
        fecha: r.created_at,
      })),
      ...(journal || []).map(j => ({
        tipo: 'journaling',
        nombre: j.plantilla_id.replace(/_/g, ' '),
        pts: 10,
        fecha: j.created_at,
      })),
      ...(habitosHist || []).filter(h => h.nombre).map(h => ({
        tipo: 'habito',
        nombre: h.nombre,
        pts: 3,
        fecha: h.created_at || (h.fecha + 'T12:00:00'),
      })),
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 15)

    setActividad(items)
    setTests(testsHist || [])
    setCargando(false)
  }

  const nivelActual = calcularNivel(puntos)
  const nivelSig = NIVELES.find(n => n.nivel === nivelActual.nivel + 1)
  const progreso = nivelSig
    ? ((puntos - nivelActual.ptsMin) / (nivelSig.ptsMin - nivelActual.ptsMin)) * 100
    : 100
  const completados = completadosHoy.length
  const total = habitos.length
  const fase = FASES[perfil?.fase_ciclo_actual] || null

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    body: { padding: '24px 20px 100px' },
    card: { background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '18px', padding: '18px', marginBottom: '12px', cursor: 'pointer' },
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
            {perfil?.nombre ? `Hola, ${perfil.nombre.split(' ')[0]}.` : 'Tu progreso.'}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>

          {/* HÁBITOS */}
          <div style={s.card} onClick={() => router.push('/holaclara/habitos')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Hábitos de hoy</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#2A2520' }}>
                  {total === 0 ? 'Sin hábitos aún' : `${completados} de ${total} completados`}
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#C9A96E', fontFamily: "'Inter Tight', sans-serif" }}>
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

          {/* NIVEL */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', marginBottom: '12px', cursor: 'pointer', height: '200px' }} onClick={() => router.push('/holaclara/progreso')}>
            <img src={nivelActual.img} alt={nivelActual.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '4px 12px', fontSize: '10px', color: '#fff', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Nivel {nivelActual.nivel}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textAlign: 'right' }}>
                  <span style={{ color: '#F5C84A', fontWeight: 700, fontSize: '14px' }}>{puntos}</span> pts
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '30px', color: '#fff', marginBottom: '2px', lineHeight: 1 }}>{nivelActual.nombre}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>{nivelActual.desc}</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#C9A96E,#F5C84A)', width: `${Math.min(progreso, 100)}%` }} />
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
                  {nivelSig ? <>Te faltan <span style={{ color: '#F5C84A', fontWeight: 700 }}>{nivelSig.ptsMin - puntos} pts</span> para ser {nivelSig.nombre}</> : 'Nivel máximo alcanzado ✓'}
                </div>
              </div>
            </div>
          </div>

          {/* CICLO */}
          <div style={s.card} onClick={() => router.push('/holaclara/ciclo')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Ciclo menstrual</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#2A2520' }}>{fase ? fase.nombre : 'Sin registrar'}</div>
                <div style={{ fontSize: '12px', color: '#6B6057', marginTop: '2px' }}>{fase ? 'Toca para registrar cómo estás hoy' : 'Configurar ciclo →'}</div>
              </div>
              {fase && (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `${fase.color}20`, border: `2px solid ${fase.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: fase.color, opacity: 0.7 }} />
                </div>
              )}
            </div>
          </div>

          {/* HISTORIAL */}
          {actividad.length > 0 && (
            <>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px', marginTop: '8px' }}>
                Actividad reciente
              </div>
              <div style={{ background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '18px', padding: '4px 16px' }}>
                {actividad.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: i < actividad.length - 1 ? '0.5px solid rgba(42,37,32,0.06)' : 'none' }}>
                    <ActividadIcon tipo={item.tipo} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#2A2520', marginBottom: '2px', textTransform: 'capitalize' }}>{item.nombre}</div>
                      <div style={{ fontSize: '10px', color: '#9A8F84' }}>{item.tipo} · {formatFecha(item.fecha)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#C9A96E' }}>+{item.pts}</div>
                      <div style={{ fontSize: '9px', color: '#9A8F84' }}>pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {actividad.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', opacity: 0.4 }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '16px', marginBottom: '8px' }}>Tu historia empieza aquí</p>
              <p style={{ fontSize: '13px' }}>Completa hábitos, rituales y journaling para ver tu actividad</p>
            </div>
          )}

          {/* TESTS COMPLETADOS */}
          {tests.length > 0 && (
            <>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px', marginTop: '20px' }}>
                Tests completados
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tests.map((t, i) => {
                  const meta = TEST_META[t.test_slug] || { nombre: t.test_slug, color: '#F5EFE6', acento: '#C9A96E', path: '/holaclara/tests' }
                  const fecha = t.completed_at ? new Date(t.completed_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : ''
                  return (
                    <div key={i} onClick={() => router.push(meta.path)}
                      style={{ background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderLeft: `3px solid ${meta.acento}` }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="5" stroke={meta.acento} strokeWidth="1.2" strokeDasharray="3 2"/>
                          <circle cx="8" cy="8" r="2" stroke={meta.acento} strokeWidth="1.2"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{meta.nombre}</div>
                        <div style={{ fontSize: '11px', color: '#9A8F84', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.resultado_slug}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '10px', color: '#9A8F84' }}>{fecha}</div>
                        <div style={{ fontSize: '10px', color: meta.acento, fontWeight: 700, marginTop: '2px' }}>Ver →</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <TabBar />
      </div>
    </>
  )
}
