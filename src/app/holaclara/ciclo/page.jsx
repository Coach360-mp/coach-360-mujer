'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FASES = {
  mens: {
    key: 'mens',
    name: 'Fase Menstrual',
    desc: 'tiempo de descanso y soltar',
    dias: 'Días 1–5',
    proxima: 'Fase folicular en 3 días',
    clara: '"Tu cuerpo pide pausa. Honrar ese ritmo no es rendirse — es inteligencia."',
    color: '#F0997B',
    sintomas: ['Cansada', 'Con dolor', 'Introspectiva', 'Sensible', 'Necesito calma', 'Sin energía'],
  },
  fol: {
    key: 'fol',
    name: 'Fase Folicular',
    desc: 'energía en ascenso, nuevos comienzos',
    dias: 'Días 6–13',
    proxima: 'Ovulación en 2 días',
    clara: '"Estás despertando. Es buen momento para arrancar proyectos que llevas postergando."',
    color: '#5DCAA5',
    sintomas: ['Con energía', 'Optimista', 'Creativa', 'Sociable', 'Motivada', 'Liviana'],
  },
  ov: {
    key: 'ov',
    name: 'Fase de Ovulación',
    desc: 'tu energía está en su punto más alto',
    dias: 'Días 14–16',
    proxima: 'Fase lútea en 4 días',
    clara: '"Estás en tu fase más expansiva. Es buen momento para las conversaciones difíciles que llevas postergando."',
    color: '#C9A96E',
    sintomas: ['Con energía', 'Creativa', 'Sociable', 'Ansiosa', 'Con dolor', 'Expansiva'],
  },
  lut: {
    key: 'lut',
    name: 'Fase Lútea',
    desc: 'introspección y cierre de ciclos',
    dias: 'Días 17–28',
    proxima: 'Menstruación en 5 días',
    clara: '"Tu intuición está afinada. Lo que sientes con fuerza en esta fase vale la pena escucharlo."',
    color: '#7F77DD',
    sintomas: ['Sensible', 'Irritable', 'Introspectiva', 'Cansada', 'Con antojos', 'Reflexiva'],
  },
}

const ORDEN_FASES = ['mens', 'fol', 'ov', 'lut']
const LABELS = { mens: 'Mens.', fol: 'Folic.', ov: 'Ovul.', lut: 'Lútea' }

// Segmentos SVG para cada fase (dasharray, dashoffset)
const SEGMENTOS = {
  mens: { dasharray: '56 397', dashoffset: '56' },
  fol:  { dasharray: '113 340', dashoffset: '0' },
  ov:   { dasharray: '56 397', dashoffset: '-113' },
  lut:  { dasharray: '170 283', dashoffset: '-169' },
}

export default function CicloPage() {
  const router = useRouter()
  const [faseSel, setFaseSel] = useState('ov')
  const [diaActual] = useState(14)
  const [sintomasSel, setSintomasSel] = useState(['Con energía'])

  const fase = FASES[faseSel]

  const toggleSintoma = (s) => {
    setSintomasSel(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

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
      opacity: faseSel === key ? 1 : 0.3,
      color: FASES[key].color,
      transition: 'opacity 0.2s',
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
      background: sel ? '#2A2520' : '#fff',
      color: sel ? '#FAFAF7' : '#2A2520',
      transition: 'all 0.15s',
    }),
    clara: { background: '#F5EFE6', borderRadius: '16px', padding: '16px', borderLeft: '3px solid #C9A96E', marginBottom: '32px' },
    claraLabel: { fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.4, marginBottom: '6px', fontWeight: 700 },
    claraText: { fontSize: '13px', lineHeight: 1.6, fontFamily: "'Fraunces', serif", fontStyle: 'italic' },
    irregular: { textAlign: 'center', marginBottom: '20px' },
    irregularBtn: { background: 'transparent', border: 'none', fontSize: '11px', opacity: 0.35, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', color: '#2A2520' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>

          {/* NAV */}
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

            {/* RUEDA */}
            <div style={s.wheelWrap}>
              <svg width="200" height="200" viewBox="0 0 190 190">
                {ORDEN_FASES.map(key => {
                  const seg = SEGMENTOS[key]
                  const activa = faseSel === key
                  return (
                    <circle
                      key={key}
                      cx="95" cy="95" r="72"
                      fill="none"
                      stroke={FASES[key].color}
                      strokeWidth={activa ? 18 : 14}
                      strokeDasharray={seg.dasharray}
                      strokeDashoffset={seg.dashoffset}
                      strokeLinecap="round"
                      opacity={activa ? 1 : 0.3}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setFaseSel(key)}
                    />
                  )
                })}
                <circle cx="95" cy="95" r="54" fill="#FAFAF7" />
                <text x="95" y="91" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="30" fill={fase.color} fontWeight="600">{diaActual}</text>
                <text x="95" y="109" textAnchor="middle" fontFamily="Inter Tight, sans-serif" fontSize="9" fill="#2A2520" opacity="0.4" letterSpacing="1">DÍA</text>
              </svg>

              {/* ETIQUETAS */}
              <div style={s.faseLabels}>
                {ORDEN_FASES.map(key => (
                  <div key={key} style={s.faseLabel(key)} onClick={() => setFaseSel(key)}>
                    {LABELS[key]}
                  </div>
                ))}
              </div>
            </div>

            {/* BADGE FASE */}
            <div style={s.faseBadge}>
              <div style={s.faseNombre}>{fase.name}</div>
              <div style={s.faseCaveat}>{fase.desc}</div>
            </div>

            {/* PRÓXIMA FASE */}
            <div style={s.prox}>
              Próxima fase: <span style={s.proxSpan}>{fase.proxima}</span>
            </div>

            {/* SÍNTOMAS */}
            <div style={s.sintLabel}>Cómo estoy hoy</div>
            <div style={s.sints}>
              {fase.sintomas.map(sint => (
                <button key={sint} style={s.sint(sintomasSel.includes(sint))} onClick={() => toggleSintoma(sint)}>
                  {sint}
                </button>
              ))}
            </div>

            {/* CLARA */}
            <div style={s.clara}>
              <div style={s.claraLabel}>Clara dice</div>
              <div style={s.claraText}>{fase.clara}</div>
            </div>

            {/* CICLO IRREGULAR */}
            <div style={s.irregular}>
              <button style={s.irregularBtn}>Mi ciclo es irregular</button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
