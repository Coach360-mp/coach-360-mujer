'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const TESTS = [
  {
    slug: 'descanso',
    titulo: '¿Qué tipo de descanso necesitas?',
    desc: 'Hay 7 tipos de descanso. Probablemente no estás descansando del que más necesitas.',
    duracion: '6 min',
    plan: 'free',
    imagen: '/images/test_descanso_portada.png',
    path: '/holaclara/tests/descanso',
    metodologia: 'Saundra Dalton-Smith',
  },
  {
    slug: 'autocuidado',
    titulo: '¿Cómo te hablas a ti misma?',
    desc: 'El autocuidado no empieza en la bañera. Empieza en cómo te hablas cuando nadie escucha.',
    duracion: '5 min',
    plan: 'esencial',
    imagen: '/images/test_autocuidado_portada.png',
    path: '/holaclara/tests/autocuidado',
    metodologia: 'Lenguaje interno y bienestar',
  },
  {
    slug: 'apego',
    titulo: '¿Cómo amas y cómo necesitas ser amada?',
    desc: 'Tu estilo de apego explica más de tus relaciones que cualquier otra cosa.',
    duracion: '6 min',
    plan: 'esencial',
    imagen: '/images/test_apego_portada.png',
    path: '/holaclara/tests/apego',
    metodologia: 'Teoría del apego',
  },
  {
    slug: 'valores',
    titulo: '¿Estás viviendo lo que de verdad importa?',
    desc: 'No los valores que dices tener. Los que se ven en cómo gastas tu tiempo.',
    duracion: '5 min',
    plan: 'esencial',
    imagen: '/images/test_valores_portada.png',
    path: '/holaclara/tests/valores',
    metodologia: 'ACT — Terapia de Aceptación y Compromiso',
  },
  {
    slug: 'ciclo',
    titulo: '¿En qué fase de tu vida estás?',
    desc: 'No el ciclo hormonal — el ciclo vital. Dónde estás y hacia dónde vas.',
    duracion: '6 min',
    plan: 'esencial',
    imagen: '/images/test_ciclo_portada.png',
    path: '/holaclara/tests/ciclo',
    proximamente: true,
  },
  {
    slug: 'autocompasion',
    titulo: '¿Qué tan compasiva eres contigo misma?',
    desc: 'La autocompasión no es debilidad. Es la base de todo cambio real.',
    duracion: '7 min',
    plan: 'profundo',
    imagen: '/images/test_autocompasion_portada.png',
    path: '/holaclara/tests/autocompasion',
    proximamente: true,
  },
  {
    slug: 'energia',
    titulo: '¿Dónde va tu energía realmente?',
    desc: 'Mapea qué te da energía y qué te la quita. La respuesta va a sorprenderte.',
    duracion: '8 min',
    plan: 'profundo',
    imagen: '/images/test_energia_portada.png',
    path: '/holaclara/tests/energia',
    proximamente: true,
  },
]

const PLAN_ORDER = { free: 0, esencial: 1, profundo: 2 }
const PLAN_LABEL = { free: 'Gratis', esencial: 'Esencial', profundo: 'Profundo' }

export default function TestsPage() {
  const router = useRouter()
  const [planActual, setPlanActual] = useState('free')
  const [completados, setCompletados] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/holaclara/auth'); return }
      const [{ data: perfil }, { data: tests }] = await Promise.all([
        supabase.from('perfiles').select('plan_actual').eq('id', user.id).single(),
        supabase.from('tests_resultados_usuaria').select('test_slug').eq('user_id', user.id),
      ])
      if (perfil?.plan_actual) setPlanActual(perfil.plan_actual)
      if (tests) setCompletados(tests.map(t => t.test_slug))
    })
  }, [])

  const tieneAcceso = (plan) => PLAN_ORDER[planActual] >= PLAN_ORDER[plan]

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)', maxWidth: '420px', margin: '0 auto' },
    body: { maxWidth: '420px', margin: '0 auto', padding: '24px 20px 100px' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <nav style={s.nav}>
          <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', fontSize: '13px', cursor: 'pointer', color: '#6B6057', fontFamily: 'inherit', fontWeight: 700 }}>← volver</button>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#2A2520' }}>Tests</div>
          <div style={{ width: '60px' }} />
        </nav>

        <div style={s.body}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '4px' }}>Autoconocimiento</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', color: '#2A2520', marginBottom: '4px' }}>Descúbrete.</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' }}>cada test te da una pieza nueva</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TESTS.map(test => {
              const acceso = tieneAcceso(test.plan) && !test.proximamente
              const hecho = completados.includes(test.slug)
              return (
                <div key={test.slug} onClick={() => acceso ? router.push(test.path) : router.push('/holaclara/planes')}
                  style={{ borderRadius: '18px', overflow: 'hidden', border: '0.5px solid rgba(42,37,32,0.1)', cursor: 'pointer', background: '#fff', opacity: test.proximamente ? 0.6 : 1 }}>
                  {/* Imagen */}
                  <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                    <img src={test.imagen} alt={test.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 60%)' }} />
                    {/* Badges */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <div style={{ background: acceso ? '#F5EFE6' : 'rgba(42,37,32,0.7)', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: acceso ? '#C9A96E' : '#fff' }}>
                        {test.proximamente ? 'Próximamente' : acceso ? PLAN_LABEL[test.plan] : `🔒 ${PLAN_LABEL[test.plan]}`}
                      </div>
                      {hecho && <div style={{ background: '#5DCAA5', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: 700, color: '#fff' }}>✓ Completado</div>}
                    </div>
                    {test.duracion && <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{test.duracion}</div>}
                  </div>
                  {/* Info */}
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#2A2520', marginBottom: '4px' }}>{test.titulo}</div>
                    <div style={{ fontSize: '12px', color: '#6B6057', lineHeight: 1.5 }}>{test.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <TabBar />
      </div>
    </>
  )
}
