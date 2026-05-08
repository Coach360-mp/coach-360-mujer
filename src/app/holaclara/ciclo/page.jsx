'use client'
import TabBar from '../components/TabBar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const FASES = {
  mens: {
    key: 'mens',
    name: 'Fase Menstrual',
    desc: 'tiempo de descanso y soltar',
    proxima: 'Fase folicular en 3 días',
    clara: '"Tu cuerpo pide pausa. Honrar ese ritmo no es rendirse — es inteligencia."',
    color: '#F0997B',
    sintomas: ['Cansada', 'Con dolor', 'Introspectiva', 'Sensible', 'Necesito calma', 'Sin energía'],
  },
  fol: {
    key: 'fol',
    name: 'Fase Folicular',
    desc: 'energía en ascenso, nuevos comienzos',
    proxima: 'Ovulación en 2 días',
    clara: '"Estás despertando. Es buen momento para arrancar proyectos que llevas postergando."',
    color: '#5DCAA5',
    sintomas: ['Con energía', 'Optimista', 'Creativa', 'Sociable', 'Motivada', 'Liviana'],
  },
  ov: {
    key: 'ov',
    name: 'Fase de Ovulación',
    desc: 'tu energía está en su punto más alto',
    proxima: 'Fase lútea en 4 días',
    clara: '"Estás en tu fase más expansiva. Es buen momento para las conversaciones difíciles que llevas postergando."',
    color: '#C9A96E',
    sintomas: ['Con energía', 'Creativa', 'Sociable', 'Ansiosa', 'Con dolor', 'Expansiva'],
  },
  lut: {
    key: 'lut',
    name: 'Fase Lútea',
    desc: 'introspección y cierre de ciclos',
    proxima: 'Menstruación en 5 días',
    clara: '"Tu intuición está afinada. Lo que sientes con fuerza en esta fase vale la pena escucharlo."',
    color: '#7F77DD',
    sintomas: ['Sensible', 'Irritable', 'Introspectiva', 'Cansada', 'Con antojos', 'Reflexiva'],
  },
}

const ORDEN_FASES = ['mens', 'fol', 'ov', 'lut']
const LABELS = { mens: 'Mens.', fol: 'Folic.', ov: 'Ovul.', lut: 'Lútea' }
const SEGMENTOS = {
  mens: { dasharray: '56 397', dashoffset: '56' },
  fol:  { dasharray: '113 340', dashoffset: '0' },
  ov:   { dasharray: '56 397', dashoffset: '-113' },
  lut:  { dasharray: '170 283', dashoffset: '-169' },
}

function calcularFase(fechaUltimoPeriodo) {
  if (!fechaUltimoPeriodo) return { fase: 'ov', dia: 14 }
  const hoy = new Date()
  const inicio = new Date(fechaUltimoPeriodo)
  const diff = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
  const dia = (diff % 28) + 1
  if (dia <= 5) return { fase: 'mens', dia }
  if (dia <= 13) return { fase: 'fol', dia }
  if (dia <= 16) return { fase: 'ov', dia }
  return { fase: 'lut', dia }
}

export default function CicloPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [faseSel, setFaseSel] = useState('ov')
  const [diaActual, setDiaActual] = useState(14)
  const [sintomasSel, setSintomasSel] = useState([])
  const [cicloIrregular, setCicloIrregular] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => { inicializar() }, [])

  async function inicializar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/holaclara/auth'); return }
    setUsuario(user)

    const { data: perfil } = await supabase
      .from('perfiles').select('fecha_ultimo_periodo, tracking_ciclo_activo').eq('id', user.id).single()

    if (perfil?.fecha_ultimo_periodo) {
      const { fase, dia } = calcularFase(perfil.fecha_ultimo_periodo)
      setFaseSel(fase)
      setDiaActual(dia)
    }

    const hoy = new Date().toISOString().split('T')[0]
    const { data: registro } = await supabase
      .from('registro_ciclo').select('*').eq('usuario_id', user.id).eq('created_at::date', hoy).maybeSingle()

    if (registro?.sintomas?.length) setSintomasSel(registro.sintomas)
    if (registro?.ciclo_irregular) setCicloIrregular(true)

    setCargando(false)
  }

  async function guardarRegistro() {
    if (!usuario || guardando) return
    setGuardando(true)
    const hoy = new Date().toISOString().split('T')[0]

    await supabase.from('registro_ciclo').upsert({
      usuario_id: usuario.id,
      fase: faseSel,
      sintomas: sintomasSel,
      dia_ciclo: diaActual,
      ciclo_irregular: cicloIrregular,
      created_at: new Date().toISOString(),
    }, { onConflict: 'usuario_id,created_at::date' })

    await supabase.from('perfiles').update({ fase_ciclo_actual: faseSel }).eq('id', usuario.id)

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2000)
  }

  const toggleSintoma = (s) => {
    setSintomasSel(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const fase = FASES[faseSel]

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    container: { maxWidth: '420px', margin: '0 auto' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    navLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' },
    body: { padding: '24px 20px' },
    eyebrow: { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '4px' },
    mainTitle: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '26px', marginBottom: '20px' },
    wheelWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' },
    faseLabels: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '12px', padding: '0 4px' },
    faseLabel: (key) => ({
      flex: 1, textAlign: 'center', fontSize: '10px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer',
      opacity: faseSel === key ? 1 : 0.3, color: FASES[key].color, transition: 'opacity 0.2s',
    }),
    faseBadge: { textAlign: 'center', marginBottom: '16px' },
    faseNombre: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px' },
    faseCaveat: { fontFamily: "'Caveat', cursive", fontSize: '15px', color: '#C9A96E', marginTop: '2px' },
    prox: { fontSize: '11px', opacity: 0.4, marginBottom: '20px', padding: '10px 14px', background: '#fff', borderRadius: '12px', border: '0.5px solid rgba(42,37,32,0.08)' },
    proxSpan: { color: '#C9A96E', fontWeight: 700 },
    sintLabel: { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '10px' },
    sints: { display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '20px' },
    sint: (sel) => ({
      padding: '7px 13px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit',
      border: sel ? 'none' : '0.5px solid rgba(42,37,32,0.15)',
      background: sel ? '#2A2520' : '#fff', color: sel ? '#FAFAF7' : '#2A2520', transition: 'all 0.15s',
    }),
    clara: { background: '#F5EFE6', borderRadius: '16px', padding: '16px', borderLeft: '3px solid #C9A96E', marginBottom: '20px' },
    claraLabel: { fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.4, marginBottom: '6px', fontWeight: 700 },
    claraText: { fontSize: '13px', lineHeight: 1.6, fontFamily: "'Fraunces', serif", fontStyle: 'italic' },
    guardarBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: guardado ? '#5DCAA5' : '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: '16px', transition: 'background 0.3s' },
    irregular: { textAlign: 'center', marginBottom: '24px' },
    irregularBtn: { background: 'transparent', border: 'none', fontSize: '11px', opacity: 0.35, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', color: '#2A2520' },
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <nav style={s.nav}>
            <div>
              <div style={s.logoText}>Clara</div>
              <div style={s.goldLine} />
            </div>
            <div style={s.navLabel}>Ciclo</div>
            <button style={s.backBtn} onClick={() => router.push('/holaclara/chat')}>← volver</button>
          </nav>

          <div style={s.body}>
            <div style={s.eyebrow}>Día {diaActual} de tu ciclo</div>
            <div style={s.mainTitle}>Tu momento</div>

            <div style={s.wheelWrap}>
              <svg width="200" height="200" viewBox="0 0 190 190">
                {ORDEN_FASES.map(key => {
                  const seg = SEGMENTOS[key]
                  const activa = faseSel === key
                  return (
                    <circle key={key} cx="95" cy="95" r="72" fill="none"
                      stroke={FASES[key].color} strokeWidth={activa ? 18 : 14}
                      strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset}
                      strokeLinecap="round" opacity={activa ? 1 : 0.3}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setFaseSel(key)}
                    />
                  )
                })}
                <circle cx="95" cy="95" r="54" fill="#FAFAF7" />
                <text x="95" y="91" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="30" fill={fase.color} fontWeight="600">{diaActual}</text>
                <text x="95" y="109" textAnchor="middle" fontFamily="Inter Tight, sans-serif" fontSize="9" fill="#2A2520" opacity="0.4" letterSpacing="1">DÍA</text>
              </svg>
              <div style={s.faseLabels}>
                {ORDEN_FASES.map(key => (
                  <div key={key} style={s.faseLabel(key)} onClick={() => setFaseSel(key)}>{LABELS[key]}</div>
                ))}
              </div>
            </div>

            <div style={s.faseBadge}>
              <div style={s.faseNombre}>{fase.name}</div>
              <div style={s.faseCaveat}>{fase.desc}</div>
            </div>

            {!cicloIrregular && (
              <div style={s.prox}>
                Próxima fase: <span style={s.proxSpan}>{fase.proxima}</span>
              </div>
            )}

            <div style={s.sintLabel}>Cómo estoy hoy</div>
            <div style={s.sints}>
              {fase.sintomas.map(sint => (
                <button key={sint} style={s.sint(sintomasSel.includes(sint))} onClick={() => toggleSintoma(sint)}>
                  {sint}
                </button>
              ))}
            </div>

            <div style={s.clara}>
              <div style={s.claraLabel}>Clara dice</div>
              <div style={s.claraText}>{fase.clara}</div>
            </div>

            <button style={s.guardarBtn} onClick={guardarRegistro}>
              {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar registro de hoy'}
            </button>

            <div style={s.irregular}>
              <button style={s.irregularBtn} onClick={() => setCicloIrregular(!cicloIrregular)}>
                {cicloIrregular ? 'Tengo ciclo regular' : 'Mi ciclo es irregular'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <TabBar />
    </>
  )
}
