'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const NIVELES = [
  {
    nivel: 1,
    nombre: 'Semilla',
    ptsMin: 0,
    ptsMax: 200,
    img: '/images/nivel_semilla.png',
    desc: '"Estás aquí porque algo en ti quiere cambiar. No sabes bien qué, pero lo sientes. Eso ya es suficiente para empezar."',
    requisitos: [
      { key: 'tests_completados', label: '1 test completado', meta: 1, pts: 20 },
      { key: 'rituales_completados', label: '10 rituales', meta: 10, pts: 5 },
      { key: 'journaling_completados', label: '5 entradas de journaling', meta: 5, pts: 10 },
      { key: 'conversaciones', label: '10 conversaciones con Clara', meta: 10, pts: 5 },
    ],
    siguiente: 'Brote',
    siguienteDesc: 'Ya empezaste. Eso es más de lo que hace la mayoría. Algo en ti está despertando.',
    desbloquea: [
      'Tests de profundidad (T02, T03)',
      'Programa: 3 días para soltar la culpa',
      'Journaling: Carta a la mujer que era',
    ],
  },
  {
    nivel: 2,
    nombre: 'Brote',
    ptsMin: 200,
    ptsMax: 600,
    img: '/images/nivel_brote.png',
    desc: '"Ya empezaste. Cada ritual, cada conversación, cada línea que escribiste cuenta. Estás creciendo aunque no siempre lo veas."',
    requisitos: [
      { key: 'tests_completados', label: '3 tests completados', meta: 3, pts: 20 },
      { key: 'rituales_completados', label: '30 rituales', meta: 30, pts: 5 },
      { key: 'journaling_completados', label: '15 entradas de journaling', meta: 15, pts: 10 },
      { key: 'conversaciones', label: '30 conversaciones con Clara', meta: 30, pts: 5 },
      { key: 'programas_completados', label: '1 programa multi-día', meta: 1, pts: 50 },
    ],
    siguiente: 'Flor',
    siguienteDesc: 'Te estás abriendo. Las preguntas que te haces ahora son distintas a las de antes.',
    desbloquea: [
      'Tests de profundidad (T04, T05)',
      'Programa: 7 días para volver a ti',
      'Conversación temática: Diseñar mi semana',
      'Journaling Esencial: Lo que me digo',
    ],
  },
  {
    nivel: 3,
    nombre: 'Flor',
    ptsMin: 600,
    ptsMax: 1500,
    img: '/images/nivel_flor.png',
    desc: '"Te estás conociendo de verdad. No la versión que presentas al mundo — tú. La que aparece cuando nadie mira."',
    requisitos: [
      { key: 'tests_completados', label: '5 tests completados', meta: 5, pts: 20 },
      { key: 'rituales_completados', label: '60 rituales', meta: 60, pts: 5 },
      { key: 'journaling_completados', label: '30 entradas de journaling', meta: 30, pts: 10 },
      { key: 'conversaciones', label: '60 conversaciones con Clara', meta: 60, pts: 5 },
      { key: 'programas_completados', label: '2 programas multi-día', meta: 2, pts: 50 },
    ],
    siguiente: 'Fruto',
    siguienteDesc: 'Lo que sembraste está dando frutos reales en tu vida cotidiana.',
    desbloquea: [
      'Tests Premium (T06, T07, T08)',
      'Programa: 5 días para reconectar',
      'Conversación: Esta decisión que no tomo',
      'Plan personalizado de 30 días por Clara',
    ],
  },
  {
    nivel: 4,
    nombre: 'Fruto',
    ptsMin: 1500,
    ptsMax: 3500,
    img: '/images/nivel_fruto.png',
    desc: '"Lo que empezó como una pregunta se convirtió en forma de vivir. Estás cosechando lo que sembraste con valentía."',
    requisitos: [
      { key: 'tests_completados', label: 'Todos los tests (8)', meta: 8, pts: 20 },
      { key: 'rituales_completados', label: '100 rituales', meta: 100, pts: 5 },
      { key: 'journaling_completados', label: '50 entradas de journaling', meta: 50, pts: 10 },
      { key: 'conversaciones', label: '100 conversaciones con Clara', meta: 100, pts: 5 },
      { key: 'programas_completados', label: '4 programas completados', meta: 4, pts: 50 },
    ],
    siguiente: 'Raíz',
    siguienteDesc: 'Eres tu propio suelo. Clara sigue aquí, pero tú ya sabes cómo volverte.',
    desbloquea: [
      'Programa exclusivo: 7 días para decir no',
      'Conversación: Mi relación con [persona]',
      'Acceso completo a todas las herramientas',
      'Insignia Fruto en tu perfil',
    ],
  },
  {
    nivel: 5,
    nombre: 'Raíz',
    ptsMin: 3500,
    ptsMax: 9999,
    img: '/images/nivel_raiz.png',
    desc: '"Llegaste al lugar desde donde todo crece. No porque hayas terminado — sino porque ya eres tu propio suelo. Desde aquí, todo es posible."',
    requisitos: [],
    siguiente: null,
    siguienteDesc: null,
    desbloquea: [],
  },
]

function calcularNivel(stats) {
  const pts = stats?.puntos_totales || 0
  if (pts >= 3500) return 5
  if (pts >= 1500) return 4
  if (pts >= 600) return 3
  if (pts >= 200) return 2
  return 1
}

export default function ProgresoPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/holaclara/auth'); return }
      const { data } = await supabase.from('puntos_usuaria').select('*').eq('user_id', user.id).single()
      setStats(data || { puntos_totales: 0, nivel: 1, rituales_completados: 0, journaling_completados: 0, conversaciones: 0, tests_completados: 0, programas_completados: 0 })
      setCargando(false)
    })
  }, [])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  const nivelNum = calcularNivel(stats)
  const nivelData = NIVELES[nivelNum - 1]
  const nivelSig = NIVELES[nivelNum] || null
  const pts = stats?.puntos_totales || 0
  const progresoPct = nivelSig
    ? Math.min(((pts - nivelData.ptsMin) / (nivelSig.ptsMin - nivelData.ptsMin)) * 100, 100)
    : 100

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    body: { padding: '20px 20px 100px' },
    card: { background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '16px', padding: '16px', marginBottom: '10px' },
    sectionLabel: { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>

        {/* HERO */}
        <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <img src={nivelData.img} alt={nivelData.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.05) 100%)' }} />
          <button onClick={() => router.back()} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← volver
          </button>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '3px 12px', fontSize: '10px', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
              Nivel {nivelNum} · Tu nivel actual
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '36px', color: '#fff', lineHeight: 1, marginBottom: '4px' }}>{nivelData.nombre}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: '#F5C84A', fontWeight: 700 }}>{pts}</span> de {nivelData.ptsMax} pts
            </div>
            {/* Barra de progreso en hero */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginTop: '10px' }}>
              <div style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg,#C9A96E,#F5C84A)', width: `${progresoPct}%` }} />
            </div>
          </div>
        </div>

        <div style={s.body}>

          {/* DESCRIPCIÓN */}
          <div style={{ background: '#F5EFE6', borderRadius: '14px', padding: '16px', borderLeft: '3px solid #C9A96E', marginBottom: '24px' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '15px', color: '#2A2520', lineHeight: 1.7 }}>{nivelData.desc}</div>
          </div>

          {/* REQUISITOS */}
          {nivelSig && nivelData.requisitos.length > 0 && (
            <>
              <div style={s.sectionLabel}>Para convertirte en {nivelSig.nombre}</div>
              <div style={{ marginBottom: '24px' }}>
                {nivelData.requisitos.map((req, i) => {
                  const actual = stats?.[req.key] || 0
                  const done = actual >= req.meta
                  const pct = Math.min((actual / req.meta) * 100, 100)
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#C9A96E' : 'rgba(42,37,32,0.08)', border: done ? 'none' : '1px solid rgba(42,37,32,0.15)', marginTop: '2px' }}>
                        {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{req.label}</div>
                        {done
                          ? <div style={{ fontSize: '11px', color: '#C9A96E', fontWeight: 700 }}>✓ Completado</div>
                          : <>
                              <div style={{ fontSize: '11px', color: '#9A8F84', marginBottom: '5px' }}>{actual} de {req.meta}</div>
                              <div style={{ height: '3px', background: 'rgba(42,37,32,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: '2px', background: '#C9A96E', width: `${pct}%` }} />
                              </div>
                            </>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* SIGUIENTE NIVEL */}
          {nivelSig && (
            <>
              <div style={s.sectionLabel}>El siguiente nivel</div>
              <div style={{ background: '#2A2520', borderRadius: '16px', padding: '18px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                <img src={nivelSig.img} alt={nivelSig.nombre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '6px' }}>Nivel {nivelNum + 1}</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '24px', color: '#fff', marginBottom: '6px' }}>{nivelSig.nombre}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{nivelSig.siguienteDesc || nivelData.siguienteDesc}</div>
                </div>
              </div>
            </>
          )}

          {nivelNum === 5 && (
            <div style={{ background: '#2A2520', borderRadius: '16px', padding: '18px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#C9A96E', marginBottom: '8px' }}>Nivel máximo alcanzado</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Eres tu propio suelo. Sigue creciendo desde aquí.</div>
            </div>
          )}

          {/* LO QUE SE DESBLOQUEA */}
          {nivelSig && nivelSig.desbloquea?.length > 0 && (
            <>
              <div style={s.sectionLabel}>Se desbloquea en {nivelSig.nombre}</div>
              {nivelSig.desbloquea.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', padding: '12px 14px', background: '#fff', border: '0.5px solid rgba(42,37,32,0.1)', borderRadius: '12px', opacity: 0.55 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A96E', flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: '#2A2520', fontWeight: 500 }}>{item}</div>
                  <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#9A8F84', fontWeight: 700 }}>🔒</div>
                </div>
              ))}
            </>
          )}

        </div>
        <TabBar />
      </div>
    </>
  )
}
