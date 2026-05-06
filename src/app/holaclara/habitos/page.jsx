'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const POOL = {
  mente: [
    { n: 'Escribir 3 intenciones del día', img: '/images/10_mano_naranja.jpg' },
    { n: 'Desconectarme del trabajo a tiempo', img: '/images/13_gradiente_turrell_naranja.jpg' },
    { n: 'Aprender algo nuevo', img: '/images/12_desayuno_sol.jpg' },
    { n: 'Revisar mis valores', img: '/images/09_espigas_mar.jpg' },
  ],
  cuerpo: [
    { n: 'Caminar 20 minutos', img: '/images/09_espigas_mar.jpg' },
    { n: 'Tomar 2 litros de agua', img: '/images/10_mano_naranja.jpg' },
    { n: 'Dormir antes de las 23h', img: '/images/13_gradiente_turrell_naranja.jpg' },
    { n: 'Moverme al despertar', img: '/images/12_desayuno_sol.jpg' },
  ],
  corazon: [
    { n: 'Escribir en mi diario', img: '/images/11_mujer_leyendo_jardin.jpg' },
    { n: 'Tiempo sin pantallas', img: '/images/17_gradiente_turrell_rojo.jpg' },
    { n: 'Llamar a alguien que quiero', img: '/images/15_mujer_pecosa.jpg' },
    { n: 'Hacer algo solo para mí', img: '/images/13_gradiente_turrell_naranja.jpg' },
  ],
  espiritu: [
    { n: 'Meditar 5 minutos', img: '/images/12_desayuno_sol.jpg' },
    { n: 'Momento de gratitud', img: '/images/09_espigas_mar.jpg' },
    { n: 'Leer algo que me nutra', img: '/images/11_mujer_leyendo_jardin.jpg' },
    { n: 'Tiempo en silencio', img: '/images/17_gradiente_turrell_rojo.jpg' },
  ],
}

const CAT_COLORS = { mente: '#378ADD', cuerpo: '#D85A30', corazon: '#7F77DD', espiritu: '#5DCAA5' }
const CAT_LABELS = { mente: 'Mente', cuerpo: 'Cuerpo', corazon: 'Corazón', espiritu: 'Espíritu' }
const ILLUS_BG = { mente: '#E6F1FB', cuerpo: '#FAECE7', corazon: '#EEEDFE', espiritu: '#E1F5EE' }
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const FRECUENCIAS = ['Todos los días', 'Días de semana', 'Fines de semana']

const HABITOS_INICIALES = [
  { id: 1, nombre: 'Meditar 5 minutos', cat: 'espiritu', img: '/images/12_desayuno_sol.jpg', freq: 'Todos los días', completado: true, semana: [true, true, true, false, false, false, false] },
  { id: 2, nombre: 'Escribir en mi diario', cat: 'corazon', img: '/images/11_mujer_leyendo_jardin.jpg', freq: 'Días de semana', completado: false, semana: [true, true, false, false, false, false, false] },
  { id: 3, nombre: 'Caminar 20 minutos', cat: 'cuerpo', img: '/images/09_espigas_mar.jpg', freq: 'Lun, Mié, Vie', completado: false, semana: [true, false, false, false, false, false, false] },
]

export default function HabitosPage() {
  const router = useRouter()
  const [habitos, setHabitos] = useState(HABITOS_INICIALES)
  const [showModal, setShowModal] = useState(false)
  const [selCat, setSelCat] = useState(null)
  const [selHabit, setSelHabit] = useState(null)
  const [selImg, setSelImg] = useState(null)
  const [selFreq, setSelFreq] = useState('Todos los días')
  const [customInput, setCustomInput] = useState('')
  const diaHoy = 2

  const completados = habitos.filter(h => h.completado).length

  const toggleHabito = (id) => {
    setHabitos(prev => prev.map(h => h.id === id ? { ...h, completado: !h.completado } : h))
  }

  const agregarHabito = () => {
    const nombre = customInput.trim() || (selHabit ? selHabit.n : null)
    if (!selCat || !nombre) return
    if (habitos.length >= 3) return
    const isCustom = !!customInput.trim()
    const nuevoHabito = {
      id: Date.now(),
      nombre,
      cat: selCat,
      img: isCustom ? null : selImg,
      freq: selFreq,
      completado: false,
      semana: [false, false, false, false, false, false, false],
    }
    setHabitos(prev => [...prev, nuevoHabito])
    setShowModal(false)
    setSelCat(null)
    setSelHabit(null)
    setSelImg(null)
    setCustomInput('')
    setSelFreq('Todos los días')
  }

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', overflowX: 'hidden' },
    container: { maxWidth: '420px', margin: '0 auto' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoWrap: {},
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    navLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' },
    body: { padding: '24px 20px' },
    eyebrow: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '4px' },
    mainTitle: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', lineHeight: 1.1, marginBottom: '4px' },
    caveatSub: { fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' },
    cardsScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', scrollbarWidth: 'none' },
    card: { flexShrink: 0, width: '150px', borderRadius: '18px', overflow: 'hidden', position: 'relative', cursor: 'pointer' },
    cardImg: { width: '100%', height: '190px', objectFit: 'cover', display: 'block' },
    cardIllus: { width: '100%', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    cardOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' },
    cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 12px' },
    cardCat: { fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '3px' },
    cardName: { fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.25 },
    cardFreq: { fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' },
    checkBtn: (done) => ({
      position: 'absolute', top: '10px', right: '10px',
      width: '26px', height: '26px', borderRadius: '50%',
      border: done ? 'none' : '2px solid rgba(255,255,255,0.4)',
      background: done ? '#C9A96E' : 'rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }),
    weekSection: { marginBottom: '24px' },
    weekLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '12px' },
    weekRow: { display: 'flex', gap: '4px' },
    wDay: { flex: 1, textAlign: 'center' },
    wCircle: (state) => ({
      width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 4px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700,
      background: state === 'done' ? '#C9A96E' : state === 'today' ? 'transparent' : 'rgba(42,37,32,0.07)',
      color: state === 'done' ? '#fff' : state === 'today' ? '#C9A96E' : 'rgba(42,37,32,0.25)',
      border: state === 'today' ? '2px solid #C9A96E' : 'none',
    }),
    wName: { fontSize: '9px', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.5px' },
    addBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px dashed rgba(42,37,32,0.18)', background: 'transparent', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'rgba(42,37,32,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(42,37,32,0.55)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    modal: { background: '#FAFAF7', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', marginBottom: '2px' },
    modalSub: { fontSize: '12px', opacity: 0.35, marginBottom: '18px' },
    catGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' },
    catBtn: (sel) => ({ padding: '10px 12px', borderRadius: '12px', border: sel ? '1.5px solid #C9A96E' : '1px solid rgba(42,37,32,0.12)', background: sel ? '#FBF5EC' : '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#2A2520' }),
    catDot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }),
    poolLabel: { fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '8px' },
    poolList: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', marginBottom: '12px' },
    poolItem: (sel) => ({ padding: '11px 14px', borderRadius: '10px', border: sel ? '1px solid #C9A96E' : '0.5px solid rgba(42,37,32,0.1)', background: sel ? '#FBF5EC' : '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }),
    poolThumb: { width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
    orLine: { textAlign: 'center', fontSize: '11px', opacity: 0.25, margin: '10px 0' },
    customIn: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '0.5px solid rgba(42,37,32,0.15)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' },
    freqRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' },
    freqBtn: (sel) => ({ padding: '7px 14px', borderRadius: '20px', border: '0.5px solid rgba(42,37,32,0.15)', background: sel ? '#2A2520' : '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', cursor: 'pointer', color: sel ? '#FAFAF7' : '#2A2520' }),
    confirmBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' },
  }

  const getDiaState = (idx) => {
    if (idx < diaHoy) return 'done'
    if (idx === diaHoy) return 'today'
    return 'empty'
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>

          {/* NAV */}
          <nav style={s.nav}>
            <div style={s.logoWrap}>
              <div style={s.logoText}>Clara</div>
              <div style={s.goldLine} />
            </div>
            <div style={s.navLabel}>Hábitos</div>
            <button style={s.backBtn} onClick={() => router.push('/holaclara/chat')}>← volver</button>
          </nav>

          {/* BODY */}
          <div style={s.body}>
            <div style={s.eyebrow}>{new Date().toLocaleDateString('es-CL', { weekday: 'long' })}</div>
            <div style={s.mainTitle}>Tus hábitos</div>
            <div style={s.caveatSub}>{completados} de {habitos.length} completados</div>

            {/* TARJETAS */}
            <div style={s.cardsScroll}>
              {habitos.map(h => (
                <div key={h.id} style={s.card}>
                  {h.img
                    ? <img src={h.img} alt="" style={s.cardImg} />
                    : <div style={{ ...s.cardIllus, background: ILLUS_BG[h.cat] }}>
                        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                          <circle cx="26" cy="26" r="20" stroke={CAT_COLORS[h.cat]} strokeWidth="1.5" strokeDasharray="5 3" />
                          <circle cx="26" cy="26" r="7" fill={CAT_COLORS[h.cat]} opacity="0.4" />
                        </svg>
                      </div>
                  }
                  <div style={s.cardOverlay} />
                  <div style={s.cardContent}>
                    <div style={s.cardCat}>{CAT_LABELS[h.cat]}</div>
                    <div style={s.cardName}>{h.nombre}</div>
                    <div style={s.cardFreq}>{h.freq}</div>
                  </div>
                  <button style={s.checkBtn(h.completado)} onClick={() => toggleHabito(h.id)}>
                    {h.completado && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <polyline points="1,5 4.5,8.5 11,1.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* SEMANA */}
            <div style={s.weekSection}>
              <div style={s.weekLabel}>Esta semana</div>
              <div style={s.weekRow}>
                {DIAS.map((d, i) => (
                  <div key={d} style={s.wDay}>
                    <div style={s.wCircle(getDiaState(i))}>{d[0]}</div>
                    <div style={s.wName}>{d.toLowerCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AGREGAR */}
            {habitos.length < 3 && (
              <button style={s.addBtn} onClick={() => setShowModal(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="7" y1="1" x2="7" y2="13" stroke="rgba(42,37,32,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="1" y1="7" x2="13" y2="7" stroke="rgba(42,37,32,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Agregar hábito
              </button>
            )}
            {habitos.length >= 3 && (
              <p style={{ textAlign: 'center', fontSize: '12px', opacity: 0.35, marginTop: '8px' }}>Máximo 3 hábitos activos</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Nuevo hábito</div>
            <div style={s.modalSub}>Elige una categoría para empezar</div>

            <div style={s.catGrid}>
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <button key={key} style={s.catBtn(selCat === key)} onClick={() => { setSelCat(key); setSelHabit(null); setSelImg(null); setCustomInput('') }}>
                  <span style={s.catDot(CAT_COLORS[key])} />
                  {label}
                </button>
              ))}
            </div>

            {selCat && (
              <>
                <div style={s.poolLabel}>Elige del banco</div>
                <div style={s.poolList}>
                  {POOL[selCat].map((item) => (
                    <div key={item.n} style={s.poolItem(selHabit?.n === item.n)} onClick={() => { setSelHabit(item); setSelImg(item.img); setCustomInput('') }}>
                      <img src={item.img} alt="" style={s.poolThumb} />
                      <span>{item.n}</span>
                    </div>
                  ))}
                </div>

                <div style={s.orLine}>— o escribe el tuyo —</div>
                <input
                  style={s.customIn}
                  placeholder="Ej: Salir a caminar al parque"
                  value={customInput}
                  onChange={(e) => { setCustomInput(e.target.value); setSelHabit(null); setSelImg(null) }}
                />

                <div style={s.poolLabel}>Frecuencia</div>
                <div style={s.freqRow}>
                  {FRECUENCIAS.map(f => (
                    <button key={f} style={s.freqBtn(selFreq === f)} onClick={() => setSelFreq(f)}>{f}</button>
                  ))}
                </div>

                <button style={s.confirmBtn} onClick={agregarHabito}>Agregar hábito</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
